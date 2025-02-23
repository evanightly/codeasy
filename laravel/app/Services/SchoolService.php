<?php

namespace App\Services;

use Adobrovolsky97\LaravelRepositoryServicePattern\Services\BaseCrudService;
use App\Models\School;
use App\Models\SchoolRequest;
use App\Repositories\SchoolRepository;
use App\Support\Enums\RoleEnum;
use App\Support\Interfaces\Repositories\SchoolRepositoryInterface;
use App\Support\Interfaces\Services\SchoolServiceInterface;
use App\Support\Interfaces\Services\UserServiceInterface;
use App\Traits\Services\HandlesPageSizeAll;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class SchoolService extends BaseCrudService implements SchoolServiceInterface {
    use HandlesPageSizeAll;

    public function __construct(protected UserServiceInterface $userService) {
        parent::__construct();
    }

    public function getAllPaginated(array $search = [], int $pageSize = 15): LengthAwarePaginator {
        $this->handlePageSizeAll();

        return parent::getAllPaginated($search, $pageSize);
    }

    /** @var SchoolRepository */
    protected $repository;

    protected function getRepositoryClass(): string {
        return SchoolRepositoryInterface::class;
    }

    public function assignSchoolAdmin(School $school, array $validatedRequest): void {
        $userId = $validatedRequest['user_id'];

        // Remove any existing admin role for this school if exists
        $school->administrators()->detach($userId);

        // Attach the new admin
        $school->users()->attach($userId, [
            'role' => RoleEnum::SCHOOL_ADMIN->value,
        ]);

        // Assign the School Admin role if they don't have it
        $user = $this->userService->findOrFail($userId);
        if (!$user->hasRole(RoleEnum::SCHOOL_ADMIN->value)) {
            $user->assignRole(RoleEnum::SCHOOL_ADMIN->value);
        }
    }

    public function unassignSchoolAdmin(School $school, array $validatedRequest): void {
        $userId = $validatedRequest['user_id'];

        // Remove admin role for this school
        $school->administrators()->detach($userId);

        // Remove School Admin role if user has no other schools where they are admin
        $user = $this->userService->findOrFail($userId);
        if (!$user->schools()->wherePivot('role', RoleEnum::SCHOOL_ADMIN->value)->exists()) {
            $user->removeRole(RoleEnum::SCHOOL_ADMIN->value);
        }
    }

    public function assignSchoolTeacher(School $school, array $validatedRequest): void {
        $userId = $validatedRequest['user_id'];

        // Attach the teacher to school
        $school->users()->attach($userId, [
            'role' => RoleEnum::TEACHER->value,
        ]);

        // Assign teacher role if they don't have it
        $user = $this->userService->findOrFail($userId);
        if (!$user->hasRole(RoleEnum::TEACHER->value)) {
            $user->assignRole(RoleEnum::TEACHER->value);
        }
    }

    public function unassignSchoolTeacher(School $school, array $validatedRequest): void {
        $userId = $validatedRequest['user_id'];

        // Remove teacher from school
        $school->teachers()->detach($userId);

        // Remove Teacher role if user has no other schools where they are teacher
        $user = $this->userService->findOrFail($userId);
        if (!$user->schools()->wherePivot('role', RoleEnum::TEACHER->value)->exists()) {
            $user->removeRole(RoleEnum::TEACHER->value);
        }
    }

    public function assignStudent(School $school, array $validatedRequest): void {
        $userId = $validatedRequest['user_id'];

        // Attach the student to school
        $school->users()->attach($userId, [
            'role' => RoleEnum::STUDENT->value,
        ]);

        // Assign student role if they don't have it
        $user = $this->userService->findOrFail($userId);
        if (!$user->hasRole(RoleEnum::STUDENT->value)) {
            $user->assignRole(RoleEnum::STUDENT->value);
        }
    }

    public function unassignStudent(School $school, array $validatedRequest): void {
        $userId = $validatedRequest['user_id'];

        // Remove student from school
        $school->students()->detach($userId);

        // Remove Student role if user has no other schools where they are student
        $user = $this->userService->findOrFail($userId);
        if (!$user->schools()->wherePivot('role', RoleEnum::STUDENT->value)->exists()) {
            $user->removeRole(RoleEnum::STUDENT->value);
        }
    }
}
