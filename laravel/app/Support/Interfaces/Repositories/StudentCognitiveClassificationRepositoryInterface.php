<?php

namespace App\Support\Interfaces\Repositories;

use Adobrovolsky97\LaravelRepositoryServicePattern\Repositories\Contracts\BaseRepositoryInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

interface StudentCognitiveClassificationRepositoryInterface extends BaseRepositoryInterface {
    /**
     * Get all classifications with specified relations
     */
    public function getAllWithRelationsQuery(array $relations = []): Builder;

    /**
     * Get material-level classifications for a student in a course
     */
    public function getMaterialClassificationsForStudent(int $userId, int $courseId, string $classificationType = 'topsis'): Collection;

    /**
     * Get course-level classification for a student
     */
    public function getCourseClassificationForStudent(int $userId, int $courseId, string $classificationType = 'topsis'): ?object;
}
