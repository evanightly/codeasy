<?php

namespace App\Repositories;

use App\Models\User;
use App\Support\Enums\IntentEnum;
use App\Support\Enums\RoleEnum;
use App\Support\Interfaces\Repositories\UserRepositoryInterface;
use App\Traits\Repositories\HandlesFiltering;
use App\Traits\Repositories\HandlesRelations;
use App\Traits\Repositories\HandlesSorting;
use App\Traits\Repositories\RelationQueryable;
use Illuminate\Database\Eloquent\Builder;

class UserRepository extends BaseRepository implements UserRepositoryInterface {
    use HandlesFiltering, HandlesRelations, HandlesSorting, RelationQueryable;

    protected function applyFilters(array $searchParams = []): Builder {
        $intent = request()->get('intent');

        $query = $this->getQuery();

        switch ($intent) {
            // Used in School/AssignStudentDialog
            case IntentEnum::USER_INDEX_STUDENTS->value:
                $schoolId = request()->get('school_id');

                if (!$schoolId) {
                    throw new \Exception('School ID is required for this intent');
                }

                $query->whereHas('roles',
                    fn ($query) => $query->where('name', RoleEnum::STUDENT->value)
                )->whereHas('schools', function ($query) use ($schoolId) {
                    $query->where('schools.id', $schoolId);
                });
                break;
                // Used in Classroom/AssignStudentDialog
            case IntentEnum::USER_INDEX_CLASS_ROOM_STUDENTS->value:
                $schoolId = request()->get('school_id');
                $classroomId = request()->get('classroom_id');

                $query->whereHas('roles',
                    fn ($q) => $q->where('name', RoleEnum::STUDENT->value)
                )->whereHas('schools', function ($q) use ($schoolId) {
                    $q->where('schools.id', $schoolId);
                })->whereDoesntHave('classrooms', function ($q) use ($classroomId) {
                    $q->where('class_rooms.id', $classroomId);
                });
                break;
        }

        $query = $this->applySearchFilters($query, $searchParams, ['name', 'username', 'email']);

        $query = $this->applyRelationshipArrayFilters($query, $searchParams, [
            'roles' => [
                'relation' => 'roles',
                'column' => 'name',
            ],
            'schools' => [
                'relation' => 'schools',
                'column' => 'id',
            ],
            'classrooms' => [
                'relation' => 'classrooms',
                'column' => 'id',
            ],
            // Uncomment if you want to filter by classroom name
            // 'classroom_name' => [
            //     'relation' => 'classrooms',
            //     'column' => 'name',
            // ],
        ]);

        $query = $this->applyResolvedRelations($query, $searchParams);

        $query = $this->applyColumnFilters($query, $searchParams, ['created_at', 'updated_at']);

        $query = $this->applySorting($query, $searchParams);

        return $query;
    }

    /**
     * Find students enrolled in a specific course
     */
    public function findStudentsByCourse(int $courseId) {
        return User::whereHas('classrooms.courses', function ($query) use ($courseId) {
            $query->where('courses.id', $courseId);
        })
            ->whereHas('roles', function ($query) {
                $query->where('name', RoleEnum::STUDENT->value);
            })
            ->get(['id', 'name', 'email', 'username']);
    }

    protected function getModelClass(): string {
        return User::class;
    }
}
