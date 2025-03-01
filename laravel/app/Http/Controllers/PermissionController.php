<?php

namespace App\Http\Controllers;

use App\Http\Requests\Permission\StorePermissionRequest;
use App\Http\Requests\Permission\UpdatePermissionRequest;
use App\Http\Resources\PermissionResource;
use App\Models\Permission;
use App\Support\Enums\PermissionEnum;
use App\Support\Interfaces\Services\PermissionServiceInterface;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Spatie\Permission\Middleware\PermissionMiddleware;

class PermissionController extends Controller implements HasMiddleware {
    public function __construct(protected PermissionServiceInterface $permissionService) {}

    public static function middleware(): array {
        return [
            new Middleware(PermissionMiddleware::using(PermissionEnum::PERMISSION_CREATE->value), only: ['create', 'store']),
            new Middleware(PermissionMiddleware::using(PermissionEnum::PERMISSION_UPDATE->value), only: ['edit', 'update']),
            new Middleware(PermissionMiddleware::using(PermissionEnum::PERMISSION_READ->value), only: ['index', 'show']),
            new Middleware(PermissionMiddleware::using(PermissionEnum::PERMISSION_DELETE->value), only: ['destroy']),
        ];
    }

    public function index(Request $request) {
        $perPage = $request->get('perPage', 10);
        $data = PermissionResource::collection($this->permissionService->getAllPaginated($request->query(), $perPage));

        if ($this->ajax()) {
            return $data;
        }

        return inertia('Permission/Index');
    }

    public function create() {
        return inertia('Permission/Create');
    }

    public function store(StorePermissionRequest $request) {
        if ($this->ajax()) {
            return $this->permissionService->create($request->validated());
        }
    }

    public function show(Permission $permission) {
        $data = PermissionResource::make($permission->load(['roles']));

        if ($this->ajax()) {
            return $data;
        }

        return inertia('Permission/Show', compact('data'));
    }

    public function edit(Permission $permission) {
        // $data = PermissionResource::make($permission);

        // return inertia('Permission/Edit', compact('data'));
    }

    public function update(UpdatePermissionRequest $request, Permission $permission) {
        if ($this->ajax()) {
            return $this->permissionService->update($permission, $request->validated());
        }
    }

    public function destroy(Permission $permission) {
        if ($this->ajax()) {
            return $this->permissionService->delete($permission);
        }
    }
}
