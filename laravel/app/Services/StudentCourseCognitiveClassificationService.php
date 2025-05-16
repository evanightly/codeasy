<?php

namespace App\Services;

use Adobrovolsky97\LaravelRepositoryServicePattern\Services\BaseCrudService;
use App\Repositories\StudentCourseCognitiveClassificationRepository;
use App\Support\Interfaces\Repositories\StudentCourseCognitiveClassificationRepositoryInterface;
use App\Support\Interfaces\Services\StudentCourseCognitiveClassificationServiceInterface;
use App\Traits\Services\HandlesPageSizeAll;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class StudentCourseCognitiveClassificationService extends BaseCrudService implements StudentCourseCognitiveClassificationServiceInterface
{
    use HandlesPageSizeAll;

    public function getAllPaginated(array $search = [], int $pageSize = 15): LengthAwarePaginator {
        $this->handlePageSizeAll();

        return parent::getAllPaginated($search, $pageSize);
    }

    /** @var StudentCourseCognitiveClassificationRepository */
    protected $repository;

    protected function getRepositoryClass(): string {
        return StudentCourseCognitiveClassificationRepositoryInterface::class;
    }
}
