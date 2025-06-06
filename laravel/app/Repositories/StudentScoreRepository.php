<?php

namespace App\Repositories;

use App\Models\StudentScore;
use App\Support\Interfaces\Repositories\StudentScoreRepositoryInterface;
use App\Traits\Repositories\HandlesFiltering;
use App\Traits\Repositories\HandlesRelations;
use App\Traits\Repositories\HandlesSorting;
use App\Traits\Repositories\RelationQueryable;
use Illuminate\Database\Eloquent\Builder;

class StudentScoreRepository extends BaseRepository implements StudentScoreRepositoryInterface {
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
     * Find a student score by user and question IDs
     *
     * @return \App\Models\StudentScore|null
     */
    public function findByUserAndQuestion(int $userId, int $questionId) {
        return StudentScore::where('user_id', $userId)
            ->where('learning_material_question_id', $questionId)
            ->first();
    }

    /**
     * Get all completed questions for a user in a learning material
     *
     * @return array
     */
    public function getCompletedQuestionsByMaterial(int $userId, int $learningMaterialId) {
        return StudentScore::where('user_id', $userId)
            ->whereHas('learning_material_question', function ($query) use ($learningMaterialId) {
                $query->where('learning_material_id', $learningMaterialId);
            })
            ->where('completion_status', true)
            ->pluck('learning_material_question_id')
            ->toArray();
    }

    protected function getModelClass(): string {
        return StudentScore::class;
    }
}
