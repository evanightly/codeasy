<?php

namespace App\Services;

use App\Models\SchoolRequest;
use App\Repositories\SchoolRequestRepository;
use App\Support\Enums\RoleEnum;
use App\Support\Interfaces\Repositories\SchoolRequestRepositoryInterface;
use App\Support\Interfaces\Services\RoleServiceInterface;
use App\Support\Interfaces\Services\SchoolRequestServiceInterface;
use App\Support\Interfaces\Services\UserServiceInterface;
use App\Traits\Services\HandlesPageSizeAll;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class SchoolRequestService extends BaseCrudService implements SchoolRequestServiceInterface {
    use HandlesPageSizeAll;

    /** @var SchoolRequestRepository */
    protected $repository;

    public function __construct(protected RoleServiceInterface $roleService, protected UserServiceInterface $userService) {
        parent::__construct();
    }

    public function approveTeacherRequest(SchoolRequest $schoolRequest): void {
        if (!$schoolRequest->isPending()) {
            throw new \Exception('SchoolRequest has already been processed');
        }

        DB::transaction(function () use ($schoolRequest) {
            // Handle if the teacher already exists in the school
            if ($schoolRequest->school->users()->where('user_id', $schoolRequest->user_id)->exists()) {
                $schoolRequest->approve();

                return;
            }

            // Attach the teacher to school using the base users relationship
            $schoolRequest->school->users()->attach($schoolRequest->user_id, [
                'role' => RoleEnum::TEACHER->value,
            ]);

            // Assign teacher role if they don't have it
            $user = $this->userService->findOrFail($schoolRequest->user_id);
            if (!$user->hasRole(RoleEnum::TEACHER->value)) {
                $user->assignRole(RoleEnum::TEACHER->value);
            }

            // Mark request as approved
            $schoolRequest->approve();
        });
    }

    public function approveStudentRequest(SchoolRequest $schoolRequest): void {
        if (!$schoolRequest->isPending()) {
            throw new \Exception('SchoolRequest has already been processed');
        }

        DB::transaction(function () use ($schoolRequest) {
            // Handle if the student already exists in the school
            if ($schoolRequest->school->users()->where('user_id', $schoolRequest->user_id)->exists()) {
                $schoolRequest->approve();

                return;
            }

            // Attach the student to school using the base users relationship
            $schoolRequest->school->users()->attach($schoolRequest->user_id, [
                'role' => RoleEnum::STUDENT->value,
            ]);

            // Assign student role if they don't have it
            $user = $this->userService->findOrFail($schoolRequest->user_id);
            if (!$user->hasRole(RoleEnum::STUDENT->value)) {
                $user->assignRole(RoleEnum::STUDENT->value);
            }

            // Mark request as approved
            $schoolRequest->approve();
        });
    }

    public function rejectTeacherRequest(SchoolRequest $schoolRequest): void {
        if (!$schoolRequest->isPending()) {
            throw new \Exception('Request has already been processed');
        }

        $schoolRequest->reject();
    }

    public function rejectStudentRequest(SchoolRequest $schoolRequest): void {
        if (!$schoolRequest->isPending()) {
            throw new \Exception('Request has already been processed');
        }

        $schoolRequest->reject();
    }

    public function getAllPaginated(array $search = [], int $pageSize = 15): LengthAwarePaginator {
        $this->handlePageSizeAll();

        return parent::getAllPaginated($search, $pageSize);
    }

    protected function getRepositoryClass(): string {
        return SchoolRequestRepositoryInterface::class;
    }
}
