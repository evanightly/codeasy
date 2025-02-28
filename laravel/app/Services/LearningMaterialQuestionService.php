<?php

namespace App\Services;

use Adobrovolsky97\LaravelRepositoryServicePattern\Services\BaseCrudService;
use App\Repositories\LearningMaterialQuestionRepository;
use App\Support\Interfaces\Repositories\LearningMaterialQuestionRepositoryInterface;
use App\Support\Interfaces\Services\LearningMaterialQuestionServiceInterface;
use App\Traits\Services\HandlesPageSizeAll;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class LearningMaterialQuestionService extends BaseCrudService implements LearningMaterialQuestionServiceInterface {
    use HandlesPageSizeAll;

    public function getAllPaginated(array $search = [], int $pageSize = 15): LengthAwarePaginator {
        $this->handlePageSizeAll();

        return parent::getAllPaginated($search, $pageSize);
    }

    /** @var LearningMaterialQuestionRepository $repository */
    protected $repository;

    protected function getRepositoryClass(): string {
        return LearningMaterialQuestionRepositoryInterface::class;
    }
}
