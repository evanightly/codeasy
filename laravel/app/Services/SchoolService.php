<?php

namespace App\Services;

use Adobrovolsky97\LaravelRepositoryServicePattern\Services\BaseCrudService;
use App\Repositories\SchoolRepository;
use App\Support\Interfaces\Repositories\SchoolRepositoryInterface;
use App\Support\Interfaces\Services\SchoolServiceInterface;
use App\Traits\Services\HandlesPageSizeAll;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class SchoolService extends BaseCrudService implements SchoolServiceInterface {
    use HandlesPageSizeAll;

    public function getAllPaginated(array $search = [], int $pageSize = 15): LengthAwarePaginator {
        $this->handlePageSizeAll();

        return parent::getAllPaginated($search, $pageSize);
    }

    /** @var SchoolRepository */
    protected $repository;

    protected function getRepositoryClass(): string {
        return SchoolRepositoryInterface::class;
    }
}
