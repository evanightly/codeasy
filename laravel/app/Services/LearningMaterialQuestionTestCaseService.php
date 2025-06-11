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

    /** @var LearningMaterialQuestionTestCaseRepository */
    protected $repository;

    protected function getRepositoryClass(): string {
        return LearningMaterialQuestionTestCaseRepositoryInterface::class;
    }
}
