<?php

namespace App\Repositories;

use App\Models\Role;
use App\Support\Interfaces\Repositories\RoleRepositoryInterface;
use App\Traits\Repositories\HandlesFiltering;
use App\Traits\Repositories\HandlesRelations;
use App\Traits\Repositories\HandlesSorting;
use App\Traits\Repositories\RelationQueryable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class RoleRepository extends BaseRepository implements RoleRepositoryInterface {
    use HandlesFiltering, HandlesRelations, HandlesSorting, RelationQueryable;

    public function create(array $data): ?Model {
        $role = parent::create($data);

        if (isset($data['permissions'])) {
            foreach ($data['permissions'] as $permission) {
                $role->givePermissionTo($permission);
            }
        }

        return $role;
    }

    public function update($keyOrModel, array $data): ?Model {
        if (isset($data['permissions'])) {
            $keyOrModel->permissions()->sync($data['permissions']);
        }

        return $keyOrModel;
    }

    public function forceUpdate(mixed $keyOrModel, array $data): ?Model {
        return Role::find($keyOrModel->id)->update($data) ? Role::find($keyOrModel->id) : null;
    }

    protected function applyFilters(array $searchParams = []): Builder {
        $query = $this->getQuery();

        $query = $this->applySearchFilters($query, $searchParams, ['name']);

        $query = $this->applyResolvedRelations($query, $searchParams);

        $query = $this->applyColumnFilters($query, $searchParams, ['created_at', 'updated_at']);

        $query = $this->applySorting($query, $searchParams);

        return $query;
    }

    protected function getModelClass(): string {
        return Role::class;
    }
}
