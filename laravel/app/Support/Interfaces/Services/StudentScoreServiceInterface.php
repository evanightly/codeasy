<?php

namespace App\Support\Interfaces\Services;

interface StudentScoreServiceInterface extends BaseCrudServiceInterface {
    /**
     * Start or continue tracking time for a question
     */
    public function startQuestion(int $userId, int $questionId): array;

    /**
     * Complete a question and update the score
     *
     * @return \App\Models\StudentScore|null
     */
    public function completeQuestion(int $userId, int $questionId, bool $completionStatus = true, ?int $score = null);

    /**
     * Check if student can proceed to the next question
     */
    public function canProceedToNextQuestion(int $userId, int $questionId): bool;

    /**
     * Get student progress for a learning material
     */
    public function getProgressForMaterial(int $userId, int $learningMaterialId): array;
}
