<?php

namespace App\Services;

use Adobrovolsky97\LaravelRepositoryServicePattern\Services\BaseCrudService;
use App\Repositories\ClassRoomStudentRepository;
use App\Support\Interfaces\Repositories\ClassRoomStudentRepositoryInterface;
use App\Support\Interfaces\Services\ClassRoomStudentServiceInterface;
use App\Traits\Services\HandlesPageSizeAll;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ClassRoomStudentService extends BaseCrudService implements ClassRoomStudentServiceInterface {
    use HandlesPageSizeAll;

    public function getAllPaginated(array $search = [], int $pageSize = 15): LengthAwarePaginator {
        $this->handlePageSizeAll();

        return parent::getAllPaginated($search, $pageSize);
    }

    /** @var ClassRoomStudentRepository */
    protected $repository;

    protected function getRepositoryClass(): string {
        return ClassRoomStudentRepositoryInterface::class;
    }
}
