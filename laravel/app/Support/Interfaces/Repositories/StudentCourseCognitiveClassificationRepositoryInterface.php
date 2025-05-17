<?php

namespace App\Support\Interfaces\Repositories;

use Illuminate\Support\Collection;

interface StudentCourseCognitiveClassificationRepositoryInterface extends BaseRepositoryInterface {
    /**
     * Get all student course cognitive classifications for a specific course
     */
    public function getByCourseId(int $courseId, string $classificationType = 'topsis'): Collection;

    /**
     * Get student course cognitive classification for a specific student and course
     */
    public function getByUserAndCourseId(int $userId, int $courseId, string $classificationType = 'topsis'): ?object;
}
