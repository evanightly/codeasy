<?php

namespace App\Services;

use Adobrovolsky97\LaravelRepositoryServicePattern\Services\BaseCrudService;
use App\Repositories\StudentScoreRepository;
use App\Support\Interfaces\Repositories\StudentScoreRepositoryInterface;
use App\Support\Interfaces\Services\StudentScoreServiceInterface;
use App\Traits\Services\HandlesPageSizeAll;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class StudentScoreService extends BaseCrudService implements StudentScoreServiceInterface {
    use HandlesPageSizeAll;

    public function getAllPaginated(array $search = [], int $pageSize = 15): LengthAwarePaginator {
        $this->handlePageSizeAll();

        return parent::getAllPaginated($search, $pageSize);
    }

    /** @var StudentScoreRepository $repository */
    protected $repository;

    protected function getRepositoryClass(): string {
        return StudentScoreRepositoryInterface::class;
    }
}
