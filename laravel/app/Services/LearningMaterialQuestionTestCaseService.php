<?php

namespace App\Services;

use App\Models\LearningMaterialQuestionTestCase;
use App\Repositories\LearningMaterialQuestionTestCaseRepository;
use App\Support\Enums\ProgrammingLanguageEnum;
use App\Support\Interfaces\Repositories\LearningMaterialQuestionTestCaseRepositoryInterface;
use App\Support\Interfaces\Services\LearningMaterialQuestionTestCaseServiceInterface;
use App\Traits\Services\HandlesFileUpload;
use App\Traits\Services\HandlesPageSizeAll;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Csv;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class LearningMaterialQuestionTestCaseService extends BaseCrudService implements LearningMaterialQuestionTestCaseServiceInterface {
    use HandlesFileUpload, HandlesPageSizeAll;

    /**
     * The base directory for test case output files
     *
     * @var string
     */
    protected $baseDirectory = 'learning-material-question-test-cases';

    /**
     * Create a new test case
     */
    public function create(array $data): ?Model {
        // Handle file upload with extension included in filename
        if (isset($data['expected_output_file'])) {
            $extension = $data['expected_output_file']->getClientOriginalExtension();
            $filePath = $this->storeFile($data['expected_output_file'], $this->baseDirectory);

            if ($filePath) {
                $pathInfo = pathinfo($filePath);
                $data['expected_output_file'] = $pathInfo['basename']; // Store filename with extension
                $data['expected_output_file_extension'] = $extension; // Keep for compatibility
            }
        }

        return parent::create($data);
    }

    public function update($keyOrModel, array $data): ?Model {
        // Handle file upload for updates
        if (isset($data['expected_output_file'])) {
            // Get existing record to delete old file if exists
            $existingRecord = $this->repository->find($keyOrModel);
            if ($existingRecord && $existingRecord->expected_output_file) {
                $this->deleteFile($this->baseDirectory . '/' . $existingRecord->expected_output_file);
            }

            $extension = $data['expected_output_file']->getClientOriginalExtension();
            $filePath = $this->storeFile($data['expected_output_file'], $this->baseDirectory);

            if ($filePath) {
                $pathInfo = pathinfo($filePath);
                $data['expected_output_file'] = $pathInfo['basename']; // Store filename with extension
                $data['expected_output_file_extension'] = $extension; // Keep for compatibility
            }
        }

        return parent::update($keyOrModel, $data);
    }

    public function delete($keyOrModel): bool {
        // Get existing record to delete old file if exists
        $existingRecord = $this->repository->find($keyOrModel);
        if ($existingRecord && $existingRecord->expected_output_file) {
            $this->deleteFile($this->baseDirectory . '/' . $existingRecord->expected_output_file);
        }

        return parent::delete($keyOrModel);
    }

    public function getAllPaginated(array $search = [], int $pageSize = 15): LengthAwarePaginator {
        $this->handlePageSizeAll();

        return parent::getAllPaginated($search, $pageSize);
    }

    /**
     * Import test cases from a file.
     */
    public function import(Request $request) {
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|mimes:csv,xlsx,xls',
            'learning_material_question_id' => 'required|exists:learning_material_questions,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $file = $request->file('file');
        $questionId = $request->input('learning_material_question_id');

        try {
            $spreadsheet = IOFactory::load($file->getPathname());
            $worksheet = $spreadsheet->getActiveSheet();
            $data = $worksheet->toArray();

            // Remove header row
            array_shift($data);

            $successCount = 0;
            $errors = [];

            foreach ($data as $index => $row) {
                $rowNumber = $index + 2; // +2 because we removed header and arrays are 0-indexed

                // Skip empty rows
                if (empty(array_filter($row))) {
                    continue;
                }

                try {
                    $testCaseData = [
                        'learning_material_question_id' => $questionId,
                        'description' => $row[0] ?? null,
                        'language' => $row[1] ?? ProgrammingLanguageEnum::PYTHON->value,
                        'input' => $row[2] ?? null,
                        'hidden' => $this->parseBooleanValue($row[3] ?? 'true'),
                        'active' => $this->parseBooleanValue($row[4] ?? 'true'),
                    ];

                    // Validate the data
                    $rowValidator = Validator::make($testCaseData, [
                        'learning_material_question_id' => 'required|exists:learning_material_questions,id',
                        'description' => 'nullable|string',
                        'language' => 'required|string',
                        'input' => 'required|string',
                        'hidden' => 'boolean',
                        'active' => 'boolean',
                    ]);

                    if ($rowValidator->fails()) {
                        $errors[] = "Row {$rowNumber}: " . implode(', ', $rowValidator->errors()->all());

                        continue;
                    }

                    // Create the test case
                    LearningMaterialQuestionTestCase::create($testCaseData);
                    $successCount++;

                } catch (\Exception $e) {
                    $errors[] = "Row {$rowNumber}: " . $e->getMessage();
                    Log::error("Test case import error on row {$rowNumber}", [
                        'error' => $e->getMessage(),
                        'data' => $row,
                    ]);
                }
            }

            return response()->json([
                'message' => "Import completed. {$successCount} test cases imported successfully.",
                'success_count' => $successCount,
                'errors' => $errors,
            ]);

        } catch (\Exception $e) {
            Log::error('Test case import failed', ['error' => $e->getMessage()]);

            return response()->json(['error' => 'Failed to process the file: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Download a CSV template file for importing test cases.
     */
    public function downloadTemplate(): BinaryFileResponse {
        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();

        // Set headers
        $headers = [
            'description',
            'programming_language',
            'input',
            'is_hidden',
            'is_active',
        ];

        $sheet->fromArray([$headers], null, 'A1');

        // Add sample data
        $sampleData = [
            [
                'Test basic functionality',
                'python',
                "print('Hello, World!')",
                'false',
                'true',
            ],
            [
                'Test edge case',
                'python',
                "self.assertIn('len(result) > 0', student_code)",
                'true',
                'true',
            ],
        ];

        $sheet->fromArray($sampleData, null, 'A2');

        // Auto-size columns
        foreach (range('A', 'E') as $column) {
            $sheet->getColumnDimension($column)->setAutoSize(true);
        }

        $writer = new Csv($spreadsheet);
        $fileName = 'test_cases_import_template_' . date('Y-m-d_H-i-s') . '.csv';
        $tempFile = tempnam(sys_get_temp_dir(), $fileName);

        $writer->save($tempFile);

        return response()->download($tempFile, $fileName)->deleteFileAfterSend(true);
    }

    /**
     * Download an Excel template file for importing test cases.
     */
    public function downloadExcelTemplate(): BinaryFileResponse {
        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();

        // Set headers
        $headers = [
            'description',
            'programming_language',
            'input',
            'is_hidden',
            'is_active',
        ];

        $sheet->fromArray([$headers], null, 'A1');

        // Add sample data
        $sampleData = [
            [
                'Test basic functionality',
                'python',
                "print('Hello, World!')",
                'false',
                'true',
            ],
            [
                'Test edge case',
                'python',
                "self.assertIn('len(result) > 0', student_code)",
                'true',
                'true',
            ],
        ];

        $sheet->fromArray($sampleData, null, 'A2');

        // Auto-size columns
        foreach (range('A', 'E') as $column) {
            $sheet->getColumnDimension($column)->setAutoSize(true);
        }

        // Style the header row
        $headerStyle = [
            'font' => ['bold' => true],
            'fill' => [
                'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                'startColor' => ['rgb' => 'E2E8F0'],
            ],
        ];
        $sheet->getStyle('A1:E1')->applyFromArray($headerStyle);

        $writer = new Xlsx($spreadsheet);
        $fileName = 'test_cases_import_template_' . date('Y-m-d_H-i-s') . '.xlsx';
        $tempFile = tempnam(sys_get_temp_dir(), $fileName);

        $writer->save($tempFile);

        return response()->download($tempFile, $fileName)->deleteFileAfterSend(true);
    }

    /**
     * Preview the import file contents
     */
    public function previewImport(Request $request) {
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|mimes:csv,xlsx,xls',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $file = $request->file('file');

        try {
            $spreadsheet = IOFactory::load($file->getPathname());
            $worksheet = $spreadsheet->getActiveSheet();
            $data = $worksheet->toArray();

            // Get headers
            $headers = array_shift($data);

            // Limit preview to first 10 rows
            // $previewData = array_slice($data, 0, 10);
            $previewData = $data;

            // Filter out completely empty rows and add row numbers
            $previewData = array_filter($previewData, function ($row) {
                return !empty(array_filter($row));
            });

            // Add row numbers to each data row
            $numberedData = [];
            $rowNumber = 2; // Start from 2 since row 1 is headers
            foreach ($previewData as $row) {
                $numberedData[] = array_merge([$rowNumber], $row);
                $rowNumber++;
            }

            return response()->json([
                'headers' => array_merge(['Row #'], $headers),
                'data' => array_values($numberedData),
                'total_rows' => count($data),
            ]);

        } catch (\Exception $e) {
            Log::error('Test case preview failed', ['error' => $e->getMessage()]);

            return response()->json(['error' => 'Failed to process the file: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Parse boolean values from string representations
     */
    private function parseBooleanValue($value): bool {
        if (is_bool($value)) {
            return $value;
        }

        $value = strtolower(trim($value));

        return in_array($value, ['true', '1', 'yes', 'on'], true);
    }

    /**
     * Export filtered test cases with their cognitive levels to Excel
     */
    public function exportFilteredTestCases($course, array $filters): BinaryFileResponse {
        // Debug: Log the filters being applied
        Log::info('Export filters received:', $filters);

        // Build the query for filtered test cases
        $query = LearningMaterialQuestionTestCase::whereHas('learning_material_question.learning_material', function ($query) use ($course) {
            $query->where('course_id', $course->id);
        })
            ->with([
                'learning_material_question' => function ($query) {
                    $query->select('id', 'title', 'learning_material_id');
                },
                'learning_material_question.learning_material' => function ($query) {
                    $query->select('id', 'title', 'course_id');
                },
            ]);

        // Apply material filters if provided
        if (!empty($filters['selectedMaterialIds']) && is_array($filters['selectedMaterialIds']) && count($filters['selectedMaterialIds']) > 0) {
            $materialIds = array_map('intval', $filters['selectedMaterialIds']);
            Log::info('Applying material filter for IDs:', $materialIds);
            $query->whereHas('learning_material_question.learning_material', function ($query) use ($materialIds) {
                $query->whereIn('id', $materialIds);
            });
        } else {
            Log::info('No material filter applied - exporting all materials');
        }

        // Apply search filter if provided
        if (!empty($filters['searchQuery'])) {
            $searchQuery = trim($filters['searchQuery']);
            Log::info('Applying search filter:', ['query' => $searchQuery]);
            $query->where(function ($query) use ($searchQuery) {
                $query->where('title', 'like', "%{$searchQuery}%")
                    ->orWhere('description', 'like', "%{$searchQuery}%")
                    ->orWhere('input', 'like', "%{$searchQuery}%")
                    ->orWhereHas('learning_material_question', function ($query) use ($searchQuery) {
                        $query->where('title', 'like', "%{$searchQuery}%");
                    })
                    ->orWhereHas('learning_material_question.learning_material', function ($query) use ($searchQuery) {
                        $query->where('title', 'like', "%{$searchQuery}%");
                    });
            });
        }

        $testCases = $query->get();

        Log::info('Export query results:', ['count' => $testCases->count(), 'course' => $course->title]);

        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();

        // Set headers
        $headers = [
            'Material ID',
            'Material Title',
            'Question Title',
            'Test Case ID',
            'Test Case Title',
            'Test Case Input',
            'Cognitive Levels',
        ];

        $sheet->fromArray([$headers], null, 'A1');

        // Prepare data rows
        $dataRows = [];
        foreach ($testCases as $testCase) {
            $material = $testCase->learning_material_question?->learning_material;
            $question = $testCase->learning_material_question;

            $cognitiveLevels = is_array($testCase->cognitive_levels)
                ? implode(', ', $testCase->cognitive_levels)
                : '';

            $dataRows[] = [
                $material?->id ?? '',
                $material?->title ?? 'Unknown Material',
                $question?->title ?? 'Unknown Question',
                $testCase->id,
                $testCase->title ?? '',
                $testCase->input ?? '',
                $cognitiveLevels,
            ];
        }

        // Sort by material ID to match the frontend grouping
        usort($dataRows, function ($a, $b) {
            return $a[0] <=> $b[0]; // Sort by Material ID
        });

        $sheet->fromArray($dataRows, null, 'A2');

        // Auto-size columns
        foreach (range('A', 'G') as $column) {
            $sheet->getColumnDimension($column)->setAutoSize(true);
        }

        // Style the header row
        $headerStyle = [
            'font' => ['bold' => true],
            'fill' => [
                'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                'startColor' => ['rgb' => 'E2E8F0'],
            ],
        ];
        $sheet->getStyle('A1:G1')->applyFromArray($headerStyle);

        // Add some styling for better readability
        $sheet->getStyle('A1:G' . (count($dataRows) + 1))->getBorders()->getAllBorders()->setBorderStyle(\PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN);

        $writer = new Xlsx($spreadsheet);
        $fileName = 'filtered_test_cases_' . $course->title . '_' . date('Y-m-d_H-i-s') . '.xlsx';
        $tempFile = tempnam(sys_get_temp_dir(), $fileName);

        $writer->save($tempFile);

        return response()->download($tempFile, $fileName)->deleteFileAfterSend(true);
    }

    /**
     * Export sequence validation results with problematic rows highlighted
     */
    public function exportSequenceValidation($course, array $validationData, array $filters): BinaryFileResponse {
        Log::info('Export sequence validation:', ['course' => $course->title, 'validation_count' => count($validationData['materialGroups'] ?? [])]);

        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();

        // Set headers
        $headers = [
            'Row',
            'Status',
            'Material ID',
            'Material Title',
            'Test Case ID',
            'Test Case Title',
            'Excel Pattern',
            'Test Case Input',
            'Excel Cognitive Levels',
            'Test Case Cognitive Levels',
            'Match Status',
            'Issue Description',
        ];

        $sheet->fromArray([$headers], null, 'A1');

        // Prepare data rows with validation information
        $dataRows = [];

        if (isset($validationData['materialGroups'])) {
            foreach ($validationData['materialGroups'] as $group) {
                foreach ($group['matches'] as $match) {
                    $testCase = null;
                    $material = null;

                    // Try to find the actual test case and material from the match data
                    if (isset($match['testCase'])) {
                        $testCase = $match['testCase'];
                        if (isset($testCase['learning_material_question']['learning_material'])) {
                            $material = $testCase['learning_material_question']['learning_material'];
                        }
                    }

                    $isMatch = $match['isMatch'] ?? false;
                    $excelPattern = $match['excelPattern'] ?? '';
                    $testCaseInput = $testCase['input'] ?? '';

                    // Get cognitive levels from both sources
                    $excelCognitiveLevels = '';
                    $testCaseCognitiveLevels = '';

                    // Try to find the original excel data for this match
                    if (isset($validationData['excelData'])) {
                        $excelIndex = $match['index'] ?? 0;
                        if (isset($validationData['excelData'][$excelIndex])) {
                            $excelCognitiveLevels = $validationData['excelData'][$excelIndex]['cognitiveLevels'] ?? '';
                        }
                    }

                    // Get test case cognitive levels
                    if (isset($testCase['cognitive_levels']) && is_array($testCase['cognitive_levels'])) {
                        $testCaseCognitiveLevels = implode(', ', $testCase['cognitive_levels']);
                    }

                    // Determine issue description
                    $issueDescription = '';
                    if (!$isMatch) {
                        if (empty($excelPattern) && empty($testCaseInput)) {
                            $issueDescription = 'Both Excel pattern and test case input are empty';
                        } elseif (empty($excelPattern)) {
                            $issueDescription = 'Excel pattern is empty';
                        } elseif (empty($testCaseInput)) {
                            $issueDescription = 'Test case input is empty';
                        } else {
                            $issueDescription = 'Excel pattern does not match test case input';
                        }
                    } else {
                        $issueDescription = 'Perfect match';
                    }

                    $dataRows[] = [
                        $match['index'] + 1, // Row number (1-based)
                        $isMatch ? '✅ MATCH' : '❌ MISMATCH',
                        $material['id'] ?? $group['materialId'] ?? '',
                        $material['title'] ?? $group['materialTitle'] ?? 'Unknown Material',
                        $testCase['id'] ?? '',
                        $testCase['title'] ?? '',
                        $excelPattern,
                        $testCaseInput,
                        $excelCognitiveLevels,
                        $testCaseCognitiveLevels,
                        $isMatch ? 'MATCH' : 'MISMATCH',
                        $issueDescription,
                    ];
                }
            }
        }

        // Sort by row number to maintain sequence order
        usort($dataRows, function ($a, $b) {
            return $a[0] <=> $b[0];
        });

        $sheet->fromArray($dataRows, null, 'A2');

        // Auto-size columns
        foreach (range('A', 'L') as $column) {
            $sheet->getColumnDimension($column)->setAutoSize(true);
        }

        // Style the header row
        $headerStyle = [
            'font' => ['bold' => true],
            'fill' => [
                'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                'startColor' => ['rgb' => 'E2E8F0'],
            ],
        ];
        $sheet->getStyle('A1:L1')->applyFromArray($headerStyle);

        // Style rows based on match status
        $rowCount = count($dataRows) + 1; // +1 for header
        for ($i = 2; $i <= $rowCount; $i++) {
            $statusCell = $sheet->getCell("B{$i}")->getValue();
            if (strpos($statusCell, 'MISMATCH') !== false) {
                // Red background for mismatches
                $sheet->getStyle("A{$i}:L{$i}")->applyFromArray([
                    'fill' => [
                        'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                        'startColor' => ['rgb' => 'FEE2E2'], // Light red
                    ],
                ]);
            } else {
                // Green background for matches
                $sheet->getStyle("A{$i}:L{$i}")->applyFromArray([
                    'fill' => [
                        'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                        'startColor' => ['rgb' => 'DCFCE7'], // Light green
                    ],
                ]);
            }
        }

        // Add borders for better readability
        $sheet->getStyle("A1:L{$rowCount}")->getBorders()->getAllBorders()->setBorderStyle(\PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN);

        // Add a summary at the top
        $sheet->insertNewRowBefore(1, 2);
        $totalRows = count($dataRows);
        $mismatchedRows = count(array_filter($dataRows, function ($row) {
            return strpos($row[1], 'MISMATCH') !== false;
        }));
        $matchedRows = $totalRows - $mismatchedRows;

        $sheet->setCellValue('A1', 'Sequence Validation Report');
        $sheet->setCellValue('A2', "Course: {$course->title} | Total: {$totalRows} rows | Matches: {$matchedRows} | Mismatches: {$mismatchedRows}");

        // Style the summary
        $sheet->getStyle('A1:L1')->applyFromArray([
            'font' => ['bold' => true, 'size' => 14],
            'fill' => [
                'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                'startColor' => ['rgb' => 'F3F4F6'],
            ],
        ]);
        $sheet->getStyle('A2:L2')->applyFromArray([
            'font' => ['italic' => true],
            'fill' => [
                'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                'startColor' => ['rgb' => 'F9FAFB'],
            ],
        ]);

        $writer = new Xlsx($spreadsheet);
        $fileName = 'sequence_validation_' . $course->title . '_' . date('Y-m-d_H-i-s') . '.xlsx';
        $tempFile = tempnam(sys_get_temp_dir(), $fileName);

        $writer->save($tempFile);

        return response()->download($tempFile, $fileName)->deleteFileAfterSend(true);
    }

    /** @var LearningMaterialQuestionTestCaseRepository */
    protected $repository;

    protected function getRepositoryClass(): string {
        return LearningMaterialQuestionTestCaseRepositoryInterface::class;
    }
}
