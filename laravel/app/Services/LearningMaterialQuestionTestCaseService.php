<?php

namespace App\Services;

use Adobrovolsky97\LaravelRepositoryServicePattern\Services\BaseCrudService;
use App\Repositories\LearningMaterialQuestionTestCaseRepository;
use App\Support\Interfaces\Repositories\LearningMaterialQuestionTestCaseRepositoryInterface;
use App\Support\Interfaces\Services\LearningMaterialQuestionTestCaseServiceInterface;
use App\Traits\Services\HandlesPageSizeAll;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class LearningMaterialQuestionTestCaseService extends BaseCrudService implements LearningMaterialQuestionTestCaseServiceInterface {
    use HandlesPageSizeAll;

    public function getAllPaginated(array $search = [], int $pageSize = 15): LengthAwarePaginator {
        $this->handlePageSizeAll();

        return parent::getAllPaginated($search, $pageSize);
    }

    /** @var LearningMaterialQuestionTestCaseRepository */
    protected $repository;

    protected function getRepositoryClass(): string {
        return LearningMaterialQuestionTestCaseRepositoryInterface::class;
    }
}
