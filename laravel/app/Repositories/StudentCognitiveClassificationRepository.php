<?php

namespace App\Repositories;

use App\Models\StudentCognitiveClassification;
use App\Support\Interfaces\Repositories\StudentCognitiveClassificationRepositoryInterface;
use App\Traits\Repositories\HandlesFiltering;
use App\Traits\Repositories\HandlesRelations;
use App\Traits\Repositories\HandlesSorting;
use App\Traits\Repositories\RelationQueryable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class StudentCognitiveClassificationRepository extends BaseRepository implements StudentCognitiveClassificationRepositoryInterface {
    use HandlesFiltering, HandlesRelations, HandlesSorting, RelationQueryable;

    protected function applyFilters(array $searchParams = []): Builder {
        $query = $this->getQuery();

        $query = $this->applySearchFilters($query, $searchParams, [
            'user_id', 'course_id', 'learning_material_id', 'classification_type',
            'classification_level', 'classification_score', 'raw_data',
            'classified_at', 'is_course_level',
        ]);

        $query = $this->applyResolvedRelations($query, $searchParams);

        // TODO: implement relation filters, e.g. student name
        $query = $this->applyColumnFilters($query, $searchParams, [
            'id', 'user_id', 'course_id', 'learning_material_id', 'classification_type',
            'classification_level', 'classification_score', 'raw_data',
            'classified_at', 'is_course_level', 'created_at', 'updated_at',
        ]);

        $query = $this->applySorting($query, $searchParams);

        return $query;
    }

    protected function getModelClass(): string {
        return StudentCognitiveClassification::class;
    }

    /**
     * Get all classifications with specified relations
     */
    public function getAllWithRelationsQuery(array $relations = []): Builder {
        $query = $this->getQuery();

        if (!empty($relations)) {
            foreach ($relations as $relation => $callback) {
                if (is_callable($callback)) {
                    $query->with([$relation => $callback]);
                } else {
                    $query->with($relation);
                }
            }
        }

        return $query;
    }

    /**
     * Get material-level classifications for a student in a course
     */
    public function getMaterialClassificationsForStudent(int $userId, int $courseId, string $classificationType = 'topsis'): Collection {
        return $this->getQuery()
            ->where('user_id', $userId)
            ->where('course_id', $courseId)
            ->where('classification_type', $classificationType)
            ->where('is_course_level', false)
            ->whereNotNull('learning_material_id')
            ->with('learning_material')
            ->orderBy('learning_material_id')
            ->get();
    }

    /**
     * Get course-level classification for a student
     */
    public function getCourseClassificationForStudent(int $userId, int $courseId, string $classificationType = 'topsis'): ?object {
        return $this->getQuery()
            ->where('user_id', $userId)
            ->where('course_id', $courseId)
            ->where('classification_type', $classificationType)
            ->where('is_course_level', true)
            ->first();
    }
}
