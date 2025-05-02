<?php

namespace App\Services;

use App\Repositories\RoleRepository;
use App\Support\Interfaces\Repositories\RoleRepositoryInterface;
use App\Support\Interfaces\Services\RoleServiceInterface;
use App\Traits\Services\HandlesPageSizeAll;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;

class RoleService extends BaseCrudService implements RoleServiceInterface {
    use HandlesPageSizeAll;

    /** @var RoleRepository */
    protected $repository;

    public function getAllPaginated(array $search = [], int $pageSize = 15): LengthAwarePaginator {
        $this->handlePageSizeAll();

        return parent::getAllPaginated($search, $pageSize);
    }

    public function update($keyOrModel, array $data): ?Model {
        if (isset($data['permissions'])) {
            $keyOrModel->permissions()->sync($data['permissions']);
            app()->make(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();
        }

        return $this->repository->forceUpdate($keyOrModel, $data);
    }

    protected function getRepositoryClass(): string {
        return RoleRepositoryInterface::class;
    }
}
