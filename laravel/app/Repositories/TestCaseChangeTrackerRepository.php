<?php

namespace App\Repositories;

use App\Models\TestCaseChangeTracker;
use App\Support\Interfaces\Repositories\TestCaseChangeTrackerRepositoryInterface;
use App\Traits\Repositories\HandlesFiltering;
use App\Traits\Repositories\HandlesRelations;
use App\Traits\Repositories\HandlesSorting;
use App\Traits\Repositories\RelationQueryable;
use Illuminate\Database\Eloquent\Builder;

class TestCaseChangeTrackerRepository extends BaseRepository implements TestCaseChangeTrackerRepositoryInterface
{
    use HandlesFiltering, HandlesRelations, HandlesSorting, RelationQueryable;

    protected function applyFilters(array $searchParams = []): Builder {
        $query = $this->getQuery();

        $query = $this->applySearchFilters($query, $searchParams, ['test_case_id', 'learning_material_question_id', 'learning_material_id', 'course_id', 'change_type', 'previous_data', 'affected_student_ids', 'status', 'scheduled_at', 'completed_at', 'execution_details']);

        $query = $this->applyResolvedRelations($query, $searchParams);

        $query = $this->applyColumnFilters($query, $searchParams, ['id', 'test_case_id', 'learning_material_question_id', 'learning_material_id', 'course_id', 'change_type', 'previous_data', 'affected_student_ids', 'status', 'scheduled_at', 'completed_at', 'execution_details', 'created_at', 'updated_at']);

        $query = $this->applySorting($query, $searchParams);

        return $query;
    }

    protected function getModelClass(): string {
        return TestCaseChangeTracker::class;
    }
}
