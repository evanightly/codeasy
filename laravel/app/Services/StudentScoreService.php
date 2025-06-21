<?php

namespace App\Services;

use App\Http\Resources\StudentScoreResource;
use App\Models\LearningMaterial;
use App\Models\LearningMaterialQuestion;
use App\Models\StudentScore;
use App\Models\User;
use App\Repositories\StudentScoreRepository;
use App\Support\Interfaces\Repositories\StudentScoreRepositoryInterface;
use App\Support\Interfaces\Services\StudentScoreServiceInterface;
use App\Traits\Services\HandlesPageSizeAll;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class StudentScoreService extends BaseCrudService implements StudentScoreServiceInterface {
    use HandlesPageSizeAll;

    /**
     * Configuration: Whether to delete student scores completely during bulk re-attempt
     * Set to true to delete all scores (complete reset)
     * Set to false to mark questions for re-attempt (preserve attempt history)
     */
    public static bool $deleteScoresOnBulkReAttempt = false;

    public function getAllPaginated(array $search = [], int $pageSize = 15): LengthAwarePaginator {
        $this->handlePageSizeAll();

        return parent::getAllPaginated($search, $pageSize);
    }

    /**
     * @var StudentScoreRepository
     */
    protected $repository;

    protected function getRepositoryClass(): string {
        return StudentScoreRepositoryInterface::class;

    }

    /**
     * Start or continue tracking time for a question
     */
    public function startQuestion(int $userId, int $questionId): array {
        // Get or create student score record
        $score = $this->repository->findByUserAndQuestion($userId, $questionId);

        if (!$score) {
            $score = $this->create([
                'user_id' => $userId,
                'learning_material_question_id' => $questionId,
                'coding_time' => 0,
                'score' => 0,
                'completion_status' => false,
                'trial_status' => false,
            ]);
        }

        return [
            'score_id' => $score->id,
            'current_time' => $score->coding_time,
            'completion_status' => $score->completion_status,
            'trial_status' => $score->trial_status,
            'started_at' => Carbon::now()->timestamp,
        ];
    }

    /**
     * Complete a question and update the score
     *
     * @return Model|null
     */
    public function completeQuestion(int $userId, int $questionId, bool $completionStatus = true, ?int $score = null) {
        $studentScore = $this->repository->findByUserAndQuestion($userId, $questionId);

        if (!$studentScore) {
            return null;
        }

        $data = [
            'completion_status' => $completionStatus,
        ];

        if ($score !== null) {
            $data['score'] = $score;
        }

        $updatedScore = $this->update($studentScore, $data);

        // Check if all questions in this material are completed and lock workspace if so
        if ($completionStatus && $updatedScore) {
            $this->checkAndLockWorkspaceIfCompleted($userId, $questionId);
        }

        return $updatedScore;
    }

    /**
     * Update coding time for a question
     *
     * @return Model|null
     */
    public function updateCodingTime(int $scoreId, int $seconds) {
        $studentScore = $this->repository->find($scoreId);

        if (!$studentScore) {
            return null;
        }

        return $this->update($studentScore, [
            'coding_time' => $seconds,
        ]);
    }

    /**
     * Check if student can proceed to the next question
     */
    public function canProceedToNextQuestion(int $userId, int $questionId): bool {
        $score = $this->repository->findByUserAndQuestion($userId, $questionId);

        if (!$score) {
            return false;
        }

        // Student can proceed if they've tried to compile at least once
        return $score->trial_status;
    }

    /**
     * Get student progress for a learning material
     */
    public function getProgressForMaterial(int $userId, int $learningMaterialId): array {
        // Get all questions for the learning material, ordered by order_number
        $questions = LearningMaterialQuestion::where('learning_material_id', $learningMaterialId)
            ->where('active', true)
            ->orderBy('order_number')
            ->get();

        $completedQuestions = $this->repository->getCompletedQuestionsByMaterial($userId, $learningMaterialId);

        $totalQuestions = $questions->count();
        $completedCount = count($completedQuestions);

        $progress = [];
        foreach ($questions as $question) {
            $score = $this->repository->findByUserAndQuestion($userId, $question->id);
            $progress[] = [
                'id' => $question->id,
                'title' => $question->title,
                'order_number' => $question->order_number,
                'completed' => in_array($question->id, $completedQuestions),
                'score' => $score ? $score->score : 0,
                'coding_time' => $score ? $score->coding_time : 0,
                'trial_status' => $score ? $score->trial_status : false,
            ];
        }

        return [
            'total' => $totalQuestions,
            'completed' => $completedCount,
            'percentage' => $totalQuestions > 0 ? round(($completedCount / $totalQuestions) * 100) : 0,
            'questions' => $progress,
        ];
    }

    /**
     * Override update method to prevent updating completed scores and locked workspaces
     * TODO: review later for array_diff_key usage
     */
    public function update($keyOrModel, array $data): ?Model {
        $studentScore = $this->repository->find($keyOrModel);

        // If the answer is completed (marked as done), don't allow any updates to tracking metrics
        if ($studentScore && $studentScore->completion_status) {
            // Filter out all tracking metrics when answer is completed
            $data = array_diff_key($data, array_flip([
                'coding_time',
                'score',
                'completion_status',
                'trial_status',
                'compile_count',
                'test_case_complete_count',
                'test_case_total_count',
            ]));

            // If there's nothing left to update, return the current model
            if (empty($data)) {
                return $studentScore;
            }
        }

        // If the score is already completed, don't update tracking metrics
        if ($studentScore && $studentScore->completion_status) {
            // Still allow updates for non-tracking fields if needed
            // But filter out tracking metrics
            $data = array_diff_key($data, array_flip([
                'coding_time',
                'score',
                'completion_status',
                'trial_status',
                'compile_count',
            ]));

            // If there's nothing left to update, return the current model
            if (empty($data)) {
                return $studentScore;
            }
        }

        return parent::update($keyOrModel, $data);
    }

    /**
     * Check if all questions in a material are completed by a user
     */
    public function areAllQuestionsCompleted(int $userId, int $learningMaterialId): bool {
        // Get all active questions for the learning material
        $questions = LearningMaterialQuestion::where('learning_material_id', $learningMaterialId)
            ->where('active', true)
            ->get();

        if ($questions->isEmpty()) {
            return false;
        }

        // Check if all questions are completed
        $completedCount = $this->repository->getCompletedQuestionsByMaterial($userId, $learningMaterialId);

        return count($completedCount) === $questions->count();
    }

    /**
     * Lock workspace for a user in a material
     */
    public function lockWorkspaceForMaterial(int $userId, int $learningMaterialId): bool {
        // Get course to determine timeout
        $material = LearningMaterial::with('course')->find($learningMaterialId);
        if (!$material) {
            return false;
        }

        $timeoutDays = $material->course->workspace_lock_timeout_days ?? 7;

        // Get all student scores for this user and material
        $studentScores = StudentScore::where('user_id', $userId)
            ->whereHas('learning_material_question', function ($query) use ($learningMaterialId) {
                $query->where('learning_material_id', $learningMaterialId);
            })
            ->get();

        // Lock all scores for this material
        foreach ($studentScores as $score) {
            $score->lockWorkspace($timeoutDays);
        }

        return true;
    }

    /**
     * Unlock workspace for a user in a material (teacher override)
     */
    public function unlockWorkspaceForMaterial(int $userId, int $learningMaterialId): bool {
        // Get all student scores for this user and material
        $studentScores = StudentScore::where('user_id', $userId)
            ->whereHas('learning_material_question', function ($query) use ($learningMaterialId) {
                $query->where('learning_material_id', $learningMaterialId);
            })
            ->get();

        // Unlock all scores for this material
        foreach ($studentScores as $score) {
            $score->unlockWorkspace();
        }

        return true;
    }

    /**
     * Get locked students for a course/material
     */
    public function getLockedStudents(array $filters = []): array {
        Log::info('StudentScoreService@getLockedStudents called', [
            'filters' => $filters,
        ]);

        $query = StudentScore::with([
            'user',
            'learning_material_question.learning_material.course',
        ])
            ->where('is_workspace_locked', true);

        // Apply filters
        if (isset($filters['course_id'])) {
            $query->whereHas('learning_material_question.learning_material.course', function ($q) use ($filters) {
                $q->where('id', $filters['course_id']);
            });
        }

        if (isset($filters['learning_material_id'])) {
            $query->whereHas('learning_material_question', function ($q) use ($filters) {
                $q->where('learning_material_id', $filters['learning_material_id']);
            });
        }

        if (isset($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        $lockedScores = $query->get();

        Log::info('StudentScoreService@getLockedStudents found records', [
            'count' => $lockedScores->count(),
            'sql' => $query->toSql(),
            'bindings' => $query->getBindings(),
        ]);

        // Group by user + material to avoid duplicates
        $groupedResults = [];

        foreach ($lockedScores as $score) {
            $userId = $score->user_id;
            $materialId = $score->learning_material_question->learning_material_id;
            $groupKey = "{$userId}_{$materialId}";

            // Only use the first occurrence for each user+material combination
            if (!isset($groupedResults[$groupKey])) {
                $groupedResults[$groupKey] = $score;
            }
        }

        // Return as StudentScoreResource collection
        $result = StudentScoreResource::collection(array_values($groupedResults))->resolve();

        Log::info('StudentScoreService@getLockedStudents result', [
            'result_count' => count($result),
            'grouped_from' => $lockedScores->count(),
            'first_item' => $result[0] ?? null,
        ]);

        return $result;
    }

    /**
     * Reset student score for re-attempt
     */
    public function resetForReattempt(int $userId, int $questionId): bool {
        $studentScore = $this->repository->findByUserAndQuestion($userId, $questionId);

        if (!$studentScore) {
            return false;
        }

        // Check if re-attempt is allowed
        if ($studentScore->isWorkspaceLocked()) {
            throw new \Exception('Cannot reset: workspace is locked');
        }

        $studentScore->resetForReattempt();

        return true;
    }

    /**
     * Check workspace lock and automatically lock if all questions completed
     */
    public function checkAndLockWorkspaceIfCompleted(int $userId, int $questionId): void {
        // Get the question and material
        $question = LearningMaterialQuestion::find($questionId);
        if (!$question) {
            return;
        }

        $materialId = $question->learning_material_id;

        // Check if all questions in this material are now completed
        if ($this->areAllQuestionsCompleted($userId, $materialId)) {
            $this->lockWorkspaceForMaterial($userId, $materialId);
        }
    }

    /**
     * Mark answer as done (completed)
     */
    public function markAsDone(int $userId, int $questionId): bool {
        $studentScore = $this->repository->findByUserAndQuestion($userId, $questionId);

        if (!$studentScore) {
            return false;
        }

        // Check if workspace is locked
        if ($studentScore->isWorkspaceLocked()) {
            throw new \Exception('Cannot mark as done: workspace is locked');
        }

        // Mark as done and set score to 100 if some tests passed
        $result = $studentScore->markAsDone();

        // If student has some test cases passing, set score to 100
        if ($result && $studentScore->test_case_complete_count > 0) {
            $studentScore->score = 100;
            $studentScore->save();

            // Check if all questions in this material are completed and lock workspace if so
            $this->checkAndLockWorkspaceIfCompleted($userId, $questionId);
        }

        return $result;
    }

    /**
     * Allow re-attempt by marking question as not completed
     */
    public function allowReAttempt(int $userId, int $questionId): bool {
        $studentScore = $this->repository->findByUserAndQuestion($userId, $questionId);

        if (!$studentScore) {
            return false;
        }

        // Check if workspace is locked
        if ($studentScore->isWorkspaceLocked()) {
            throw new \Exception('Cannot allow re-attempt: workspace is locked by teacher');
        }

        return $studentScore->markForReAttempt();
    }

    /**
     * Allow re-attempt for all questions in a material
     * Behavior controlled by static::$deleteScoresOnBulkReAttempt:
     * - true: Delete all student scores completely (full reset)
     * - false: Mark questions for re-attempt (preserve attempt history)
     */
    public function allowReAttemptAllQuestions(int $userId, int $materialId): bool {
        // Get all student scores for this user and material
        $studentScores = StudentScore::where('user_id', $userId)
            ->whereHas('learning_material_question', function ($query) use ($materialId) {
                $query->where('learning_material_id', $materialId);
            })
            ->get();

        if ($studentScores->isEmpty()) {
            return false;
        }

        // Check if any workspace is locked
        foreach ($studentScores as $score) {
            if ($score->isWorkspaceLocked()) {
                throw new \Exception('Cannot allow re-attempt: workspace is locked by teacher');
            }
        }

        if (static::$deleteScoresOnBulkReAttempt) {
            // Option 1: Delete all student scores completely (full reset)
            $deletedCount = 0;
            foreach ($studentScores as $score) {
                if ($score->delete()) {
                    $deletedCount++;
                }
            }

            return $deletedCount > 0;
        }
        // Option 2: Mark all questions for re-attempt (preserve attempt history)
        $successCount = 0;
        foreach ($studentScores as $score) {
            if ($score->markForReAttempt()) {
                $successCount++;
            }
        }

        return $successCount > 0;
    }

    /**
     * Export student scores tabular data to Excel showing completion rates across all materials
     */
    public function exportTabularDataToExcel(array $filters = []): \Symfony\Component\HttpFoundation\BinaryFileResponse {
        // Create a new spreadsheet
        $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Student Scores Report');

        // Get filters
        $courseId = $filters['course_id'] ?? null;
        $learningMaterialId = $filters['learning_material_id'] ?? null;

        // Log::info('StudentScoreService@exportTabularDataToExcel started', [
        //     'filters' => $filters,
        //     'courseId' => $courseId,
        //     'learningMaterialId' => $learningMaterialId,
        // ]);

        // STEP 1: Get enrolled students for the course (if course filter is applied)
        $enrolledStudentIds = [];
        if ($courseId) {
            // Get students who are enrolled in the course through classroom
            $enrolledStudentIds = DB::table('users')
                ->join('class_room_students', 'users.id', '=', 'class_room_students.user_id')
                ->join('courses', 'class_room_students.class_room_id', '=', 'courses.class_room_id')
                ->where('courses.id', $courseId)
                ->pluck('users.id')
                ->toArray();

            // Log::info('StudentScoreService@exportTabularDataToExcel enrolled students', [
            //     'courseId' => $courseId,
            //     'enrolledCount' => count($enrolledStudentIds),
            //     'enrolledIds' => $enrolledStudentIds,
            // ]);
        }

        // STEP 2: Build query for student scores
        $query = StudentScore::with([
            'user',
            'learning_material_question.learning_material.course',
        ]);

        // Filter by course
        if ($courseId) {
            $query->whereHas('learning_material_question.learning_material.course', function ($q) use ($courseId) {
                $q->where('id', $courseId);
            });

            // CRUCIAL: Only include enrolled students
            if (!empty($enrolledStudentIds)) {
                $query->whereIn('user_id', $enrolledStudentIds);
            } else {
                // If no enrolled students found, return empty result
                Log::warning('No enrolled students found for course', ['courseId' => $courseId]);
            }
        }

        // Filter by learning material
        if ($learningMaterialId) {
            $query->whereHas('learning_material_question', function ($q) use ($learningMaterialId) {
                $q->where('learning_material_id', $learningMaterialId);
            });
        }

        // Log::info('StudentScoreService@exportTabularDataToExcel query built', [
        //     'sql' => $query->toRawSql(),
        // ]);

        $scores = $query->get();

        // Log::info('StudentScoreService@exportTabularDataToExcel scores retrieved', [
        //     'scoresCount' => $scores->count(),
        // ]);

        // STEP 3: Get correct student names - ALWAYS FRESH FROM DATABASE
        $uniqueStudentIds = $scores->pluck('user_id')->unique();
        $students = User::whereIn('id', $uniqueStudentIds)->get(['id', 'name']);
        $studentNames = [];
        foreach ($students as $student) {
            $studentNames[$student->id] = $student->name;
        }

        // If course filter is applied, also ensure we have names for all enrolled students
        if (!empty($enrolledStudentIds)) {
            $enrolledStudents = User::whereIn('id', $enrolledStudentIds)->get(['id', 'name']);
            foreach ($enrolledStudents as $student) {
                // Only add if not already present (prioritize actual score data)
                if (!isset($studentNames[$student->id])) {
                    $studentNames[$student->id] = $student->name;
                }
            }
        }

        // Log::info('StudentScoreService@exportTabularDataToExcel student names', [
        //     'studentNamesCount' => count($studentNames),
        //     'uniqueStudentIds' => $uniqueStudentIds->toArray(),
        //     'studentNames' => $studentNames,
        // ]);

        // STEP 4: Group data by student and material
        $studentsData = [];
        $materialsData = [];

        // Log::info('StudentScoreService@exportTabularDataToExcel processing scores', [
        //     'totalScores' => $scores->count(),
        //     'uniqueStudentIds' => $scores->pluck('user_id')->unique()->values()->toArray(),
        //     'uniqueStudentCount' => $scores->pluck('user_id')->unique()->count(),
        //     'scoresByStudent' => $scores->groupBy('user_id')->map(function ($group) {
        //         return [
        //             'count' => $group->count(),
        //             'first_name' => $group->first()->user->name ?? 'N/A',
        //             'score_ids' => $group->pluck('id')->toArray(),
        //         ];
        //     })->toArray(),
        // ]);

        foreach ($scores as $score) {
            $studentId = $score->user_id;
            $studentName = $studentNames[$studentId] ?? ('Unknown Student ID: ' . $studentId);
            $materialId = $score->learning_material_question->learning_material_id;
            $materialTitle = $score->learning_material_question->learning_material->title ?? 'Unknown Material';
            $courseName = $score->learning_material_question->learning_material->course->name ?? 'Unknown Course';

            // Log::info('StudentScoreService@exportTabularDataToExcel processing score', [
            //     'scoreId' => $score->id,
            //     'studentId' => $studentId,
            //     'studentNameFromArray' => $studentName,
            //     'studentNameFromRelation' => $score->user->name ?? 'N/A',
            //     'materialId' => $materialId,
            //     'questionId' => $score->learning_material_question_id,
            // ]);

            // CRITICAL FIX: Initialize student data with correct name and NEVER overwrite it
            if (!isset($studentsData[$studentId])) {
                $studentsData[$studentId] = [
                    'name' => $studentName,
                    'materials' => [],
                ];
                // Log::info('StudentScoreService@exportTabularDataToExcel new student added', [
                //     'studentId' => $studentId,
                //     'studentName' => $studentName,
                // ]);
            }
            // DO NOT UPDATE NAME AFTER INITIALIZATION - this was causing the overwrite issue

            // Store material info
            if (!isset($materialsData[$materialId])) {
                $materialsData[$materialId] = [
                    'title' => $materialTitle,
                    'course' => $courseName,
                    'order' => $score->learning_material_question->learning_material->order_number ?? 0,
                ];
            }

            // Store the score data
            if (!isset($studentsData[$studentId]['materials'][$materialId])) {
                $studentsData[$studentId]['materials'][$materialId] = [
                    'total_questions' => 0,
                    'completed_questions' => 0,
                    'total_test_cases' => 0,
                    'completed_test_cases' => 0,
                    'average_completion_rate' => 0,
                ];
            }

            // Aggregate the data
            $studentsData[$studentId]['materials'][$materialId]['total_questions']++;
            if ($score->completion_status) {
                $studentsData[$studentId]['materials'][$materialId]['completed_questions']++;
            }
            $studentsData[$studentId]['materials'][$materialId]['total_test_cases'] += $score->test_case_total_count;
            $studentsData[$studentId]['materials'][$materialId]['completed_test_cases'] += $score->test_case_complete_count;
        }

        // Log::info('StudentScoreService@exportTabularDataToExcel data grouped', [
        //     'studentsCount' => count($studentsData),
        //     'materialsCount' => count($materialsData),
        //     'studentsDataKeys' => array_keys($studentsData),
        // ]);

        // Debug specific students that might be duplicating
        // foreach ($studentsData as $studentId => $studentData) {
        //     Log::info('StudentScoreService@exportTabularDataToExcel final student data', [
        //         'studentId' => $studentId,
        //         'studentName' => $studentData['name'],
        //         'materialsKeys' => array_keys($studentData['materials']),
        //         'materialsData' => $studentData['materials'],
        //     ]);
        // }

        // Calculate average completion rates for each student-material combination
        foreach ($studentsData as $studentId => $studentData) {
            foreach ($studentData['materials'] as $materialId => $materialData) {
                if ($materialData['total_test_cases'] > 0) {
                    $studentsData[$studentId]['materials'][$materialId]['average_completion_rate'] = round(
                        ($materialData['completed_test_cases'] / $materialData['total_test_cases']) * 100,
                        2
                    );
                }
            }
        }

        // Sort materials by order
        uasort($materialsData, function ($a, $b) {
            return $a['order'] <=> $b['order'];
        });

        // Set up Excel headers
        $row = 1;
        $col = 'A';

        // Title
        $sheet->setCellValue('A1', 'Student Scores Report - Completion Rates by Material');
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(16);
        $sheet->mergeCells('A1:' . chr(65 + count($materialsData) + 2) . '1');
        $row++;

        // Add course filter info if applicable
        if ($courseId) {
            $courseName = $materialsData[array_key_first($materialsData)]['course'] ?? 'Unknown Course';
            $sheet->setCellValue('A2', 'Course: ' . $courseName);
            $sheet->getStyle('A2')->getFont()->setBold(true);
            $row++;
        }
        $row++;

        // Headers
        $sheet->setCellValue('A' . $row, 'Student Name');
        $sheet->setCellValue('B' . $row, 'Student ID');
        $col = 'C';

        foreach ($materialsData as $materialId => $materialInfo) {
            $sheet->setCellValue($col . $row, $materialInfo['title'] . ' (% Complete)');
            $col++;
        }

        $sheet->setCellValue($col . $row, 'Overall Average (%)');

        // Style headers
        $headerRange = 'A' . $row . ':' . $col . $row;
        $sheet->getStyle($headerRange)->getFont()->setBold(true);
        $sheet->getStyle($headerRange)->getFill()
            ->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
            ->getStartColor()->setRGB('E2E8F0');

        $row++;

        // Data rows
        foreach ($studentsData as $studentId => $studentData) {
            // Log::info('StudentScoreService@exportTabularDataToExcel writing row', [
            //     'rowNumber' => $row,
            //     'studentId' => $studentId,
            //     'studentName' => $studentData['name'],
            //     'materialsCount' => count($studentData['materials']),
            // ]);

            $col = 'A';
            $sheet->setCellValue($col++ . $row, $studentData['name']);
            $sheet->setCellValue($col++ . $row, $studentId);

            $totalCompletionRate = 0;

            foreach ($materialsData as $materialId => $materialInfo) {
                $completionRate = 0;
                if (isset($studentData['materials'][$materialId])) {
                    $completionRate = $studentData['materials'][$materialId]['average_completion_rate'];
                }
                $totalCompletionRate += $completionRate;

                $sheet->setCellValue($col++ . $row, $completionRate . '%');
            }

            // Calculate overall average based on ALL materials in course, not just ones student worked on
            $totalMaterialsInCourse = count($materialsData);
            $overallAverage = $totalMaterialsInCourse > 0 ? round($totalCompletionRate / $totalMaterialsInCourse, 2) : 0;
            $sheet->setCellValue($col . $row, $overallAverage . '%');

            $row++;
        }

        // Auto-size columns
        foreach (range('A', $col) as $column) {
            $sheet->getColumnDimension($column)->setAutoSize(true);
        }

        // Add color coding for completion rates
        $this->addCompletionRateColors($sheet, $row - 1, count($materialsData) + 3);

        // Create temporary file
        $filename = 'student_scores_tabular_data_' . date('Y-m-d_H-i-s') . '.xlsx';
        $tempPath = storage_path('app/temp/' . $filename);

        // Ensure temp directory exists
        if (!file_exists(storage_path('app/temp'))) {
            mkdir(storage_path('app/temp'), 0755, true);
        }

        // Save file
        $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);
        $writer->save($tempPath);

        // Return download response
        return response()->download($tempPath, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ])->deleteFileAfterSend();
    }

    /**
     * Add color coding for completion rates in the Excel sheet
     */
    private function addCompletionRateColors($sheet, $lastRow, $totalCols): void {
        // Color code completion rates
        for ($row = 5; $row <= $lastRow; $row++) {
            for ($col = 3; $col <= $totalCols; $col++) {
                $cellValue = $sheet->getCell(chr(64 + $col) . $row)->getValue();
                $percentage = floatval(str_replace('%', '', $cellValue));

                $color = 'FFFFFF'; // White default
                if ($percentage >= 80) {
                    $color = 'D4F6CC'; // Light green
                } elseif ($percentage >= 60) {
                    $color = 'FFF2CC'; // Light yellow
                } elseif ($percentage >= 40) {
                    $color = 'FFE6CC'; // Light orange
                } elseif ($percentage > 0) {
                    $color = 'FFCCCC'; // Light red
                }

                $sheet->getStyle(chr(64 + $col) . $row)
                    ->getFill()
                    ->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
                    ->getStartColor()->setRGB($color);
            }
        }
    }
}
