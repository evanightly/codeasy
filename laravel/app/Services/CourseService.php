<?php

namespace App\Services;

use Adobrovolsky97\LaravelRepositoryServicePattern\Services\BaseCrudService;
use App\Repositories\CourseRepository;
use App\Support\Interfaces\Repositories\CourseRepositoryInterface;
use App\Support\Interfaces\Services\CourseServiceInterface;
use App\Traits\Services\HandlesPageSizeAll;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class CourseService extends BaseCrudService implements CourseServiceInterface {
    use HandlesPageSizeAll;

    public function getAllPaginated(array $search = [], int $pageSize = 15): LengthAwarePaginator {
        $this->handlePageSizeAll();

        return parent::getAllPaginated($search, $pageSize);
    }

    /** @var CourseRepository */
    protected $repository;

    protected function getRepositoryClass(): string {
        return CourseRepositoryInterface::class;
    }
}
