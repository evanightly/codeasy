<?php

namespace App\Services;

use App\Models\StudentCognitiveClassification;
use App\Repositories\StudentCognitiveClassificationRepository;
use App\Support\Interfaces\Repositories\StudentCognitiveClassificationRepositoryInterface;
use App\Support\Interfaces\Services\CourseServiceInterface;
use App\Support\Interfaces\Services\StudentCognitiveClassificationServiceInterface;
use App\Support\Interfaces\Services\StudentCourseCognitiveClassificationHistoryServiceInterface;
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
            $apiResult = $this->performClassification($studentData, $classificationType, $courseId);

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
                        'trial_status' => $studentScore ? (int) $studentScore->trial_status : 0, // benefit
                        'variable_count' => $executionResult ? $executionResult->variable_count : 0, // benefit
                        'function_count' => $executionResult ? $executionResult->function_count : 0, // benefit
                        'test_case_complete_count' => $studentScore ? $studentScore->test_case_complete_count : 0, // benefit
                        'test_case_total_count' => $studentScore ? $studentScore->test_case_total_count : 0, // for completion rate calculation
                        'test_case_completion_rate' => $studentScore && $studentScore->test_case_total_count > 0
                            ? round($studentScore->test_case_complete_count / $studentScore->test_case_total_count, 2)
                            : 0, // benefit - derived metric
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
     * Synchronize student code cognitive levels by performing test assertions
     *
     * This method implements feature 5A from the student cognitive classification requirements.
     * It performs test assertions on student code to determine which test cases they completed,
     * then updates the achieved_test_case_ids in the execution results.
     *
     * @param  array  $data  Contains course_id and other parameters
     * @return array Result of the synchronization process
     */
    public function syncStudentCodeCognitiveLevels(array $data): array {
        $courseId = $data['course_id'];

        try {
            // Get the course and its materials
            $course = app(CourseServiceInterface::class)->findOrFail($courseId);
            $learningMaterials = $course->learning_materials()->with([
                'learning_material_questions.learning_material_question_test_cases',
                'learning_material_questions.student_scores.completed_execution_result',
            ])->get();

            if ($learningMaterials->isEmpty()) {
                return [
                    'status' => 'error',
                    'message' => 'No learning materials found for this course',
                ];
            }

            // Get all students enrolled in the course
            $students = $course->classroom->students;

            if ($students->isEmpty()) {
                return [
                    'status' => 'error',
                    'message' => 'No students found for this course',
                ];
            }

            // Calculate total steps for progress tracking
            $totalExecutionResults = 0;
            foreach ($students as $student) {
                foreach ($learningMaterials as $material) {
                    foreach ($material->learning_material_questions as $question) {
                        $studentScore = $question->student_scores()
                            ->where('user_id', $student->id)
                            ->whereNotNull('completed_execution_result_id')
                            ->first();

                        if ($studentScore && $studentScore->completed_execution_result) {
                            $totalExecutionResults++;
                        }
                    }
                }
            }

            if ($totalExecutionResults === 0) {
                return [
                    'status' => 'warning',
                    'message' => 'No completed execution results found for students in this course',
                ];
            }

            // Broadcast initial progress
            event(new \App\Events\StudentCodeSyncProgressEvent(
                $courseId,
                'Starting student code cognitive level synchronization...',
                0,
                $totalExecutionResults
            ));

            $currentStep = 0;
            $syncedResults = [];
            $errors = [];

            // Process each student
            foreach ($students as $student) {
                foreach ($learningMaterials as $material) {
                    foreach ($material->learning_material_questions as $question) {
                        // Get the student's completed execution result for this question
                        $studentScore = $question->student_scores()
                            ->where('user_id', $student->id)
                            ->whereNotNull('completed_execution_result_id')
                            ->first();

                        if (!$studentScore || !$studentScore->completed_execution_result) {
                            continue;
                        }

                        $executionResult = $studentScore->completed_execution_result;
                        $currentStep++;

                        // Skip if execution result doesn't have code
                        if (!$executionResult->code || empty(trim($executionResult->code))) {
                            Log::info('Skipping execution result without code', [
                                'student_id' => $student->id,
                                'execution_result_id' => $executionResult->id,
                                'question_id' => $question->id,
                            ]);

                            continue;
                        }

                        // Broadcast progress
                        event(new \App\Events\StudentCodeSyncProgressEvent(
                            $courseId,
                            "Processing student {$student->name} - {$material->title} - {$question->title}",
                            $currentStep,
                            $totalExecutionResults,
                            [
                                'student_id' => $student->id,
                                'student_name' => $student->name,
                                'material_id' => $material->id,
                                'material_title' => $material->title,
                                'question_id' => $question->id,
                                'question_title' => $question->title,
                            ]
                        ));

                        try {
                            // Get test cases for this question
                            $testCases = $question->learning_material_question_test_cases;

                            if ($testCases->isEmpty()) {
                                continue;
                            }

                            // Filter out test cases with null inputs and prepare data for FastAPI
                            $validTestCases = $testCases->filter(function ($testCase) {
                                return !is_null($testCase->input) && !empty(trim($testCase->input));
                            });

                            if ($validTestCases->isEmpty()) {
                                // No valid test cases, skip this question
                                Log::info('Skipping question with no valid test cases', [
                                    'student_id' => $student->id,
                                    'question_id' => $question->id,
                                    'total_test_cases' => $testCases->count(),
                                    'null_assertions' => $testCases->whereNull('input')->count(),
                                    'empty_assertions' => $testCases->where('input', '')->count(),
                                ]);

                                continue;
                            }

                            Log::info('Processing test cases for synchronization', [
                                'student_id' => $student->id,
                                'question_id' => $question->id,
                                'total_test_cases' => $testCases->count(),
                                'valid_test_cases' => $validTestCases->count(),
                                'filtered_out' => $testCases->count() - $validTestCases->count(),
                            ]);

                            $testCasesArray = $validTestCases->pluck('input')->toArray();
                            $testCaseIds = $validTestCases->pluck('id')->toArray();

                            // Call FastAPI to perform test assertions
                            $response = Http::timeout(60)->post(config('services.fastapi.url') . '/test', [
                                'code' => $executionResult->code,
                                'testcases' => $testCasesArray,
                                'testcase_ids' => $testCaseIds,
                                'type' => 'sync',
                                'question_id' => $question->id,
                                'student_id' => $student->id,
                            ]);

                            if ($response->successful()) {
                                $result = $response->json();

                                // Extract passed test case IDs from the response
                                $passedTestCaseIds = [];
                                foreach ($result as $output) {
                                    if (isset($output['type']) && $output['type'] === 'test_stats' && isset($output['passed_test_case_ids'])) {
                                        $passedTestCaseIds = $output['passed_test_case_ids'];
                                        break;
                                    }
                                }

                                // Update the execution result with achieved test case IDs
                                $executionResult->achieved_test_case_ids = $passedTestCaseIds;
                                $executionResult->save();

                                $syncedResults[] = [
                                    'student_id' => $student->id,
                                    'student_name' => $student->name,
                                    'execution_result_id' => $executionResult->id,
                                    'question_id' => $question->id,
                                    'question_title' => $question->title,
                                    'material_id' => $material->id,
                                    'material_title' => $material->title,
                                    'total_test_cases' => count($testCasesArray),
                                    'passed_test_cases' => count($passedTestCaseIds),
                                    'achieved_test_case_ids' => $passedTestCaseIds,
                                ];

                                Log::info('Synchronized student code cognitive levels', [
                                    'student_id' => $student->id,
                                    'execution_result_id' => $executionResult->id,
                                    'question_id' => $question->id,
                                    'passed_test_cases' => count($passedTestCaseIds),
                                    'total_test_cases' => count($testCasesArray),
                                ]);

                            } else {
                                $errorMsg = "FastAPI request failed for student {$student->id}, question {$question->id}";
                                $errors[] = $errorMsg;
                                Log::error($errorMsg, [
                                    'response' => $response->body(),
                                    'status' => $response->status(),
                                ]);
                            }

                        } catch (Exception $e) {
                            $errorMsg = "Error processing student {$student->id}, question {$question->id}: " . $e->getMessage();
                            $errors[] = $errorMsg;
                            Log::error($errorMsg, [
                                'exception' => $e->getTraceAsString(),
                            ]);
                        }
                    }
                }
            }

            // Broadcast completion
            event(new \App\Events\StudentCodeSyncProgressEvent(
                $courseId,
                'Student code cognitive level synchronization completed',
                $totalExecutionResults,
                $totalExecutionResults,
                [
                    'synced_count' => count($syncedResults),
                    'error_count' => count($errors),
                ]
            ));

            return [
                'status' => 'success',
                'message' => 'Student code cognitive level synchronization completed',
                'data' => [
                    'synced_results' => $syncedResults,
                    'synced_count' => count($syncedResults),
                    'error_count' => count($errors),
                    'errors' => $errors,
                ],
            ];

        } catch (Exception $e) {
            Log::error('Error in student code cognitive level synchronization', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'course_id' => $courseId,
            ]);

            // Broadcast error
            event(new \App\Events\StudentCodeSyncProgressEvent(
                $courseId,
                'Error occurred during synchronization: ' . $e->getMessage(),
                0,
                1
            ));

            return [
                'status' => 'error',
                'message' => 'Synchronization process failed: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Perform classification using FastAPI or internal logic
     *
     * MODIFIED IN REVISION 3: Added cognitive_levels classification support
     */
    private function performClassification(array $studentData, string $classificationType, int $courseId): array {
        // Handle cognitive_levels classification internally
        if ($classificationType === 'cognitive_levels') {
            return $this->performCognitiveLevelsClassification($studentData, $courseId);
        }

        // Call the FastAPI server to perform other classification types
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
     * MODIFIED IN REVISION 3: Now saves material-level classifications and records history for cognitive_levels
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

            // Use recommendations from FastAPI response instead of generating locally
            $rawData = $classification['raw_data'];

            // Check if FastAPI already provided recommendations
            if (!isset($rawData['recommendations']) || empty($rawData['recommendations'])) {
                // Fallback to local generation only if FastAPI didn't provide recommendations
                $recommendations = $this->generateRecommendations($rawData);
                $rawData['recommendations'] = $recommendations;
            }

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

            // For cognitive_levels classification, record detailed history
            if ($classificationType === 'cognitive_levels') {
                $this->recordCognitiveLevelsHistory($result, $courseId, $rawData, $now);
            }
        }

        return $savedResults;
    }

    /**
     * Record detailed history for cognitive levels classification
     *
     * @param  \App\Models\StudentCognitiveClassification  $classification
     */
    private function recordCognitiveLevelsHistory($classification, int $courseId, array $rawData, Carbon $now): void {
        // Get or create a course-level classification record to link history to
        $courseClassificationService = app(StudentCourseCognitiveClassificationServiceInterface::class);

        // First check if course classification exists
        $courseClassification = $courseClassificationService->getCourseClassification(
            $classification->user_id,
            $courseId,
            'cognitive_levels'
        );

        // If it doesn't exist, create a placeholder (will be updated later during course calculation)
        if (!$courseClassification) {
            $courseClassification = $courseClassificationService->getOrCreateCourseClassificationsFromRawData(
                $classification->user_id,
                $courseId,
                'cognitive_levels',
                'Pending', // Temporary level
                0.0, // Temporary score
                ['status' => 'pending', 'material_classifications' => []],
                $now
            );
        }

        // Create detailed history record
        $historyService = app(StudentCourseCognitiveClassificationHistoryServiceInterface::class);

        $historyData = [
            'course_id' => $courseId,
            'user_id' => $classification->user_id,
            'student_course_cognitive_classification_id' => $courseClassification->id,
            'classification_type' => 'cognitive_levels',
            'classification_level' => $classification->classification_level,
            'classification_score' => $classification->classification_score,
            'raw_data' => [
                'type' => 'material_level',
                'material_id' => $classification->learning_material_id,
                'material_title' => $rawData['material_info']['material_title'] ?? "Material {$classification->learning_material_id}",
                'step_details' => $rawData, // Complete raw data from material classification
                'metadata' => [
                    'recorded_at' => $now->toISOString(),
                    'classification_id' => $classification->id,
                ],
            ],
            'classified_at' => $now,
        ];

        $historyRecord = $historyService->create($historyData);

        Log::info('Recorded cognitive levels history for material classification', [
            'user_id' => $classification->user_id,
            'course_id' => $courseId,
            'material_id' => $classification->learning_material_id,
            'classification_level' => $classification->classification_level,
            'history_id' => $historyRecord->id ?? 'unknown',
        ]);
    }

    /**
     * Calculate and save the overall course-level classification
     *
     * MODIFIED IN REVISION 3: Updated to handle cognitive_levels classification
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
        $totalUsers = count($userClassifications);
        $currentUserStep = 0;

        // Broadcast progress for course level calculation
        broadcast(new \App\Events\CognitiveLevelsClassificationProgressEvent(
            $courseId,
            'Starting course-level classification calculation...',
            0,
            $totalUsers,
            'course'
        ));

        // Process each user's classifications
        foreach ($userClassifications as $userId => $classifications) {
            $currentUserStep++;
            $userName = $classifications[0]->user->name ?? "Student $userId";

            // Broadcast progress for current user
            broadcast(new \App\Events\CognitiveLevelsClassificationProgressEvent(
                $courseId,
                "Calculating course classification for $userName",
                $currentUserStep,
                $totalUsers,
                'course',
                [
                    'student_id' => $userId,
                    'student_name' => $userName,
                ]
            ));

            if ($classificationType === 'cognitive_levels') {
                $this->calculateCognitiveLevelsCourseClassification($userId, $courseId, $classifications, $now);
            } else {
                $this->calculateTraditionalCourseClassification($userId, $courseId, $classifications, $classificationType, $now);
            }
        }

        // Broadcast completion
        broadcast(new \App\Events\CognitiveLevelsClassificationProgressEvent(
            $courseId,
            'Course-level classification completed!',
            $totalUsers,
            $totalUsers,
            'course'
        ));
    }

    /**
     * Calculate course-level classification for cognitive_levels type
     *
     * @param  int  $userId  The user ID
     * @param  int  $courseId  The course ID
     * @param  array  $materialClassifications  Array of material-level classifications
     * @param  Carbon  $now  Current timestamp
     */
    private function calculateCognitiveLevelsCourseClassification(int $userId, int $courseId, array $materialClassifications, Carbon $now): void {
        // Aggregate cognitive level data across all materials
        $aggregatedCognitiveLevels = [
            'C1' => ['achieved' => 0, 'total' => 0],
            'C2' => ['achieved' => 0, 'total' => 0],
            'C3' => ['achieved' => 0, 'total' => 0],
            'C4' => ['achieved' => 0, 'total' => 0],
            'C5' => ['achieved' => 0, 'total' => 0],
            'C6' => ['achieved' => 0, 'total' => 0],
        ];

        $materialBreakdowns = [];
        $allRecommendations = [];

        // Aggregate data from all material classifications
        foreach ($materialClassifications as $classification) {
            $rawData = $classification->raw_data;
            $cognitiveLevelAnalysis = $rawData['cognitive_level_analysis'] ?? [];
            $rates = $cognitiveLevelAnalysis['rates'] ?? [];

            $materialBreakdowns[] = [
                'material_id' => $classification->learning_material_id,
                'material_title' => $rawData['material_info']['material_title'] ?? "Material {$classification->learning_material_id}",
                'classification_level' => $classification->classification_level,
                'classification_score' => $classification->classification_score,
                'cognitive_level_rates' => $rates,
                'highest_achieved_level' => $cognitiveLevelAnalysis['highest_achieved_level'] ?? null,
            ];

            // Aggregate cognitive levels
            foreach ($rates as $level => $data) {
                if (isset($aggregatedCognitiveLevels[$level])) {
                    $aggregatedCognitiveLevels[$level]['achieved'] += $data['achieved'];
                    $aggregatedCognitiveLevels[$level]['total'] += $data['total'];
                }
            }

            // Collect recommendations
            if (isset($rawData['recommendations'])) {
                $allRecommendations = array_merge($allRecommendations, $rawData['recommendations']);
            }
        }

        // Calculate course-level cognitive rates
        $courseCognitiveLevelRates = [];
        $highestAchievedLevel = null;
        $highestRate = 0;

        foreach ($aggregatedCognitiveLevels as $level => $data) {
            $rate = $data['total'] > 0 ? round($data['achieved'] / $data['total'], 3) : 0;
            $courseCognitiveLevelRates[$level] = [
                'achieved' => $data['achieved'],
                'total' => $data['total'],
                'rate' => $rate,
            ];

            // Find the highest rate with the highest cognitive level
            if ($rate > $highestRate || ($rate == $highestRate && $rate > 0)) {
                $highestRate = $rate;
                $highestAchievedLevel = $level;
            }
        }

        // Determine final course classification
        $classificationMapping = [
            'C6' => ['level' => 'Create', 'min_rate' => 0.85],
            'C5' => ['level' => 'Evaluate', 'min_rate' => 0.70],
            'C4' => ['level' => 'Analyze', 'min_rate' => 0.55],
            'C3' => ['level' => 'Apply', 'min_rate' => 0.40],
            'C2' => ['level' => 'Understand', 'min_rate' => 0.25],
            'C1' => ['level' => 'Remember', 'min_rate' => 0.00],
        ];

        $finalLevel = 'Remember'; // Default
        $finalScore = $highestRate;

        if ($highestAchievedLevel && $highestRate > 0) {
            $finalLevel = $classificationMapping[$highestAchievedLevel]['level'];

            // Check if rate meets minimum threshold, downgrade if necessary
            foreach (['C6', 'C5', 'C4', 'C3', 'C2', 'C1'] as $level) {
                if ($highestRate >= $classificationMapping[$level]['min_rate']) {
                    $finalLevel = $classificationMapping[$level]['level'];
                    break;
                }
            }
        }

        // Generate course-level recommendations
        $courseRecommendations = $this->generateCourseLevelCognitiveLevelRecommendations(
            $courseCognitiveLevelRates,
            $materialBreakdowns,
            $allRecommendations
        );

        // Prepare detailed raw data
        $rawData = [
            'course_cognitive_analysis' => [
                'aggregated_cognitive_levels' => $courseCognitiveLevelRates,
                'highest_achieved_level' => $highestAchievedLevel,
                'highest_rate' => $highestRate,
                'final_classification' => $finalLevel,
                'final_score' => $finalScore,
            ],
            'material_breakdowns' => $materialBreakdowns,
            'classification_rule_applied' => [
                'rule_base' => $classificationMapping,
                'applied_rule' => [
                    'cognitive_level' => $highestAchievedLevel,
                    'rate' => $highestRate,
                    'classification' => $finalLevel,
                ],
            ],
            'recommendations' => $courseRecommendations,
            'calculation_details' => [
                'material_count' => count($materialClassifications),
                'total_cognitive_levels' => array_sum(array_column($courseCognitiveLevelRates, 'total')),
                'total_achieved' => array_sum(array_column($courseCognitiveLevelRates, 'achieved')),
                'overall_achievement_rate' => array_sum(array_column($courseCognitiveLevelRates, 'total')) > 0
                    ? round(array_sum(array_column($courseCognitiveLevelRates, 'achieved')) / array_sum(array_column($courseCognitiveLevelRates, 'total')), 3)
                    : 0,
            ],
            'metadata' => [
                'classification_type' => 'cognitive_levels',
                'calculated_at' => $now->toISOString(),
            ],
        ];

        // Save to course classification table
        $courseClassification = app(StudentCourseCognitiveClassificationServiceInterface::class)
            ->getOrCreateCourseClassificationsFromRawData(
                $userId,
                $courseId,
                'cognitive_levels',
                $finalLevel,
                $finalScore,
                $rawData,
                $now
            );

        // Record course-level history
        $this->recordCourseLevelCognitiveLevelsHistory($courseClassification, $rawData, $now);
    }

    /**
     * Calculate traditional course-level classification (for non-cognitive_levels types)
     */
    private function calculateTraditionalCourseClassification(int $userId, int $courseId, array $classifications, string $classificationType, Carbon $now): void {
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

        // Prepare the raw data for the course classification
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

        // Create or update the course-level classification
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

    /**
     * Generate course-level recommendations for cognitive levels classification
     */
    private function generateCourseLevelCognitiveLevelRecommendations(
        array $courseCognitiveLevelRates,
        array $materialBreakdowns,
        array $allMaterialRecommendations
    ): array {
        $recommendations = [];

        // Overall performance recommendation
        $overallRate = 0;
        $totalLevels = 0;
        foreach ($courseCognitiveLevelRates as $data) {
            if ($data['total'] > 0) {
                $overallRate += $data['rate'];
                $totalLevels++;
            }
        }
        $avgRate = $totalLevels > 0 ? $overallRate / $totalLevels : 0;

        if ($avgRate < 0.4) {
            $recommendations[] = [
                'type' => 'course_overall',
                'message' => 'Your overall cognitive performance across the course needs significant improvement. Focus on completing more test cases and demonstrating higher-level thinking skills.',
                'priority' => 'high',
                'average_rate' => round($avgRate, 3),
            ];
        } elseif ($avgRate < 0.7) {
            $recommendations[] = [
                'type' => 'course_overall',
                'message' => 'Good progress in the course! Continue working on achieving higher cognitive levels.',
                'priority' => 'medium',
                'average_rate' => round($avgRate, 3),
            ];
        } else {
            $recommendations[] = [
                'type' => 'course_overall',
                'message' => 'Excellent cognitive performance throughout the course! You demonstrate strong higher-order thinking skills.',
                'priority' => 'low',
                'average_rate' => round($avgRate, 3),
            ];
        }

        // Specific cognitive level recommendations for the course
        foreach ($courseCognitiveLevelRates as $level => $data) {
            if ($data['total'] > 0 && $data['rate'] < 0.5) {
                $levelName = [
                    'C1' => 'Remember', 'C2' => 'Understand', 'C3' => 'Apply',
                    'C4' => 'Analyze', 'C5' => 'Evaluate', 'C6' => 'Create',
                ][$level];

                $recommendations[] = [
                    'type' => 'course_cognitive_level',
                    'level' => $level,
                    'level_name' => $levelName,
                    'message' => "Across the course, improve your $levelName ({$level}) skills. You achieved {$data['achieved']} out of {$data['total']} possible cognitive instances.",
                    'achieved' => $data['achieved'],
                    'total' => $data['total'],
                    'current_rate' => $data['rate'],
                    'priority' => $data['rate'] < 0.25 ? 'high' : 'medium',
                ];
            }
        }

        // Material-specific recommendations
        $weakMaterials = array_filter($materialBreakdowns, fn ($m) => $m['classification_score'] < 0.5);
        if (!empty($weakMaterials)) {
            foreach ($weakMaterials as $material) {
                $recommendations[] = [
                    'type' => 'course_material_specific',
                    'material_id' => $material['material_id'],
                    'material_title' => $material['material_title'],
                    'message' => "Focus on improving your performance in '{$material['material_title']}' where you achieved {$material['classification_level']} level.",
                    'current_level' => $material['classification_level'],
                    'current_score' => $material['classification_score'],
                    'priority' => 'medium',
                ];
            }
        }

        return $recommendations;
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

    /**
     * Perform cognitive levels classification internally
     *
     * This method implements the cognitive levels classification based on Bloom's taxonomy
     * as specified in Revision 3 of the student cognitive classification requirements.
     *
     * @param  array  $studentData  The student data gathered for classification
     * @param  int  $courseId  Course ID for classification
     * @return array Classification results in the expected format
     */
    private function performCognitiveLevelsClassification(array $studentData, int $courseId): array {
        // Get course and materials for cognitive level counting
        $course = app(CourseServiceInterface::class)->findOrFail($courseId);
        $learningMaterials = $course->learning_materials()->with([
            'learning_material_questions.learning_material_question_test_cases',
        ])->get();

        $classifications = [];
        $totalStudents = count($studentData);
        $currentStudentStep = 0;

        // Broadcast initial progress for material level processing
        broadcast(new \App\Events\CognitiveLevelsClassificationProgressEvent(
            $courseId,
            'Starting cognitive levels classification (Material Level)...',
            0,
            $totalStudents * $learningMaterials->count(),
            'material'
        ));

        // Process each student
        foreach ($studentData as $student) {
            $userId = $student['user_id'];
            $userName = $student['user_name'] ?? "Student $userId";

            // Process each material for this student
            foreach ($student['materials'] as $materialData) {
                $materialId = $materialData['material_id'];
                $materialTitle = $materialData['material_title'] ?? "Material $materialId";

                $currentStudentStep++;

                // Broadcast progress for current material
                broadcast(new \App\Events\CognitiveLevelsClassificationProgressEvent(
                    $courseId,
                    "Processing $userName - $materialTitle",
                    $currentStudentStep,
                    $totalStudents * $learningMaterials->count(),
                    'material',
                    [
                        'student_id' => $userId,
                        'student_name' => $userName,
                        'material_id' => $materialId,
                        'material_title' => $materialTitle,
                    ]
                ));

                // Get the learning material to access cognitive level counts
                $learningMaterial = $learningMaterials->find($materialId);
                if (!$learningMaterial) {
                    Log::warning("Learning material not found: $materialId");

                    continue;
                }

                // Get total cognitive levels available in this material
                $totalCognitiveLevels = $learningMaterial->countCognitiveLevels(null, true);
                $totalCognitiveLevelsCount = $totalCognitiveLevels['summary'];

                // Calculate achieved cognitive levels for this student in this material
                $achievedCognitiveLevels = $this->calculateAchievedCognitiveLevels(
                    $userId,
                    $learningMaterial,
                    $totalCognitiveLevels['details']
                );

                // Calculate the cognitive level scores and determine final classification
                $classificationResult = $this->calculateCognitiveLevelClassification(
                    $achievedCognitiveLevels,
                    $totalCognitiveLevelsCount,
                    $learningMaterial,
                    $userId,
                    $userName
                );

                $classifications[] = [
                    'user_id' => $userId,
                    'material_id' => $materialId,
                    'level' => $classificationResult['level'],
                    'score' => $classificationResult['score'],
                    'raw_data' => $classificationResult['raw_data'],
                ];
            }
        }

        return [
            'classifications' => $classifications,
            'metadata' => [
                'classification_type' => 'cognitive_levels',
                'total_students' => $totalStudents,
                'total_materials' => $learningMaterials->count(),
                'processed_at' => now()->toISOString(),
            ],
        ];
    }

    /**
     * Calculate achieved cognitive levels for a student in a specific material
     *
     * @param  int  $userId  The student user ID
     * @param  \App\Models\LearningMaterial  $learningMaterial  The learning material
     * @param  array  $materialCognitiveLevelDetails  Detailed cognitive level information
     * @return array Achieved cognitive levels summary
     */
    private function calculateAchievedCognitiveLevels(int $userId, $learningMaterial, array $materialCognitiveLevelDetails): array {
        $achievedCognitiveLevels = [
            'C1' => 0, 'C2' => 0, 'C3' => 0, 'C4' => 0, 'C5' => 0, 'C6' => 0,
        ];

        $detailedBreakdown = [];

        // Process each question in the material
        foreach ($materialCognitiveLevelDetails as $questionInfo) {
            $questionId = $questionInfo['id'];
            $questionTitle = $questionInfo['title'] ?? "Question $questionId";

            // Get student's completed execution result for this question
            $studentScore = \App\Models\StudentScore::where('user_id', $userId)
                ->where('learning_material_question_id', $questionId)
                ->whereNotNull('completed_execution_result_id')
                ->first();

            $questionBreakdown = [
                'question_id' => $questionId,
                'question_title' => $questionTitle,
                'test_cases' => [],
                'achieved_cognitive_levels' => [],
            ];

            if ($studentScore && $studentScore->completed_execution_result) {
                $executionResult = $studentScore->completed_execution_result;
                $achievedTestCaseIds = $executionResult->achieved_test_case_ids ?? [];

                // Process each test case in the question
                foreach ($questionInfo['test_cases'] as $testCaseInfo) {
                    $testCaseId = $testCaseInfo['id'];
                    $testCaseAchieved = in_array($testCaseId, $achievedTestCaseIds);
                    $cognitiveLevels = $testCaseInfo['cognitive_levels'] ?? [];

                    $testCaseBreakdown = [
                        'test_case_id' => $testCaseId,
                        'achieved' => $testCaseAchieved,
                        'cognitive_levels' => $cognitiveLevels,
                        'input' => $testCaseInfo['input'] ?? null,
                    ];

                    $questionBreakdown['test_cases'][] = $testCaseBreakdown;

                    // If test case was achieved, count its cognitive levels
                    if ($testCaseAchieved) {
                        foreach ($cognitiveLevels as $level) {
                            if (isset($achievedCognitiveLevels[$level])) {
                                $achievedCognitiveLevels[$level]++;

                                if (!in_array($level, $questionBreakdown['achieved_cognitive_levels'])) {
                                    $questionBreakdown['achieved_cognitive_levels'][] = $level;
                                }
                            }
                        }
                    }
                }
            }

            $detailedBreakdown[] = $questionBreakdown;
        }

        return [
            'summary' => $achievedCognitiveLevels,
            'details' => $detailedBreakdown,
        ];
    }

    /**
     * Calculate the final cognitive level classification based on achieved vs total cognitive levels
     *
     * @param  array  $achievedCognitiveLevels  The achieved cognitive levels data
     * @param  array  $totalCognitiveLevelsCount  Total cognitive levels available in the material
     * @param  \App\Models\LearningMaterial  $learningMaterial  The learning material
     * @param  int  $userId  The student user ID
     * @param  string  $userName  The student name
     * @return array Classification result with level, score, and detailed raw data
     */
    private function calculateCognitiveLevelClassification(
        array $achievedCognitiveLevels,
        array $totalCognitiveLevelsCount,
        $learningMaterial,
        int $userId,
        string $userName
    ): array {
        $cognitiveLevelRates = [];
        $highestAchievedLevel = null;
        $highestRate = 0;

        // Calculate rates for each cognitive level (C1-C6)
        foreach (['C1', 'C2', 'C3', 'C4', 'C5', 'C6'] as $level) {
            $achieved = $achievedCognitiveLevels['summary'][$level] ?? 0;
            $total = $totalCognitiveLevelsCount[$level] ?? 0;
            $rate = $total > 0 ? round($achieved / $total, 3) : 0;

            $cognitiveLevelRates[$level] = [
                'achieved' => $achieved,
                'total' => $total,
                'rate' => $rate,
            ];

            // Find the highest rate with the highest cognitive level
            if ($rate > $highestRate || ($rate == $highestRate && $rate > 0)) {
                $highestRate = $rate;
                $highestAchievedLevel = $level;
            }
        }

        // Map cognitive level to classification using the rule base
        $classificationMapping = [
            'C6' => ['level' => 'Create', 'min_rate' => 0.85],
            'C5' => ['level' => 'Evaluate', 'min_rate' => 0.70],
            'C4' => ['level' => 'Analyze', 'min_rate' => 0.55],
            'C3' => ['level' => 'Apply', 'min_rate' => 0.40],
            'C2' => ['level' => 'Understand', 'min_rate' => 0.25],
            'C1' => ['level' => 'Remember', 'min_rate' => 0.00],
        ];

        // Determine final classification level based on highest achieved cognitive level and rate
        $finalLevel = 'Remember'; // Default to lowest level
        $finalScore = $highestRate;

        if ($highestAchievedLevel && $highestRate > 0) {
            // Use the mapping for the highest achieved cognitive level
            $finalLevel = $classificationMapping[$highestAchievedLevel]['level'];

            // However, if the rate doesn't meet the minimum threshold, downgrade
            foreach (['C6', 'C5', 'C4', 'C3', 'C2', 'C1'] as $level) {
                if ($highestRate >= $classificationMapping[$level]['min_rate']) {
                    $finalLevel = $classificationMapping[$level]['level'];
                    break;
                }
            }
        }

        // Generate recommendations based on the analysis
        $recommendations = $this->generateCognitiveLevelRecommendations(
            $cognitiveLevelRates,
            $achievedCognitiveLevels['details'],
            $highestAchievedLevel,
            $highestRate
        );

        // Prepare detailed raw data for storage
        $rawData = [
            'student_info' => [
                'user_id' => $userId,
                'user_name' => $userName,
            ],
            'material_info' => [
                'material_id' => $learningMaterial->id,
                'material_title' => $learningMaterial->title,
            ],
            'cognitive_level_analysis' => [
                'rates' => $cognitiveLevelRates,
                'highest_achieved_level' => $highestAchievedLevel,
                'highest_rate' => $highestRate,
                'final_classification' => $finalLevel,
                'final_score' => $finalScore,
            ],
            'detailed_breakdown' => $achievedCognitiveLevels['details'],
            'classification_rule_applied' => [
                'rule_base' => $classificationMapping,
                'applied_rule' => [
                    'cognitive_level' => $highestAchievedLevel,
                    'rate' => $highestRate,
                    'classification' => $finalLevel,
                ],
            ],
            'recommendations' => $recommendations,
            'metadata' => [
                'classification_type' => 'cognitive_levels',
                'calculated_at' => now()->toISOString(),
                'total_questions' => count($achievedCognitiveLevels['details']),
                'total_cognitive_levels_in_material' => array_sum($totalCognitiveLevelsCount),
            ],
        ];

        return [
            'level' => $finalLevel,
            'score' => $finalScore,
            'raw_data' => $rawData,
        ];
    }

    /**
     * Generate recommendations based on cognitive level analysis
     *
     * @param  array  $cognitiveLevelRates  Cognitive level rates analysis
     * @param  array  $detailedBreakdown  Detailed breakdown of questions and test cases
     * @param  string|null  $highestAchievedLevel  The highest achieved cognitive level
     * @param  float  $highestRate  The highest achievement rate
     * @return array List of recommendations
     */
    private function generateCognitiveLevelRecommendations(
        array $cognitiveLevelRates,
        array $detailedBreakdown,
        ?string $highestAchievedLevel,
        float $highestRate
    ): array {
        $recommendations = [];

        // General performance recommendations
        if ($highestRate < 0.5) {
            $recommendations[] = [
                'type' => 'general',
                'message' => 'Your overall cognitive performance needs improvement. Focus on completing more test cases to demonstrate higher-level thinking skills.',
                'priority' => 'high',
            ];
        } elseif ($highestRate < 0.8) {
            $recommendations[] = [
                'type' => 'general',
                'message' => 'Good progress! Try to achieve more test cases to reach higher cognitive levels.',
                'priority' => 'medium',
            ];
        } else {
            $recommendations[] = [
                'type' => 'general',
                'message' => 'Excellent cognitive performance! Keep up the great work.',
                'priority' => 'low',
            ];
        }

        // Specific cognitive level recommendations
        foreach ($cognitiveLevelRates as $level => $data) {
            if ($data['total'] > 0 && $data['rate'] < 0.5) {
                $levelName = [
                    'C1' => 'Remember', 'C2' => 'Understand', 'C3' => 'Apply',
                    'C4' => 'Analyze', 'C5' => 'Evaluate', 'C6' => 'Create',
                ][$level];

                $recommendations[] = [
                    'type' => 'cognitive_level',
                    'level' => $level,
                    'level_name' => $levelName,
                    'message' => "Improve your $levelName ({$level}) skills by completing more test cases that require this cognitive level.",
                    'achieved' => $data['achieved'],
                    'total' => $data['total'],
                    'current_rate' => $data['rate'],
                    'priority' => $data['rate'] < 0.25 ? 'high' : 'medium',
                ];
            }
        }

        // Question-specific recommendations
        foreach ($detailedBreakdown as $questionData) {
            $completedTestCases = count(array_filter($questionData['test_cases'], fn ($tc) => $tc['achieved']));
            $totalTestCases = count($questionData['test_cases']);

            if ($totalTestCases > 0 && $completedTestCases / $totalTestCases < 0.5) {
                $recommendations[] = [
                    'type' => 'question_specific',
                    'question_id' => $questionData['question_id'],
                    'question_title' => $questionData['question_title'],
                    'message' => "Focus on completing more test cases in '{$questionData['question_title']}' to improve your cognitive level achievement.",
                    'completed_test_cases' => $completedTestCases,
                    'total_test_cases' => $totalTestCases,
                    'completion_rate' => round($completedTestCases / $totalTestCases, 2),
                    'priority' => 'medium',
                ];
            }
        }

        return $recommendations;
    }

    /**
     * Record detailed history for course-level cognitive levels classification
     *
     * @param  mixed  $courseClassification  The course classification record
     * @param  array  $rawData  The detailed raw data from course calculation
     * @param  Carbon  $now  Current timestamp
     */
    private function recordCourseLevelCognitiveLevelsHistory($courseClassification, array $rawData, Carbon $now): void {
        $historyService = app(StudentCourseCognitiveClassificationHistoryServiceInterface::class);

        $historyData = [
            'course_id' => $courseClassification->course_id,
            'user_id' => $courseClassification->user_id,
            'student_course_cognitive_classification_id' => $courseClassification->id,
            'classification_type' => 'cognitive_levels',
            'classification_level' => $courseClassification->classification_level,
            'classification_score' => $courseClassification->classification_score,
            'raw_data' => [
                'type' => 'course_level',
                'step_details' => $rawData, // Complete raw data from course classification
                'metadata' => [
                    'recorded_at' => $now->toISOString(),
                    'course_classification_id' => $courseClassification->id,
                ],
            ],
            'classified_at' => $now,
        ];

        $historyRecord = $historyService->create($historyData);

        Log::info('Recorded cognitive levels history for course classification', [
            'user_id' => $courseClassification->user_id,
            'course_id' => $courseClassification->course_id,
            'classification_level' => $courseClassification->classification_level,
            'history_id' => $historyRecord->id ?? 'unknown',
        ]);
    }
}
