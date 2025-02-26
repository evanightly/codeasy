<?php

namespace App\Services;

use Adobrovolsky97\LaravelRepositoryServicePattern\Services\BaseCrudService;
use App\Repositories\ClassRoomRepository;
use App\Support\Interfaces\Repositories\ClassRoomRepositoryInterface;
use App\Support\Interfaces\Services\ClassRoomServiceInterface;
use App\Traits\Services\HandlesPageSizeAll;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ClassRoomService extends BaseCrudService implements ClassRoomServiceInterface {
    use HandlesPageSizeAll;

    public function getAllPaginated(array $search = [], int $pageSize = 15): LengthAwarePaginator {
        $this->handlePageSizeAll();

        return parent::getAllPaginated($search, $pageSize);
    }

    /** @var ClassRoomRepository $repository */
    protected $repository;

    protected function getRepositoryClass(): string {
        return ClassRoomRepositoryInterface::class;
    }
}
