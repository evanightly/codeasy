<?php

namespace App\Services;

use Adobrovolsky97\LaravelRepositoryServicePattern\Services\BaseCrudService;
use App\Repositories\MaterialRepository;
use App\Support\Interfaces\Repositories\MaterialRepositoryInterface;
use App\Support\Interfaces\Services\MaterialServiceInterface;
use App\Traits\Services\HandlesPageSizeAll;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class MaterialService extends BaseCrudService implements MaterialServiceInterface {
    use HandlesPageSizeAll;

    public function getAllPaginated(array $search = [], int $pageSize = 15): LengthAwarePaginator {
        $this->handlePageSizeAll();

        return parent::getAllPaginated($search, $pageSize);
    }

    /** @var MaterialRepository */
    protected $repository;

    protected function getRepositoryClass(): string {
        return MaterialRepositoryInterface::class;
    }
}
