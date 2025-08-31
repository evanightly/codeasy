<?php

namespace App\Repositories;

use App\Models\StudentCourseCognitiveClassification;
use App\Support\Interfaces\Repositories\StudentCourseCognitiveClassificationRepositoryInterface;
use App\Traits\Repositories\HandlesFiltering;
use App\Traits\Repositories\HandlesRelations;
use App\Traits\Repositories\HandlesSorting;
use App\Traits\Repositories\RelationQueryable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class StudentCourseCognitiveClassificationRepository extends BaseRepository implements StudentCourseCognitiveClassificationRepositoryInterface {
    use HandlesFiltering, HandlesRelations, HandlesSorting, RelationQueryable;

    protected function applyFilters(array $searchParams = []): Builder {
        $query = $this->getQuery();

        $query = $this->applySearchFilters($query, $searchParams, ['course_id', 'user_id', 'classification_type', 'classification_level', 'classification_score', 'raw_data', 'classified_at']);

        $query = $this->applyResolvedRelations($query, $searchParams);

        $query = $this->applyColumnFilters($query, $searchParams, ['id', 'course_id', 'user_id', 'classification_type', 'classification_level', 'classification_score', 'raw_data', 'classified_at', 'created_at', 'updated_at']);

        $query = $this->applySorting($query, $searchParams);

        return $query;
    }

    /**
     * Get all student course cognitive classifications for a specific course
     */
    public function getByCourseId(int $courseId, string $classificationType = 'topsis'): Collection {
        return $this->getQuery()
            ->where('course_id', $courseId)
            ->where('classification_type', $classificationType)
            ->with(['user', 'course'])
            ->get();
    }

    /**
     * Get latest classification for each student in a course (deduplicated)
     */
    public function getLatestByCourseId(int $courseId, string $classificationType = 'topsis'): Collection {
        return $this->getQuery()
            ->where('course_id', $courseId)
            ->where('classification_type', $classificationType)
            ->whereIn('id', function ($query) use ($courseId, $classificationType) {
                $query->select(DB::raw('MAX(id)'))
                    ->from('student_course_cognitive_classifications')
                    ->where('course_id', $courseId)
                    ->where('classification_type', $classificationType)
                    ->groupBy('user_id');
            })
            ->with(['user', 'course'])
            ->get();
    }

    /**
     * Get student course cognitive classification for a specific student and course
     */
    public function getByUserAndCourseId(int $userId, int $courseId, string $classificationType = 'topsis'): ?object {
        return $this->getQuery()
            ->where('user_id', $userId)
            ->where('course_id', $courseId)
            ->where('classification_type', $classificationType)
            ->with(['user', 'course'])
            ->first();
    }

    protected function getModelClass(): string {
        return StudentCourseCognitiveClassification::class;
    }
}
