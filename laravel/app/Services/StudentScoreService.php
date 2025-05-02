<?php

namespace App\Services;

use App\Models\LearningMaterialQuestion;
use App\Support\Interfaces\Repositories\StudentScoreRepositoryInterface;
use App\Support\Interfaces\Services\StudentScoreServiceInterface;
use App\Traits\Services\HandlesPageSizeAll;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;

class StudentScoreService extends BaseCrudService implements StudentScoreServiceInterface {
    use HandlesPageSizeAll;

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

        return $this->update($studentScore, $data);
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
     * Override update method to prevent updating completed scores
     * TODO: review later for array_diff_key usage
     */
    public function update($keyOrModel, array $data): ?Model {
        $studentScore = $this->repository->find($keyOrModel);

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
}
