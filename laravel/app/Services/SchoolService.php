<?php

namespace App\Services;

use App\Models\School;
use App\Repositories\SchoolRepository;
use App\Support\Enums\RoleEnum;
use App\Support\Interfaces\Repositories\SchoolRepositoryInterface;
use App\Support\Interfaces\Services\SchoolServiceInterface;
use App\Support\Interfaces\Services\UserServiceInterface;
use App\Traits\Services\HandlesPageSizeAll;
use Error;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

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

        // Check if user is already an admin of this school
        if ($school->administrators()->where('user_id', $userId)->exists()) {
            throw new \InvalidArgumentException(__('exceptions.services.school.admin.already_assigned'));
        }

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

        // Check if user is already a teacher of this school
        if ($school->teachers()->where('user_id', $userId)->exists()) {
            throw new \InvalidArgumentException(__('exceptions.services.school.teacher.already_assigned'));
        }

        // Check if user has any other roles in this school
        if ($school->users()->where('user_id', $userId)->exists()) {
            throw new \InvalidArgumentException(__('exceptions.services.school.teacher.different_role'));
        }

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

        // Check if user is already a student of this school
        if ($school->students()->where('user_id', $userId)->exists()) {
            throw new Error(__('exceptions.services.school.student.already_assigned'));
            // throw new \InvalidArgumentException(__('exceptions.services.school.student.already_assigned'));
        }

        // Check if user has any other roles in this school
        if ($school->users()->where('user_id', $userId)->exists()) {
            throw new \InvalidArgumentException(__('exceptions.services.school.student.different_role'));
        }

        // Attach the student to school
        $school->users()->attach($userId, [
            'role' => RoleEnum::STUDENT->value,
        ]);

        // Assign student role if they don't have it
        // $user = $this->userService->findOrFail($userId);
        // if (!$user->hasRole(RoleEnum::STUDENT->value)) {
        //     $user->assignRole(RoleEnum::STUDENT->value);
        // }
    }

    public function unassignStudent(School $school, array $validatedRequest): void {
        $userId = $validatedRequest['user_id'];

        // Remove student from school
        $school->students()->detach($userId);

        // Remove Student role if user has no other schools where they are student
        // $user = $this->userService->findOrFail($userId);
        // if (!$user->schools()->wherePivot('role', RoleEnum::STUDENT->value)->exists()) {
        //     $user->removeRole(RoleEnum::STUDENT->value);
        // }
    }

    public function assignBulkStudents(School $school, array $validatedRequest): void {
        $userIds = $validatedRequest['user_ids'];

        // Get already assigned student IDs to avoid duplicates
        $existingStudentIds = $school->students()->pluck('user_id')->toArray();

        // Filter out already assigned students
        $newStudentIds = array_diff($userIds, $existingStudentIds);

        if (empty($newStudentIds)) {
            throw new \InvalidArgumentException(__('exceptions.services.school.student.all_already_assigned'));
        }

        // Attach new students to school
        $school->users()->attach($newStudentIds, [
            'role' => RoleEnum::STUDENT->value,
        ]);

        // Assign student role to users who don't have it
        // foreach ($newStudentIds as $userId) {
        //     $user = $this->userService->findOrFail($userId);
        //     if (!$user->hasRole(RoleEnum::STUDENT->value)) {
        //         $user->assignRole(RoleEnum::STUDENT->value);
        //     }
        // }
    }

    public function unassignBulkStudents(School $school, array $validatedRequest): void {
        $userIds = $validatedRequest['user_ids'];

        // Remove students from school
        $school->students()->detach($userIds);

        // Remove Student role for users who have no other schools where they are student
        // foreach ($userIds as $userId) {
        //     $user = $this->userService->findOrFail($userId);
        //     if (!$user->schools()->wherePivot('role', RoleEnum::STUDENT->value)->exists()) {
        //         $user->removeRole(RoleEnum::STUDENT->value);
        //     }
        // }
    }

    public function assignBulkSchoolAdmins(School $school, array $validatedRequest): void {
        $userIds = $validatedRequest['user_ids'];

        foreach ($userIds as $userId) {
            // Check if user is already an admin of this school
            if ($school->administrators()->where('user_id', $userId)->exists()) {
                continue; // Skip if already assigned
            }

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
    }
}
