<?php

namespace App\Repositories;

use App\Models\StudentCourseCognitiveClassificationHistory;
use App\Support\Interfaces\Repositories\StudentCourseCognitiveClassificationHistoryRepositoryInterface;
use App\Traits\Repositories\HandlesFiltering;
use App\Traits\Repositories\HandlesRelations;
use App\Traits\Repositories\HandlesSorting;
use App\Traits\Repositories\RelationQueryable;
use Illuminate\Database\Eloquent\Builder;

class StudentCourseCognitiveClassificationHistoryRepository extends BaseRepository implements StudentCourseCognitiveClassificationHistoryRepositoryInterface {
    use HandlesFiltering, HandlesRelations, HandlesSorting, RelationQueryable;

    protected function applyFilters(array $searchParams = []): Builder {
        $query = $this->getQuery();

        $query = $this->applySearchFilters($query, $searchParams, ['course_id', 'user_id', 'student_course_cognitive_classification_id', 'classification_type', 'classification_level', 'classification_score', 'raw_data', 'classified_at']);

        $query = $this->applyResolvedRelations($query, $searchParams);

        $query = $this->applyColumnFilters($query, $searchParams, ['id', 'course_id', 'user_id', 'student_course_cognitive_classification_id', 'classification_type', 'classification_level', 'classification_score', 'raw_data', 'classified_at', 'created_at', 'updated_at']);

        $query = $this->applySorting($query, $searchParams);

        return $query;
    }

    protected function getModelClass(): string {
        return StudentCourseCognitiveClassificationHistory::class;
    }
}
