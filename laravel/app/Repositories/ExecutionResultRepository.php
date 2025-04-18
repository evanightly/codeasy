<?php

namespace App\Repositories;

use App\Models\ExecutionResult;
use App\Support\Interfaces\Repositories\ExecutionResultRepositoryInterface;
use App\Traits\Repositories\HandlesFiltering;
use App\Traits\Repositories\HandlesRelations;
use App\Traits\Repositories\HandlesSorting;
use App\Traits\Repositories\RelationQueryable;
use Illuminate\Database\Eloquent\Builder;

class ExecutionResultRepository extends BaseRepository implements ExecutionResultRepositoryInterface {
    use HandlesFiltering, HandlesRelations, HandlesSorting, RelationQueryable;

    protected function applyFilters(array $searchParams = []): Builder {
        $query = $this->getQuery();

        $query = $this->applySearchFilters($query, $searchParams, ['name', 'group']);

        $query = $this->applyResolvedRelations($query, $searchParams);

        $query = $this->applyColumnFilters($query, $searchParams, ['created_at', 'updated_at']);

        $query = $this->applySorting($query, $searchParams);

        return $query;
    }

    /**
     * Find the latest execution result for a student score
     *
     * @return \App\Models\ExecutionResult|null
     */
    public function findLatestByStudentScore(int $studentScoreId) {
        return ExecutionResult::where('student_score_id', $studentScoreId)
            ->latest()
            ->first();
    }

    /**
     * Count the compilation attempts for a student score
     */
    public function countCompilationAttempts(int $studentScoreId): int {
        return ExecutionResult::where('student_score_id', $studentScoreId)->count();
    }

    protected function getModelClass(): string {
        return ExecutionResult::class;
    }
}
