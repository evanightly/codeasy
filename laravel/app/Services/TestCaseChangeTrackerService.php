<?php

namespace App\Services;

use Adobrovolsky97\LaravelRepositoryServicePattern\Services\BaseCrudService;
use App\Repositories\TestCaseChangeTrackerRepository;
use App\Support\Interfaces\Repositories\TestCaseChangeTrackerRepositoryInterface;
use App\Support\Interfaces\Services\TestCaseChangeTrackerServiceInterface;
use App\Traits\Services\HandlesPageSizeAll;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class TestCaseChangeTrackerService extends BaseCrudService implements TestCaseChangeTrackerServiceInterface
{
    use HandlesPageSizeAll;

    public function getAllPaginated(array $search = [], int $pageSize = 15): LengthAwarePaginator {
        $this->handlePageSizeAll();

        return parent::getAllPaginated($search, $pageSize);
    }

    /** @var TestCaseChangeTrackerRepository */
    protected $repository;

    protected function getRepositoryClass(): string {
        return TestCaseChangeTrackerRepositoryInterface::class;
    }
}
