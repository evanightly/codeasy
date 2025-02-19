<?php

namespace App\Http\Controllers;

use App\Http\Requests\Role\StoreRoleRequest;
use App\Http\Requests\Role\UpdateRoleRequest;
use App\Http\Resources\RoleResource;
use App\Models\Role;
use App\Support\Interfaces\Services\RoleServiceInterface;
use Illuminate\Http\Request;
use App\Support\Enums\PermissionEnum;
use Illuminate\Routing\Controllers\Middleware;

class RoleController extends Controller {
    public function __construct(protected RoleServiceInterface $roleService) {}

    public static function middleware(): array {
        return [
            new Middleware('permission:' . PermissionEnum::ROLE_CREATE->value, only: ['create', 'store']),
            new Middleware('permission:' . PermissionEnum::ROLE_UPDATE->value, only: ['edit', 'update']),
            new Middleware('permission:' . PermissionEnum::ROLE_READ->value, only: ['index', 'show']),
            new Middleware('permission:' . PermissionEnum::ROLE_DELETE->value, only: ['destroy']),
        ];
    }

    public function index(Request $request) {
        $perPage = $request->get('perPage', 10);
        $data = RoleResource::collection($this->roleService->getAllPaginated($request->query(), $perPage));

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
        $data = RoleResource::make($role);

        if ($this->ajax()) {
            return $data;
        }

        return inertia('Role/Show', compact('data'));
    }

    public function edit(Role $role) {
        $data = RoleResource::make($role);

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
