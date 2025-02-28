<?php

namespace App\Services;

use Adobrovolsky97\LaravelRepositoryServicePattern\Services\BaseCrudService;
use App\Repositories\LearningMaterialRepository;
use App\Support\Interfaces\Repositories\LearningMaterialRepositoryInterface;
use App\Support\Interfaces\Services\LearningMaterialServiceInterface;
use App\Traits\Services\HandlesPageSizeAll;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class LearningMaterialService extends BaseCrudService implements LearningMaterialServiceInterface {
    use HandlesPageSizeAll;

    public function getAllPaginated(array $search = [], int $pageSize = 15): LengthAwarePaginator {
        $this->handlePageSizeAll();

        return parent::getAllPaginated($search, $pageSize);
    }

    /** @var LearningMaterialRepository $repository */
    protected $repository;

    protected function getRepositoryClass(): string {
        return LearningMaterialRepositoryInterface::class;
    }
}
