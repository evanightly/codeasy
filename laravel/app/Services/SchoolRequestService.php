<?php

namespace App\Services;

use Adobrovolsky97\LaravelRepositoryServicePattern\Services\BaseCrudService;
use App\Repositories\SchoolRequestRepository;
use App\Support\Interfaces\Repositories\SchoolRequestRepositoryInterface;
use App\Support\Interfaces\Services\SchoolRequestServiceInterface;
use App\Traits\Services\HandlesPageSizeAll;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class SchoolRequestService extends BaseCrudService implements SchoolRequestServiceInterface {
    use HandlesPageSizeAll;

    public function getAllPaginated(array $search = [], int $pageSize = 15): LengthAwarePaginator {
        $this->handlePageSizeAll();

        return parent::getAllPaginated($search, $pageSize);
    }

    /** @var SchoolRequestRepository $repository */
    protected $repository;

    protected function getRepositoryClass(): string {
        return SchoolRequestRepositoryInterface::class;
    }
}
