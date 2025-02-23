<?php

namespace App\Services;

use Adobrovolsky97\LaravelRepositoryServicePattern\Services\BaseCrudService;
use App\Models\School;
use App\Repositories\SchoolRepository;
use App\Support\Enums\RoleEnum;
use App\Support\Interfaces\Repositories\SchoolRepositoryInterface;
use App\Support\Interfaces\Services\SchoolServiceInterface;
use App\Support\Interfaces\Services\UserServiceInterface;
use App\Traits\Services\HandlesPageSizeAll;
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
}
