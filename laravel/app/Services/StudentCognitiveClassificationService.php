<?php

namespace App\Services;

use App\Models\StudentCognitiveClassification;
use App\Repositories\StudentCognitiveClassificationRepository;
use App\Support\Interfaces\Repositories\StudentCognitiveClassificationRepositoryInterface;
use App\Support\Interfaces\Services\CourseServiceInterface;
use App\Support\Interfaces\Services\StudentCognitiveClassificationServiceInterface;
use App\Support\Interfaces\Services\StudentCourseCognitiveClassificationServiceInterface;
use App\Traits\Services\HandlesPageSizeAll;
use Carbon\Carbon;
use Exception;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\Response;
use Illuminate\Support\Collection;
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
    protected bool $enforceConsistentQuestionCount = false; // Disabled because of Revision 1 .github/prompts/student-cognitive-classification.prompt.md

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

            // 4. Calculate and save the overall course-level classification
            if (!empty($savedResults)) {
                $this->calculateAndSaveCourseClassification($savedResults, $courseId, $classificationType);
            }

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
     * MODIFIED IN REVISION 1: Now focuses on gathering data per material with its questions
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

        // For each student, get their scores for each material
        foreach ($students as $student) {
            $userData = [
                'user_id' => $student->id,
                'materials' => [],
            ];

            // Process each material separately in line with Revision 1
            foreach ($learningMaterials as $material) {
                $materialData = [
                    'material_id' => $material->id,
                    'material_name' => $material->title,
                    'questions' => [],
                ];

                // Get all questions for this material
                $questions = $material->learning_material_questions;

                // For each question, create a row in the decision matrix
                foreach ($questions as $question) {
                    // Get the student's score for this question
                    $studentScore = $question->student_scores()
                        ->where('user_id', $student->id)
                        ->first();

                    // Get the execution result that completed this score
                    $executionResult = $studentScore && $studentScore->completed_execution_result_id
                        ? $studentScore->completed_execution_result
                        : null;

                    // Convert coding_time from seconds to minutes for classification
                    $codingTimeInMinutes = $studentScore && $studentScore->coding_time ? round($studentScore->coding_time / 60, 2) : 0;

                    // Build metrics array with all required parameters
                    $metrics = [
                        'compile_count' => $studentScore ? $studentScore->compile_count : 0, // cost
                        'coding_time' => $codingTimeInMinutes, // cost - now in minutes instead of seconds
                        'completion_status' => $studentScore ? (int) $studentScore->completion_status : 0, // benefit
                        'trial_status' => $studentScore ? (int) $studentScore->trial_status : 0, // cost
                        'variable_count' => $executionResult ? $executionResult->variable_count : 0, // benefit
                        'function_count' => $executionResult ? $executionResult->function_count : 0, // benefit
                    ];

                    $questionData = [
                        'question_id' => $question->id,
                        'question_name' => $question->title,
                        'order_number' => $question->order_number,
                        'metrics' => $metrics,
                    ];

                    $materialData['questions'][] = $questionData;
                }

                // Sort questions by order_number
                usort($materialData['questions'], function ($a, $b) {
                    return $a['order_number'] <=> $b['order_number'];
                });

                $userData['materials'][] = $materialData;
            }

            $studentData[] = $userData;
        }

        return $studentData;
    }

    /**
     * Perform classification using FastAPI
     *
     * MODIFIED IN REVISION 1: Updated to reflect per-material classification
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
     *
     * MODIFIED IN REVISION 1: Now saves material-level classifications
     */
    private function saveClassificationResults(array $apiResult, int $courseId, string $classificationType): array {
        $now = Carbon::now();
        $savedResults = [];

        // Each classification now has material_id specified
        foreach ($apiResult['classifications'] as $classification) {
            $userId = $classification['user_id'];
            $materialId = $classification['material_id'] ?? null;

            if (!$materialId) {
                Log::warning('Missing material_id in classification result', [
                    'user_id' => $userId,
                    'classification' => $classification,
                ]);

                continue;
            }

            // Generate recommendations based on raw data
            $recommendations = $this->generateRecommendations($classification['raw_data']);

            // Add recommendations to raw data
            $rawData = $classification['raw_data'];
            $rawData['recommendations'] = $recommendations;

            $userData = [
                'user_id' => $userId,
                'course_id' => $courseId,
                'learning_material_id' => $materialId,
                'classification_type' => $classificationType,
                'classification_level' => $classification['level'],
                'classification_score' => $classification['score'],
                'raw_data' => $rawData,
                'classified_at' => $now,
                'is_course_level' => false, // This is a material-level classification
            ];

            // Create or update the classification record
            $result = $this->repository->updateOrCreate([
                'user_id' => $userId,
                'course_id' => $courseId,
                'learning_material_id' => $materialId,
                'classification_type' => $classificationType,
                'is_course_level' => false,
            ], $userData);

            $savedResults[] = $result;
        }

        return $savedResults;
    }

    /**
     * Calculate and save the overall course-level classification
     *
     * NEW IN REVISION 1: Calculates and saves a course-level classification based on material results
     */
    private function calculateAndSaveCourseClassification(array $materialClassifications, int $courseId, string $classificationType): void {
        if (empty($materialClassifications)) {
            return;
        }

        // Group classifications by user
        $userClassifications = [];
        foreach ($materialClassifications as $classification) {
            $userId = $classification->user_id;
            if (!isset($userClassifications[$userId])) {
                $userClassifications[$userId] = [];
            }
            $userClassifications[$userId][] = $classification;
        }

        $now = Carbon::now();

        // Process each user's classifications
        foreach ($userClassifications as $userId => $classifications) {
            // Calculate average score across all materials
            $totalScore = 0;
            $recommendationsByLevel = [];

            foreach ($classifications as $classification) {
                $totalScore += $classification->classification_score;

                // Collect recommendations from material-level classifications
                if (isset($classification->raw_data['recommendations'])) {
                    $level = $classification->classification_level;
                    if (!isset($recommendationsByLevel[$level])) {
                        $recommendationsByLevel[$level] = [];
                    }
                    $recommendationsByLevel[$level] = array_merge(
                        $recommendationsByLevel[$level],
                        $classification->raw_data['recommendations']
                    );
                }
            }

            $avgScore = $totalScore / count($classifications);

            // Determine classification level based on the rule base
            $level = $this->determineClassificationLevel($avgScore);

            // Prepare recommendations for course level
            $recommendations = $this->prepareCourseLevelRecommendations($recommendationsByLevel, $level);

            // Instead of creating a duplicate course-level classification in this table,
            // create it in the StudentCourseCognitiveClassification table

            // First prepare the raw data for the course classification
            $rawData = [
                'material_classifications' => array_map(function ($c) {
                    return [
                        'id' => $c->id,
                        'material_id' => $c->learning_material_id,
                        'level' => $c->classification_level,
                        'score' => $c->classification_score,
                    ];
                }, $classifications),
                'recommendations' => $recommendations,
                'calculation_details' => [
                    'material_count' => count($classifications),
                    'average_score' => $avgScore,
                ],
            ];

            // Create or update the course-level classification in the StudentCourseCognitiveClassification table
            app(StudentCourseCognitiveClassificationServiceInterface::class)
                ->getOrCreateCourseClassificationsFromRawData(
                    $userId,
                    $courseId,
                    $classificationType,
                    $level,
                    $avgScore,
                    $rawData,
                    $now
                );
        }
    }

    /**
     * Generate recommendations based on classification results
     *
     * NEW IN REVISION 1: Generates specific recommendations for improving performance
     */
    private function generateRecommendations(array $rawData): array {
        $recommendations = [];

        // Extract metrics and analyze underperforming areas
        if (isset($rawData['question_metrics'])) {
            foreach ($rawData['question_metrics'] as $questionIndex => $metrics) {
                $questionNum = $questionIndex + 1;
                $recommendations[] = $this->analyzeMetricsForRecommendations($metrics, $questionNum);
            }
        }

        // If no specific metrics found, provide general recommendations
        if (empty($recommendations) && isset($rawData['weak_areas'])) {
            foreach ($rawData['weak_areas'] as $area) {
                $recommendations[] = "Focus on improving your {$area} skills.";
            }
        }

        // If still no recommendations, provide a default based on the classification level
        if (empty($recommendations) && isset($rawData['classification_level'])) {
            $level = $rawData['classification_level'];
            $recommendations[] = "Your current cognitive level is '{$level}'. Continue practicing to improve.";
        }

        return array_filter($recommendations); // Remove any empty values
    }

    /**
     * Analyze metrics for a specific question to generate recommendations
     */
    private function analyzeMetricsForRecommendations(array $metrics, int $questionNum): string {
        // Define thresholds for different metrics
        $thresholds = [
            'variable_count' => ['low' => 2, 'high' => 10],
            'function_count' => ['low' => 1, 'high' => 5],
            'compile_count' => ['low' => 3, 'high' => 10],
            'coding_time' => ['low' => 5, 'high' => 30], // in minutes
        ];

        // Check each metric against thresholds
        if (isset($metrics['variable_count']) && $metrics['variable_count'] < $thresholds['variable_count']['low']) {
            return "Question {$questionNum}: Try to use more variables to better organize your code.";
        }

        if (isset($metrics['function_count']) && $metrics['function_count'] < $thresholds['function_count']['low']) {
            return "Question {$questionNum}: Consider breaking down your solution into more functions for better modularity.";
        }

        if (isset($metrics['compile_count']) && $metrics['compile_count'] > $thresholds['compile_count']['high']) {
            return "Question {$questionNum}: You compiled your code {$metrics['compile_count']} times. Try to review your code more carefully before compiling to reduce the number of attempts.";
        }

        if (isset($metrics['coding_time']) && $metrics['coding_time'] > $thresholds['coding_time']['high']) {
            return "Question {$questionNum}: You spent {$metrics['coding_time']} minutes on this question. Try to improve your problem-solving speed with more practice.";
        }

        if (isset($metrics['completion_status']) && $metrics['completion_status'] == 0) {
            return "Question {$questionNum}: Complete this question to improve your overall score.";
        }

        return '';
    }

    /**
     * Prepare course-level recommendations based on material-level recommendations
     */
    private function prepareCourseLevelRecommendations(array $recommendationsByLevel, string $currentLevel): array {
        $finalRecommendations = [];

        // Add general recommendation based on current level
        $finalRecommendations[] = "Your current cognitive level is '{$currentLevel}'. Focus on the following to improve:";

        // Determine next level to target
        $levels = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'];
        $currentLevelIndex = array_search($currentLevel, $levels);

        if ($currentLevelIndex !== false && $currentLevelIndex < count($levels) - 1) {
            $nextLevel = $levels[$currentLevelIndex + 1];
            $finalRecommendations[] = "To reach the '{$nextLevel}' level:";

            // Add the recommendations from the next level if available
            if (isset($recommendationsByLevel[$nextLevel])) {
                // Limit to 3 recommendations for clarity
                $nextLevelRecs = array_slice($recommendationsByLevel[$nextLevel], 0, 3);
                foreach ($nextLevelRecs as $rec) {
                    $finalRecommendations[] = '- ' . $rec;
                }
            }
        }

        // Add some of the recommendations from the current level
        if (isset($recommendationsByLevel[$currentLevel])) {
            $finalRecommendations[] = "To improve within the '{$currentLevel}' level:";
            // Limit to 3 recommendations for clarity
            $currentLevelRecs = array_slice($recommendationsByLevel[$currentLevel], 0, 3);
            foreach ($currentLevelRecs as $rec) {
                $finalRecommendations[] = '- ' . $rec;
            }
        }

        return $finalRecommendations;
    }

    /**
     * Determine classification level based on score using the rule base
     */
    private function determineClassificationLevel(float $score): string {
        // Apply the rule base as defined in requirements
        if ($score >= 0.85) {
            return 'Create';
        } elseif ($score >= 0.70) {
            return 'Evaluate';
        } elseif ($score >= 0.55) {
            return 'Analyze';
        } elseif ($score >= 0.40) {
            return 'Apply';
        } elseif ($score >= 0.25) {
            return 'Understand';
        }

        return 'Remember';

    }

    /**
     * Export classifications to Excel
     */
    public function exportToExcel(array $filters = []): Response|BinaryFileResponse {
        // Create a new Spreadsheet
        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();

        // Set headers
        $sheet->setCellValue('A1', 'ID');
        $sheet->setCellValue('B1', 'Student Name');
        $sheet->setCellValue('C1', 'Course Name');
        $sheet->setCellValue('D1', 'Material Name');
        $sheet->setCellValue('E1', 'Classification Type');
        $sheet->setCellValue('F1', 'Classification Level');
        $sheet->setCellValue('G1', 'Classification Score');
        $sheet->setCellValue('H1', 'Course Level');
        $sheet->setCellValue('I1', 'Classified At');

        // Get the classifications with related data
        $classifications = $this->repository->getAllWithRelationsQuery([
            'user' => function ($query) {
                $query->select('id', 'name');
            },
            'course' => function ($query) {
                $query->select('id', 'name');
            },
            'learning_material' => function ($query) {
                $query->select('id', 'title');
            },
        ])->get();

        // Fill data rows
        $row = 2;
        foreach ($classifications as $classification) {
            $sheet->setCellValue('A' . $row, $classification->id);
            $sheet->setCellValue('B' . $row, $classification->user->name ?? 'Unknown User');
            $sheet->setCellValue('C' . $row, $classification->course->name ?? 'Unknown Course');
            $sheet->setCellValue('D' . $row, $classification->learning_material->title ?? 'Course Level');
            $sheet->setCellValue('E' . $row, $classification->classification_type);
            $sheet->setCellValue('F' . $row, $classification->classification_level);
            $sheet->setCellValue('G' . $row, $classification->classification_score);
            $sheet->setCellValue('H' . $row, $classification->is_course_level ? 'Yes' : 'No');
            $sheet->setCellValue('I' . $row, $classification->classified_at ? $classification->classified_at->format('Y-m-d H:i:s') : '');
            $row++;
        }

        // Auto-size columns
        foreach (range('A', 'I') as $column) {
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
     * @param  bool|null  $enforceConsistentQuestionCount  Whether to enforce consistent question count
     * @param  string  $exportFormat  Format for export ('raw' or 'ml_tool')
     * @param  bool  $includeClassificationResults  Whether to include classification results in the export
     */
    public function exportRawDataToExcel(
        int $courseId,
        ?bool $enforceConsistentQuestionCount = null,
        string $exportFormat = 'raw',
        bool $includeClassificationResults = false
    ): Response|BinaryFileResponse {
        // Get the raw student data for the course
        $studentData = $this->gatherStudentData($courseId);

        // Create a new spreadsheet
        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();

        // Headers will depend on the export format
        if ($exportFormat === 'ml_tool') {
            // ML Tool format (one row per student, columns for each metric-question combination)
            $this->exportMlToolFormat($sheet, $studentData, $includeClassificationResults);
        } else {
            // Raw format (one row per student-question combination)
            $this->exportRawFormat($sheet, $studentData, $includeClassificationResults);
        }

        // Create temporary file
        $filename = 'cognitive_raw_data_' . date('YmdHis') . '.xlsx';
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
     * Export data in ML Tool format (wide format, one row per student)
     */
    private function exportMlToolFormat(
        $sheet,
        array $studentData,
        bool $includeClassificationResults
    ): void {
        // Column headers
        $col = 'A';
        $sheet->setCellValue($col++ . '1', 'Student ID');
        $sheet->setCellValue($col++ . '1', 'Student Name');

        // Determine column headers from the first student's data
        $metricColumns = [];
        if (!empty($studentData)) {
            $firstStudent = $studentData[0];
            foreach ($firstStudent['materials'] as $mIdx => $material) {
                $materialPrefix = 'Material ' . ($mIdx + 1) . ' ';
                foreach ($material['questions'] as $qIdx => $question) {
                    $questionPrefix = 'Q' . ($qIdx + 1) . ' ';
                    foreach ($question['metrics'] as $metric => $value) {
                        $columnName = $materialPrefix . $questionPrefix . $metric;
                        $metricColumns[] = [
                            'material_idx' => $mIdx,
                            'question_idx' => $qIdx,
                            'metric' => $metric,
                            'column_name' => $columnName,
                        ];
                        $sheet->setCellValue($col++ . '1', $columnName);
                    }
                }

                // Add classification columns if requested
                if ($includeClassificationResults) {
                    $sheet->setCellValue($col++ . '1', $materialPrefix . 'Classification Level');
                    $sheet->setCellValue($col++ . '1', $materialPrefix . 'Classification Score');
                }
            }

            // Add course-level classification if requested
            if ($includeClassificationResults) {
                $sheet->setCellValue($col++ . '1', 'Course Classification Level');
                $sheet->setCellValue($col++ . '1', 'Course Classification Score');
            }
        }

        // Fill data rows
        $row = 2;
        foreach ($studentData as $student) {
            $col = 'A';
            $userId = $student['user_id'];

            // Get user information
            $user = \App\Models\User::find($userId);
            $sheet->setCellValue($col++ . $row, $userId);
            $sheet->setCellValue($col++ . $row, $user ? $user->name : 'Unknown User');

            // Fill metric values
            foreach ($metricColumns as $metricInfo) {
                $materialIdx = $metricInfo['material_idx'];
                $questionIdx = $metricInfo['question_idx'];
                $metric = $metricInfo['metric'];

                $value = 0;
                if (isset($student['materials'][$materialIdx]['questions'][$questionIdx]['metrics'][$metric])) {
                    $value = $student['materials'][$materialIdx]['questions'][$questionIdx]['metrics'][$metric];
                }

                $sheet->setCellValue($col++ . $row, $value);
            }

            // Add classification data if requested
            if ($includeClassificationResults) {
                foreach ($student['materials'] as $mIdx => $material) {
                    $materialId = $material['material_id'];

                    // Get material-level classification
                    $classification = $this->repository->getMaterialClassificationsForStudent(
                        $userId,
                        request()->get('course_id'),
                        'topsis'
                    )->where('learning_material_id', $materialId)->first();

                    if ($classification) {
                        $sheet->setCellValue($col++ . $row, $classification->classification_level);
                        $sheet->setCellValue($col++ . $row, $classification->classification_score);
                    } else {
                        $col += 2; // Skip these columns if no classification exists
                    }
                }

                // Add course-level classification
                $courseClassification = $this->repository->getCourseClassificationForStudent(
                    $userId,
                    request()->get('course_id'),
                    'topsis'
                );

                if ($courseClassification) {
                    $sheet->setCellValue($col++ . $row, $courseClassification->classification_level);
                    $sheet->setCellValue($col++ . $row, $courseClassification->classification_score);
                }
            }

            $row++;
        }

        // Auto-size columns
        foreach (range('A', $col) as $column) {
            $sheet->getColumnDimension($column)->setAutoSize(true);
        }
    }

    /**
     * Export data in raw format (long format, one row per student-question combination)
     */
    private function exportRawFormat(
        $sheet,
        array $studentData,
        bool $includeClassificationResults
    ): void {
        // Set headers
        $sheet->setCellValue('A1', 'Student ID');
        $sheet->setCellValue('B1', 'Student Name');
        $sheet->setCellValue('C1', 'Material ID');
        $sheet->setCellValue('D1', 'Material Name');
        $sheet->setCellValue('E1', 'Question ID');
        $sheet->setCellValue('F1', 'Question Name');
        $sheet->setCellValue('G1', 'Question Order');
        $sheet->setCellValue('H1', 'Compile Count');
        $sheet->setCellValue('I1', 'Coding Time (min)');
        $sheet->setCellValue('J1', 'Completion Status');
        $sheet->setCellValue('K1', 'Trial Status');
        $sheet->setCellValue('L1', 'Variable Count');
        $sheet->setCellValue('M1', 'Function Count');

        $lastCol = 'M';
        if ($includeClassificationResults) {
            $sheet->setCellValue('N1', 'Material Classification Level');
            $sheet->setCellValue('O1', 'Material Classification Score');
            $sheet->setCellValue('P1', 'Course Classification Level');
            $sheet->setCellValue('Q1', 'Course Classification Score');
            $lastCol = 'Q';
        }

        // Fill data rows
        $row = 2;
        foreach ($studentData as $student) {
            $userId = $student['user_id'];
            $user = \App\Models\User::find($userId);
            $userName = $user ? $user->name : 'Unknown User';

            // Get the course-level classification if needed
            $courseClassification = null;
            if ($includeClassificationResults) {
                $courseClassification = $this->repository->getCourseClassificationForStudent(
                    $userId,
                    request()->get('course_id'),
                    'topsis'
                );
            }

            foreach ($student['materials'] as $material) {
                $materialId = $material['material_id'];
                $materialName = $material['material_name'];

                // Get material-level classification if needed
                $materialClassification = null;
                if ($includeClassificationResults) {
                    $materialClassification = $this->repository->getMaterialClassificationsForStudent(
                        $userId,
                        request()->get('course_id'),
                        'topsis'
                    )->where('learning_material_id', $materialId)->first();
                }

                foreach ($material['questions'] as $question) {
                    $questionId = $question['question_id'];
                    $questionName = $question['question_name'];
                    $orderNumber = $question['order_number'];
                    $metrics = $question['metrics'];

                    $sheet->setCellValue('A' . $row, $userId);
                    $sheet->setCellValue('B' . $row, $userName);
                    $sheet->setCellValue('C' . $row, $materialId);
                    $sheet->setCellValue('D' . $row, $materialName);
                    $sheet->setCellValue('E' . $row, $questionId);
                    $sheet->setCellValue('F' . $row, $questionName);
                    $sheet->setCellValue('G' . $row, $orderNumber);
                    $sheet->setCellValue('H' . $row, $metrics['compile_count'] ?? 0);
                    $sheet->setCellValue('I' . $row, $metrics['coding_time'] ?? 0);
                    $sheet->setCellValue('J' . $row, $metrics['completion_status'] ?? 0);
                    $sheet->setCellValue('K' . $row, $metrics['trial_status'] ?? 0);
                    $sheet->setCellValue('L' . $row, $metrics['variable_count'] ?? 0);
                    $sheet->setCellValue('M' . $row, $metrics['function_count'] ?? 0);

                    if ($includeClassificationResults) {
                        $sheet->setCellValue('N' . $row, $materialClassification ? $materialClassification->classification_level : '');
                        $sheet->setCellValue('O' . $row, $materialClassification ? $materialClassification->classification_score : '');
                        $sheet->setCellValue('P' . $row, $courseClassification ? $courseClassification->classification_level : '');
                        $sheet->setCellValue('Q' . $row, $courseClassification ? $courseClassification->classification_score : '');
                    }

                    $row++;
                }
            }
        }

        // Auto-size columns
        foreach (range('A', $lastCol) as $column) {
            $sheet->getColumnDimension($column)->setAutoSize(true);
        }
    }

    /**
     * Get detailed classification information
     */
    public function getClassificationDetails(StudentCognitiveClassification $classification): array {
        // Get the raw data from the classification which includes calculation details
        $rawData = $classification->raw_data;

        // Extract calculation details - might be nested under method
        $calculationDetails = $rawData['calculation_details'] ?? null;
        $recommendations = $rawData['recommendations'] ?? [];

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
                'learning_material_id' => $classification->learning_material_id,
                'learning_material' => $classification->learning_material ? [
                    'id' => $classification->learning_material->id,
                    'title' => $classification->learning_material->title,
                    'file_url' => $classification->learning_material->file_url,
                ] : null,
                'is_course_level' => $classification->is_course_level,
                'classification_type' => $classification->classification_type,
                'classification_level' => $classification->classification_level,
                'classification_score' => $classification->classification_score,
                'classified_at' => $classification->classified_at,
                'recommendations' => $recommendations,
                'raw_data' => $rawData,
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
            'learning_material_id' => $classification->learning_material_id,
            'learning_material' => $classification->learning_material ? [
                'id' => $classification->learning_material->id,
                'title' => $classification->learning_material->title,
                'file_url' => $classification->learning_material->file_url,
            ] : null,
            'is_course_level' => $classification->is_course_level,
            'classification_type' => $classification->classification_type,
            'classification_level' => $classification->classification_level,
            'classification_score' => $classification->classification_score,
            'classified_at' => $classification->classified_at,
            'recommendations' => $recommendations,
            'raw_data' => $rawData, // Add raw_data here so it's always included
            'calculation_details' => $calculationDetails,
        ];
    }

    /**
     * Get material-level classifications for a student in a course
     *
     * @param  int  $userId  The user ID
     * @param  int  $courseId  The course ID
     * @param  string  $classificationType  The classification algorithm type
     * @return \Illuminate\Support\Collection Collection of material-level classifications
     */
    public function getMaterialClassificationsForStudent(
        int $userId,
        int $courseId,
        string $classificationType = 'topsis'
    ): Collection {
        return $this->repository->getMaterialClassificationsForStudent($userId, $courseId, $classificationType);
    }

    /**
     * Get course-level classification for a student
     *
     * @param  int  $userId  The user ID
     * @param  int  $courseId  The course ID
     * @param  string  $classificationType  The classification algorithm type
     * @return StudentCognitiveClassification|null The course-level classification or null if not found
     */
    public function getCourseClassificationForStudent(
        int $userId,
        int $courseId,
        string $classificationType = 'topsis'
    ): ?StudentCognitiveClassification {
        return $this->repository->getCourseClassificationForStudent($userId, $courseId, $classificationType);
    }
}
