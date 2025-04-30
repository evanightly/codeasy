<?php

namespace App\Repositories;

use App\Models\StudentCognitiveClassification;
use App\Support\Interfaces\Repositories\StudentCognitiveClassificationRepositoryInterface;
use App\Traits\Repositories\HandlesFiltering;
use App\Traits\Repositories\HandlesRelations;
use App\Traits\Repositories\HandlesSorting;
use App\Traits\Repositories\RelationQueryable;
use Illuminate\Database\Eloquent\Builder;

class StudentCognitiveClassificationRepository extends BaseRepository implements StudentCognitiveClassificationRepositoryInterface {
    use HandlesFiltering, HandlesRelations, HandlesSorting, RelationQueryable;

    protected function applyFilters(array $searchParams = []): Builder {
        $query = $this->getQuery();

        $query = $this->applySearchFilters($query, $searchParams, ['user_id', 'course_id', 'classification_type', 'classification_level', 'classification_score', 'raw_data', 'classified_at']);

        $query = $this->applyResolvedRelations($query, $searchParams);

        // TODO: implement relation filters, e.g. student name
        $query = $this->applyColumnFilters($query, $searchParams, ['id', 'user_id', 'course_id', 'classification_type', 'classification_level', 'classification_score', 'raw_data', 'classified_at', 'created_at', 'updated_at']);

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
}
