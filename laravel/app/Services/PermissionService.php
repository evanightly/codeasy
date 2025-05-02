<?php

namespace App\Services;

use App\Repositories\PermissionRepository;
use App\Support\Interfaces\Repositories\PermissionRepositoryInterface;
use App\Support\Interfaces\Services\PermissionServiceInterface;
use App\Traits\Services\HandlesPageSizeAll;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class PermissionService extends BaseCrudService implements PermissionServiceInterface {
    use HandlesPageSizeAll;

    /** @var PermissionRepository */
    protected $repository;

    public function getAllPaginated(array $search = [], int $pageSize = 15): LengthAwarePaginator {
        $this->handlePageSizeAll();

        return parent::getAllPaginated($search, $pageSize);
    }

    public function delete($keyOrModel): bool {
        if ($keyOrModel->canBeDeleted()) {
            parent::delete($keyOrModel);

            return true;
        }

        return false;
    }

    protected function getRepositoryClass(): string {
        return PermissionRepositoryInterface::class;
    }
}
