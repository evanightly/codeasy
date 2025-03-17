<?php

namespace App\Support\Interfaces\Repositories;

interface StudentScoreRepositoryInterface extends BaseRepositoryInterface {
    /**
     * Find a student score by user and question IDs
     *
     * @return \App\Models\StudentScore|null
     */
    public function findByUserAndQuestion(int $userId, int $questionId);

    /**
     * Get all completed questions for a user in a learning material
     *
     * @return array
     */
    public function getCompletedQuestionsByMaterial(int $userId, int $learningMaterialId);
}
