<?php

namespace App\Http\Controllers;

use App\Http\Requests\Role\StoreRoleRequest;
use App\Http\Requests\Role\UpdateRoleRequest;
use App\Http\Resources\RoleResource;
use App\Models\Role;
use App\Support\Enums\PermissionEnum;
use App\Support\Interfaces\Services\RoleServiceInterface;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;

class RoleController extends Controller implements HasMiddleware {
    public function __construct(protected RoleServiceInterface $roleService) {}

    public static function middleware(): array {
        $roleReadPermissions = [
            PermissionEnum::ROLE_READ->value,
            PermissionEnum::USER_CREATE->value,
            PermissionEnum::USER_UPDATE->value,
        ];

        return [
            self::createPermissionMiddleware([PermissionEnum::ROLE_CREATE->value], ['create', 'store']),
            self::createPermissionMiddleware([PermissionEnum::ROLE_UPDATE->value], ['edit', 'update']),
            self::createPermissionMiddleware($roleReadPermissions, ['index', 'show']),
            self::createPermissionMiddleware([PermissionEnum::ROLE_DELETE->value], ['destroy']),
        ];
    }

    public function index(Request $request) {
        $data = RoleResource::collection($this->roleService->getAllPaginated($request->query()));

        if ($this->ajax()) {
            return $data;
        }

        return inertia('Role/Index');
    }

    public function create() {
        return inertia('Role/Create');
    }

    public function store(StoreRoleRequest $request) {
        if ($this->ajax()) {
            return $this->roleService->create($request->validated());
        }
    }

    public function show(Role $role) {
        $data = RoleResource::make($role->load('permissions'));

        if ($this->ajax()) {
            return $data;
        }

        return inertia('Role/Show', compact('data'));
    }

    public function edit(Role $role) {
        $data = RoleResource::make($role->load('permissions'));

        return inertia('Role/Edit', compact('data'));
    }

    public function update(UpdateRoleRequest $request, Role $role) {
        if ($this->ajax()) {
            return $this->roleService->update($role, $request->validated());
        }
    }

    public function destroy(Role $role) {
        if ($this->ajax()) {
            return $this->roleService->delete($role);
        }
    }
}
