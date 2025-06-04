<?php

namespace App\Support\Interfaces\Services;

interface LearningMaterialServiceInterface extends BaseCrudServiceInterface {
    /**
     * Get user progress for a learning material
     */
    public function getUserProgress(int $userId, int $materialId): array;

    /**
     * Get next and previous question information
     */
    public function getQuestionNavigation(int $materialId, int $currentQuestionId): array;

    /**
     * Get PDF file as base64 encoded string
     */
    public function getPdfAsBase64(string $filePath): array;
}
