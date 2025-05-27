<?php

namespace App\Services;

use App\Http\Resources\StudentScoreResource;
use App\Models\LearningMaterial;
use App\Models\LearningMaterialQuestion;
use App\Models\StudentScore;
use App\Repositories\StudentScoreRepository;
use App\Support\Interfaces\Repositories\StudentScoreRepositoryInterface;
use App\Support\Interfaces\Services\StudentScoreServiceInterface;
use App\Traits\Services\HandlesPageSizeAll;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;
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
}
