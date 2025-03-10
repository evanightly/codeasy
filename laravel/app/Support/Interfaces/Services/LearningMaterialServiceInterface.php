<?php

namespace App\Support\Interfaces\Services;

use Adobrovolsky97\LaravelRepositoryServicePattern\Services\Contracts\BaseCrudServiceInterface;

interface LearningMaterialServiceInterface extends BaseCrudServiceInterface {
    /**
     * Get user progress for a learning material
     */
    public function getUserProgress(int $userId, int $materialId): array;

    /**
     * Get next and previous question information
     */
    public function getQuestionNavigation(int $materialId, int $currentQuestionId): array;
}
