<?php

namespace App\Services;

use App\Models\StudentCognitiveClassification;
use App\Repositories\StudentCognitiveClassificationRepository;
use App\Support\Interfaces\Repositories\StudentCognitiveClassificationRepositoryInterface;
use App\Support\Interfaces\Services\CourseServiceInterface;
use App\Support\Interfaces\Services\StudentCognitiveClassificationServiceInterface;
use App\Traits\Services\HandlesPageSizeAll;
use Carbon\Carbon;
use Exception;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class StudentCognitiveClassificationService extends BaseCrudService implements StudentCognitiveClassificationServiceInterface {
    use HandlesPageSizeAll;

    /**
     * Whether to enforce that all materials have the same number of questions
     * If true, will throw an exception if question counts differ between materials
     */
    protected bool $enforceConsistentQuestionCount = true;

    public function getAllPaginated(array $search = [], int $pageSize = 15): LengthAwarePaginator {
        $this->handlePageSizeAll();

        return parent::getAllPaginated($search, $pageSize);
    }

    /** @var StudentCognitiveClassificationRepository */
    protected $repository;

    protected function getRepositoryClass(): string {
        return StudentCognitiveClassificationRepositoryInterface::class;
    }

    /**
     * Run classification process for students in a course
     *
     * @param  array  $data  Contains course_id, classification_type, and optionally student_id
     * @return array Result of the classification process
     */
    public function runClassification(array $data): array {
        $courseId = $data['course_id'];
        $classificationType = $data['classification_type'] ?? 'topsis';
        $studentId = $data['student_id'] ?? null; // Optional student ID for single student classification

        try {
            // 1. Gather student data for the course
            $studentData = $this->gatherStudentData($courseId, $studentId);

            if (empty($studentData)) {
                return [
                    'status' => 'error',
                    'message' => 'No student data found for this course',
                ];
            }

            // 2. Call FastAPI to perform classification
            $apiResult = $this->performClassification($studentData, $classificationType);

            // 3. Save classification results
            $savedResults = $this->saveClassificationResults($apiResult, $courseId, $classificationType);

            return [
                'status' => 'success',
                'message' => 'Classification completed successfully',
                'data' => $savedResults,
            ];
        } catch (Exception $e) {
            Log::error('Error in cognitive classification process', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'course_id' => $courseId,
                'student_id' => $studentId,
            ]);

            return [
                'status' => 'error',
                'message' => 'Classification process failed: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Gather student data for classification
     *
     * @param  int  $courseId  Course ID to gather data for
     * @param  int|null  $studentId  Optional student ID to filter by
     * @return array The gathered student data
     */
    private function gatherStudentData(int $courseId, ?int $studentId = null): array {
        // Get the learning materials for the course
        $course = app(CourseServiceInterface::class)->findOrFail($courseId);

        // Get all learning materials for the course
        $learningMaterials = $course->learning_materials()->with(['learning_material_questions'])->get();

        if ($learningMaterials->isEmpty()) {
            throw new Exception('No learning materials found for this course');
        }

        // Get all students enrolled in the course
        $students = $course->classroom->students;

        // Filter by student ID if provided
        if ($studentId) {
            $students = $students->where('id', $studentId);
        }

        if ($students->isEmpty()) {
            throw new Exception('No students found for the specified criteria');
        }

        $studentData = [];

        // For each student, get their scores for each question in each material
        foreach ($students as $student) {
            $userData = [
                'user_id' => $student->id,
                'materials' => [],
            ];

            foreach ($learningMaterials as $material) {
                $materialData = [
                    'material_id' => $material->id,
                    'material_name' => $material->title,
                    'questions' => [],
                ];

                foreach ($material->learning_material_questions as $question) {
                    // Get the student's score for this question
                    $studentScore = $question->student_scores()
                        ->where('user_id', $student->id)
                        ->first();

                    // Get the execution result that completed this score
                    $executionResult = $studentScore ? $studentScore->completed_execution_result : null;

                    // Convert coding_time from seconds to minutes for classification
                    $codingTimeInMinutes = $studentScore && $studentScore->coding_time ? round($studentScore->coding_time / 60, 2) : 0;

                    $questionData = [
                        'question_id' => $question->id,
                        'question_name' => $question->title,
                        'metrics' => [
                            'completion_status' => $studentScore ? (int) $studentScore->completion_status : 0,
                            'trial_status' => $studentScore ? (int) $studentScore->trial_status : 0,
                            'compile_count' => $studentScore ? $studentScore->compile_count : 0,
                            'coding_time' => $codingTimeInMinutes, // Now in minutes instead of seconds
                            'variable_count' => $executionResult ? $executionResult->variable_count : 0,
                            'function_count' => $executionResult ? $executionResult->function_count : 0,
                        ],
                    ];

                    $materialData['questions'][] = $questionData;
                }

                $userData['materials'][] = $materialData;
            }

            $studentData[] = $userData;
        }

        return $studentData;
    }

    /**
     * Perform classification using FastAPI
     */
    private function performClassification(array $studentData, string $classificationType): array {
        // Call the FastAPI server to perform classification
        $response = Http::post(config('services.fastapi.url') . '/classify', [
            'student_data' => $studentData,
            'classification_type' => $classificationType,
        ]);

        if (!$response->successful()) {
            Log::error('FastAPI classification failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            throw new Exception('Classification API returned an error: ' . $response->body());
        }

        return $response->json();
    }

    /**
     * Save classification results to database
     */
    private function saveClassificationResults(array $apiResult, int $courseId, string $classificationType): array {
        $now = Carbon::now();
        $savedResults = [];

        foreach ($apiResult['classifications'] as $classification) {
            $userData = [
                'user_id' => $classification['user_id'],
                'course_id' => $courseId,
                'classification_type' => $classificationType,
                'classification_level' => $classification['level'],
                'classification_score' => $classification['score'],
                'raw_data' => $classification['raw_data'],
                'classified_at' => $now,
            ];

            // Create or update the classification record
            $result = $this->repository->updateOrCreate([
                'user_id' => $classification['user_id'],
                'course_id' => $courseId,
                'classification_type' => $classificationType,
            ], $userData);

            $savedResults[] = $result;
        }

        return $savedResults;
    }

    /**
     * Export classifications to Excel
     *
     * @return Response
     */
    public function exportToExcel(array $filters = []): Response|BinaryFileResponse {
        // Create a new Spreadsheet
        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();

        // Set headers
        $sheet->setCellValue('A1', 'ID');
        $sheet->setCellValue('B1', 'Student Name');
        $sheet->setCellValue('C1', 'Course Name');
        $sheet->setCellValue('D1', 'Classification Type');
        $sheet->setCellValue('E1', 'Classification Level');
        $sheet->setCellValue('F1', 'Classification Score');
        $sheet->setCellValue('G1', 'Classified At');

        // Get the classifications with related data
        $classifications = $this->repository->getAllWithRelationsQuery([
            'user' => function ($query) {
                $query->select('id', 'name');
            },
            'course' => function ($query) {
                $query->select('id', 'name');
            },
        ])
            ->get();

        // Fill data rows
        $row = 2;
        foreach ($classifications as $classification) {
            $sheet->setCellValue('A' . $row, $classification->id);
            $sheet->setCellValue('B' . $row, $classification->user->name);
            $sheet->setCellValue('C' . $row, $classification->course->name);
            $sheet->setCellValue('D' . $row, $classification->classification_type);
            $sheet->setCellValue('E' . $row, $classification->classification_level);
            $sheet->setCellValue('F' . $row, $classification->classification_score);
            $sheet->setCellValue('G' . $row, $classification->classified_at->format('Y-m-d H:i:s'));
            $row++;
        }

        // Auto-size columns
        foreach (range('A', 'G') as $column) {
            $sheet->getColumnDimension($column)->setAutoSize(true);
        }

        // Create temporary file
        $filename = 'cognitive_classifications_' . date('YmdHis') . '.xlsx';
        $tempPath = storage_path('app/temp/' . $filename);

        // Ensure temp directory exists
        if (!file_exists(storage_path('app/temp'))) {
            mkdir(storage_path('app/temp'), 0755, true);
        }

        // Save file
        $writer = new Xlsx($spreadsheet);
        $writer->save($tempPath);

        // Return download response
        return response()->download($tempPath, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ])->deleteFileAfterSend();
    }

    /**
     * Export raw student data used for classifications to Excel
     *
     * @param  int  $courseId  Course to export data for
     * @param  bool  $enforceConsistentQuestionCount  Whether to enforce consistent question count
     * @param  string  $exportFormat  Format for export ('raw' or 'ml_tool')
     * @param  bool  $includeClassificationResults  Whether to include classification results in the export
     */
    public function exportRawDataToExcel(
        int $courseId,
        ?bool $enforceConsistentQuestionCount = null,
        string $exportFormat = 'raw',
        bool $includeClassificationResults = false
    ): Response|BinaryFileResponse {
        // Allow overriding default setting via parameter
        if ($enforceConsistentQuestionCount !== null) {
            $this->enforceConsistentQuestionCount = $enforceConsistentQuestionCount;
        }

        try {
            // Gather the raw student data
            $studentData = $this->gatherStudentData($courseId);

            if (empty($studentData)) {
                throw new Exception('No student data found for this course');
            }

            // Get the first student to determine structure
            $firstStudent = $studentData[0];

            // Check for consistent question count across materials if enforcement is enabled
            if ($this->enforceConsistentQuestionCount) {
                $this->validateConsistentQuestionCount($firstStudent['materials']);
            }

            // Create a new Spreadsheet
            $spreadsheet = new Spreadsheet;

            // Create an overview sheet first
            $overviewSheet = $spreadsheet->getActiveSheet();
            $overviewSheet->setTitle('Overview');
            $overviewSheet->setCellValue('A1', 'Raw Classification Data - Course ID: ' . $courseId);
            $overviewSheet->setCellValue('A3', 'Student ID');
            $overviewSheet->setCellValue('B3', 'Student Name');
            $overviewSheet->setCellValue('C3', 'Sheet Name');
            $overviewSheet->setCellValue('D3', 'Note: "waktu" is displayed in minutes (converted from seconds in database)');
            $overviewSheet->setCellValue('E3', 'Export Format: ' . ($exportFormat === 'ml_tool' ? 'ML Tool (RapidMiner)' : 'Raw Data'));

            if ($includeClassificationResults) {
                $overviewSheet->setCellValue('F3', 'Classification Results: Included');
            }

            // Format header
            $overviewSheet->getStyle('A1')->getFont()->setBold(true)->setSize(14);
            $overviewSheet->getStyle('A3:F3')->getFont()->setBold(true);
            $overviewSheet->getStyle('A3:C3')->getFill()
                ->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
                ->getStartColor()->setRGB('DDDDDD');
            $overviewSheet->getStyle('D3:F3')->getFill()
                ->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
                ->getStartColor()->setRGB('FFEEAA');

            // Create a sheet for each student
            $row = 4;
            foreach ($studentData as $index => $student) {
                $userId = $student['user_id'];
                $user = \App\Models\User::find($userId);
                $studentName = $user ? $user->name : "Student {$userId}";

                // Create a valid sheet name - Excel limits sheet names to 31 chars
                // Use student name but ensure it's within limits and valid
                $sheetName = mb_substr(preg_replace('/[\[\]\*\/\\\?:]/', '', $studentName), 0, 25) . "_{$userId}";

                // Add to overview sheet
                $overviewSheet->setCellValue("A{$row}", $userId);
                $overviewSheet->setCellValue("B{$row}", $studentName);
                $overviewSheet->setCellValue("C{$row}", $sheetName);
                $row++;

                // Create a new sheet for this student
                $sheet = $spreadsheet->createSheet();
                $sheet->setTitle($sheetName);

                // Add student info at the top
                $sheet->setCellValue('A1', "Student: {$studentName} (ID: {$userId})");
                $sheet->setCellValue('A2', "Note: 'waktu' column values are in minutes");
                $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(12);
                $sheet->getStyle('A2')->getFont()->setItalic(true)->getColor()->setRGB('AA5500');

                // Start from row 3 for the headers
                $sheet->setCellValue('A3', 'Material');

                // Get materials and determine question count
                $materials = $student['materials'];
                $questionCount = count($materials[0]['questions'] ?? []);

                // Track column positions
                $startCol = 1; // Starting from column B

                // Set up the question number headers instead of question names
                for ($questionNum = 1; $questionNum <= $questionCount; $questionNum++) {
                    // Metrics columns - each question has 6 metric columns
                    $metricsCount = 6; // compile, waktu, selesai, coba, variables, functions columns per question

                    // Merge cells for the question header (spanning multiple metrics)
                    $startColLetter = $this->getColumnLetter($startCol);
                    $endColLetter = $this->getColumnLetter($startCol + $metricsCount - 1);
                    $sheet->mergeCells("{$startColLetter}3:{$endColLetter}3");
                    $sheet->setCellValue("{$startColLetter}3", "Question {$questionNum}");

                    // Set individual metric headers - use different format for ML tools
                    if ($exportFormat === 'ml_tool') {
                        // For ML tools like RapidMiner, each column should have a unique name
                        $sheet->setCellValue($this->getColumnLetter($startCol) . '4', "compile_q{$questionNum}");
                        $sheet->setCellValue($this->getColumnLetter($startCol + 1) . '4', "waktu_q{$questionNum}");
                        $sheet->setCellValue($this->getColumnLetter($startCol + 2) . '4', "selesai_q{$questionNum}");
                        $sheet->setCellValue($this->getColumnLetter($startCol + 3) . '4', "coba_q{$questionNum}");
                        $sheet->setCellValue($this->getColumnLetter($startCol + 4) . '4', "variables_q{$questionNum}");
                        $sheet->setCellValue($this->getColumnLetter($startCol + 5) . '4', "functions_q{$questionNum}");
                    } else {
                        // Regular format
                        $sheet->setCellValue($this->getColumnLetter($startCol) . '4', 'compile');
                        $sheet->setCellValue($this->getColumnLetter($startCol + 1) . '4', 'waktu');
                        $sheet->setCellValue($this->getColumnLetter($startCol + 2) . '4', 'selesai');
                        $sheet->setCellValue($this->getColumnLetter($startCol + 3) . '4', 'coba');
                        $sheet->setCellValue($this->getColumnLetter($startCol + 4) . '4', 'variables');
                        $sheet->setCellValue($this->getColumnLetter($startCol + 5) . '4', 'functions');
                    }

                    // Move to next question columns
                    $startCol += $metricsCount;
                }

                // Add classification results columns if requested
                if ($includeClassificationResults) {
                    // Get classification results for this student
                    $classification = $this->repository->modelClass->where([
                        'user_id' => $userId,
                        'course_id' => $courseId,
                    ])->first();

                    // Add classification columns
                    $sheet->setCellValue($this->getColumnLetter($startCol) . '3', 'Classification Results');
                    $sheet->mergeCells($this->getColumnLetter($startCol) . '3:' . $this->getColumnLetter($startCol + 2) . '3');

                    // Column headers
                    $sheet->setCellValue($this->getColumnLetter($startCol) . '4', 'Level');
                    $sheet->setCellValue($this->getColumnLetter($startCol + 1) . '4', 'Score');
                    $sheet->setCellValue($this->getColumnLetter($startCol + 2) . '4', 'Method');

                    // Set classification data if available
                    if ($classification) {
                        $sheet->setCellValue($this->getColumnLetter($startCol) . '5', $classification->classification_level);
                        $sheet->setCellValue($this->getColumnLetter($startCol + 1) . '5', $classification->classification_score);
                        $sheet->setCellValue($this->getColumnLetter($startCol + 2) . '5', $classification->classification_type);
                    } else {
                        $sheet->setCellValue($this->getColumnLetter($startCol) . '5', 'Not Classified');
                        $sheet->setCellValue($this->getColumnLetter($startCol + 1) . '5', 'N/A');
                        $sheet->setCellValue($this->getColumnLetter($startCol + 2) . '5', 'N/A');
                    }

                    // Extend the format region
                    $startCol += 3;
                }

                // Format the headers
                $lastCol = $this->getColumnLetter($startCol - 1);
                $sheet->getStyle("A3:{$lastCol}4")->getFont()->setBold(true);
                $sheet->getStyle("A3:{$lastCol}3")->getFill()
                    ->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
                    ->getStartColor()->setRGB('DDDDDD');
                $sheet->getStyle("A4:{$lastCol}4")->getFill()
                    ->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
                    ->getStartColor()->setRGB('EEEEEE');

                // Fill in material data (rows)
                $row = 5;
                foreach ($materials as $materialIndex => $material) {
                    $materialName = $material['material_name'];
                    $materialNumber = $materialIndex + 1;

                    // Set material name in first column
                    $sheet->setCellValue("A{$row}", "{$materialNumber} {$materialName}");

                    // Reset column position for data
                    $col = 1; // Start from column B

                    // Fill in question data (columns) for this material
                    foreach ($material['questions'] as $question) {
                        $metrics = $question['metrics'];

                        // Fill in the metrics in corresponding columns
                        // Using 0 as the default value for all metrics if not available
                        $sheet->setCellValue($this->getColumnLetter($col) . $row, $metrics['compile_count'] ?? 0);
                        $sheet->setCellValue($this->getColumnLetter($col + 1) . $row, $metrics['coding_time'] ?? 0); // Already in minutes from gatherStudentData
                        $sheet->setCellValue($this->getColumnLetter($col + 2) . $row, $metrics['completion_status'] ?? 0);
                        $sheet->setCellValue($this->getColumnLetter($col + 3) . $row, $metrics['trial_status'] ?? 0);
                        $sheet->setCellValue($this->getColumnLetter($col + 4) . $row, $metrics['variable_count'] ?? 0);
                        $sheet->setCellValue($this->getColumnLetter($col + 5) . $row, $metrics['function_count'] ?? 0);

                        // Move to next question columns
                        $col += 6;
                    }

                    $row++;
                }

                // Auto-size columns and other formatting
                $sheet->getColumnDimension('A')->setWidth(30); // Material column width
                for ($col = 1; $col < $startCol; $col++) {
                    $sheet->getColumnDimension($this->getColumnLetter($col))->setAutoSize(true);
                }

                // Freeze panes to keep headers visible while scrolling
                $sheet->freezePane('B5');
            }

            // Auto-size overview sheet columns
            for ($col = 'A'; $col <= 'F'; $col++) {
                $overviewSheet->getColumnDimension($col)->setAutoSize(true);
            }

            // Create temporary file
            $format = $exportFormat === 'ml_tool' ? 'ml_format' : 'raw';
            $classification = $includeClassificationResults ? 'with_classification' : '';
            $filename = "raw_classification_data_course_{$courseId}_{$format}_{$classification}_" . date('YmdHis') . '.xlsx';
            $tempPath = storage_path('app/temp/' . $filename);

            // Ensure temp directory exists
            if (!file_exists(storage_path('app/temp'))) {
                mkdir(storage_path('app/temp'), 0755, true);
            }

            // Save file
            $writer = new Xlsx($spreadsheet);
            $writer->save($tempPath);

            // Return download response
            return response()->download($tempPath, $filename, [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            ])->deleteFileAfterSend();

        } catch (Exception $e) {
            Log::error('Error exporting raw classification data', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'course_id' => $courseId,
            ]);

            throw $e;
        }
    }

    /**
     * Validate that all materials have the same number of questions
     *
     * @param  array  $materials  Materials data array
     *
     * @throws Exception If materials have inconsistent question counts
     */
    private function validateConsistentQuestionCount(array $materials): void {
        $questionCounts = [];

        foreach ($materials as $index => $material) {
            $materialNumber = $index + 1;
            $materialName = $material['material_name'];
            $questionCount = count($material['questions'] ?? []);

            $questionCounts["Material {$materialNumber} ({$materialName})"] = $questionCount;
        }

        $uniqueCounts = array_unique($questionCounts);

        if (count($uniqueCounts) > 1) {
            $errorDetails = 'Inconsistent question counts detected: ';
            foreach ($questionCounts as $material => $count) {
                $errorDetails .= "{$material}: {$count} questions, ";
            }
            $errorDetails = rtrim($errorDetails, ', ');

            throw new Exception("Materials must have the same number of questions for consistent classification. {$errorDetails}");
        }
    }

    /**
     * Convert a numeric column index to letter (A, B, C, ... AA, AB, etc.)
     */
    private function getColumnLetter(int $columnIndex): string {
        $columnLetter = '';

        while ($columnIndex >= 0) {
            $columnLetter = chr(65 + ($columnIndex % 26)) . $columnLetter;
            $columnIndex = floor($columnIndex / 26) - 1;
        }

        return $columnLetter;
    }

    /**
     * Get detailed classification information
     */
    public function getClassificationDetails(StudentCognitiveClassification $classification): array {
        // Get the raw data from the classification which includes calculation details
        $rawData = $classification->raw_data;

        // Extract calculation details - might be nested under method
        $calculationDetails = $rawData['calculation_details'] ?? null;

        // If calculation details don't exist, return the base information
        if (!$calculationDetails) {
            return [
                'id' => $classification->id,
                'user_id' => $classification->user_id,
                'user' => $classification->user ? [
                    'id' => $classification->user->id,
                    'name' => $classification->user->name,
                ] : null,
                'course_id' => $classification->course_id,
                'course' => $classification->course ? [
                    'id' => $classification->course->id,
                    'name' => $classification->course->name,
                ] : null,
                'classification_type' => $classification->classification_type,
                'classification_level' => $classification->classification_level,
                'classification_score' => $classification->classification_score,
                'classified_at' => $classification->classified_at,
                'raw_data' => $classification->raw_data,
                'message' => 'Detailed calculation information is not available for this classification.',
            ];
        }

        // Format and return the calculation details
        return [
            'id' => $classification->id,
            'user_id' => $classification->user_id,
            'user' => $classification->user ? [
                'id' => $classification->user->id,
                'name' => $classification->user->name,
            ] : null,
            'course_id' => $classification->course_id,
            'course' => $classification->course ? [
                'id' => $classification->course->id,
                'name' => $classification->course->name,
            ] : null,
            'classification_type' => $classification->classification_type,
            'classification_level' => $classification->classification_level,
            'classification_score' => $classification->classification_score,
            'classified_at' => $classification->classified_at,
            'raw_data' => $classification->raw_data,
            'calculation_details' => $calculationDetails,
        ];
    }
}
