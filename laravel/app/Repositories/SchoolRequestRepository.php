<?php

namespace App\Repositories;

use App\Models\SchoolRequest;
use App\Support\Interfaces\Repositories\SchoolRequestRepositoryInterface;
use App\Traits\Repositories\HandlesFiltering;
use App\Traits\Repositories\HandlesRelations;
use App\Traits\Repositories\HandlesSorting;
use App\Traits\Repositories\RelationQueryable;
use Illuminate\Database\Eloquent\Builder;

class SchoolRequestRepository extends BaseRepository implements SchoolRequestRepositoryInterface {
    use HandlesFiltering, HandlesRelations, HandlesSorting, RelationQueryable;

    protected function applyFilters(array $searchParams = []): Builder {
        $query = $this->getQuery();

        $query = $this->applySearchFilters($query, $searchParams, ['status', 'message']);

        $query = $this->applyResolvedRelations($query, $searchParams);

        $query = $this->applyColumnFilters($query, $searchParams, ['user_id', 'created_at', 'updated_at']);

        $query = $this->applySorting($query, $searchParams);

        return $query;
    }

    protected function getModelClass(): string {
        return SchoolRequest::class;
    }
}
