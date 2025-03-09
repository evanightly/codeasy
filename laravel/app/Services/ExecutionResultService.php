<?php

namespace App\Services;

use Adobrovolsky97\LaravelRepositoryServicePattern\Services\BaseCrudService;
use App\Repositories\ExecutionResultRepository;
use App\Support\Interfaces\Repositories\ExecutionResultRepositoryInterface;
use App\Support\Interfaces\Services\ExecutionResultServiceInterface;
use App\Traits\Services\HandlesPageSizeAll;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ExecutionResultService extends BaseCrudService implements ExecutionResultServiceInterface {
    use HandlesPageSizeAll;

    public function getAllPaginated(array $search = [], int $pageSize = 15): LengthAwarePaginator {
        $this->handlePageSizeAll();

        return parent::getAllPaginated($search, $pageSize);
    }

    /** @var ExecutionResultRepository $repository */
    protected $repository;

    protected function getRepositoryClass(): string {
        return ExecutionResultRepositoryInterface::class;
    }
}
