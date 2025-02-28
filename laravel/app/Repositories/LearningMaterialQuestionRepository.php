<?php

namespace App\Repositories;

use App\Models\LearningMaterialQuestion;
use App\Support\Interfaces\Repositories\LearningMaterialQuestionRepositoryInterface;
use App\Traits\Repositories\HandlesFiltering;
use App\Traits\Repositories\HandlesRelations;
use App\Traits\Repositories\HandlesSorting;
use App\Traits\Repositories\RelationQueryable;
use Illuminate\Database\Eloquent\Builder;

class LearningMaterialQuestionRepository extends BaseRepository implements LearningMaterialQuestionRepositoryInterface {
    use HandlesFiltering, HandlesRelations, HandlesSorting, RelationQueryable;

    protected function applyFilters(array $searchParams = []): Builder {
        $query = $this->getQuery();

        $query = $this->applySearchFilters($query, $searchParams, ['name', 'group']);

        $query = $this->applyResolvedRelations($query, $searchParams);

        $query = $this->applyColumnFilters($query, $searchParams, ['created_at', 'updated_at']);

        $query = $this->applySorting($query, $searchParams);

        return $query;
    }

    protected function getModelClass(): string {
        return LearningMaterialQuestion::class;
    }
}
