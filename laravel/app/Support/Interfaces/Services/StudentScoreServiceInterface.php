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

    /**
     * Check if all questions in a material are completed by a user
     */
    public function areAllQuestionsCompleted(int $userId, int $learningMaterialId): bool;

    /**
     * Lock workspace for a user in a material
     */
    public function lockWorkspaceForMaterial(int $userId, int $learningMaterialId): bool;

    /**
     * Unlock workspace for a user in a material (teacher override)
     */
    public function unlockWorkspaceForMaterial(int $userId, int $learningMaterialId): bool;

    /**
     * Get locked students for a course/material
     */
    public function getLockedStudents(array $filters = []): array;

    /**
     * Reset student score for re-attempt
     */
    public function resetForReattempt(int $userId, int $questionId): bool;

    /**
     * Check workspace lock and automatically lock if all questions completed
     */
    public function checkAndLockWorkspaceIfCompleted(int $userId, int $questionId): void;
}
