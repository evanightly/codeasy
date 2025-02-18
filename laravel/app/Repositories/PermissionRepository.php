<?php

namespace App\Repositories;

use App\Models\Permission;
use App\Support\Interfaces\Repositories\PermissionRepositoryInterface;

class PermissionRepository extends BaseRepository implements PermissionRepositoryInterface {
    protected function getModelClass(): string {
        return Permission::class;
    }
}
