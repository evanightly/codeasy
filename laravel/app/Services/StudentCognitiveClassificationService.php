<?php

namespace App\Services;

use Adobrovolsky97\LaravelRepositoryServicePattern\Services\BaseCrudService;
use App\Repositories\StudentCognitiveClassificationRepository;
use App\Support\Interfaces\Repositories\StudentCognitiveClassificationRepositoryInterface;
use App\Support\Interfaces\Services\StudentCognitiveClassificationServiceInterface;
use App\Traits\Services\HandlesPageSizeAll;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class StudentCognitiveClassificationService extends BaseCrudService implements StudentCognitiveClassificationServiceInterface
{
    use HandlesPageSizeAll;

    public function getAllPaginated(array $search = [], int $pageSize = 15): LengthAwarePaginator {
        $this->handlePageSizeAll();

        return parent::getAllPaginated($search, $pageSize);
    }

    /** @var StudentCognitiveClassificationRepository */
    protected $repository;

    protected function getRepositoryClass(): string {
        return StudentCognitiveClassificationRepositoryInterface::class;
    }
}
