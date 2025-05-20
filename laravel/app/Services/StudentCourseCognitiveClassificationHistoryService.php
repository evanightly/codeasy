<?php

namespace App\Services;

use Adobrovolsky97\LaravelRepositoryServicePattern\Services\BaseCrudService;
use App\Repositories\StudentCourseCognitiveClassificationHistoryRepository;
use App\Support\Interfaces\Repositories\StudentCourseCognitiveClassificationHistoryRepositoryInterface;
use App\Support\Interfaces\Services\StudentCourseCognitiveClassificationHistoryServiceInterface;
use App\Traits\Services\HandlesPageSizeAll;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class StudentCourseCognitiveClassificationHistoryService extends BaseCrudService implements StudentCourseCognitiveClassificationHistoryServiceInterface
{
    use HandlesPageSizeAll;

    public function getAllPaginated(array $search = [], int $pageSize = 15): LengthAwarePaginator {
        $this->handlePageSizeAll();

        return parent::getAllPaginated($search, $pageSize);
    }

    /** @var StudentCourseCognitiveClassificationHistoryRepository */
    protected $repository;

    protected function getRepositoryClass(): string {
        return StudentCourseCognitiveClassificationHistoryRepositoryInterface::class;
    }
}
