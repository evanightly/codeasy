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

    /**
     * Mark answer as done (completed)
     */
    public function markAsDone(int $userId, int $questionId): bool;

    /**
     * Allow re-attempt by marking question as not completed
     */
    public function allowReAttempt(int $userId, int $questionId): bool;

    /**
     * Allow re-attempt for all questions in a material
     */
    public function allowReAttemptAllQuestions(int $userId, int $materialId): bool;

    /**
     * Export student scores tabular data to Excel
     */
    public function exportTabularDataToExcel(array $filters = []): \Symfony\Component\HttpFoundation\BinaryFileResponse;

    /**
     * Export enhanced student scores data to Excel with multiple sheets
     */
    public function exportEnhancedTabularDataToExcel(array $filters = []): \Symfony\Component\HttpFoundation\BinaryFileResponse;

    /**
     * Get available classification history dates for a course and classification type
     */
    public function getAvailableClassificationHistoryDates(int $courseId, string $classificationType): array;
}
