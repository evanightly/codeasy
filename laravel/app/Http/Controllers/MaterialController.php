<?php

namespace App\Http\Controllers;

use App\Http\Requests\Material\StoreMaterialRequest;
use App\Http\Requests\Material\UpdateMaterialRequest;
use App\Http\Resources\MaterialResource;
use App\Models\Material;
use App\Support\Enums\PermissionEnum;
use App\Support\Interfaces\Services\MaterialServiceInterface;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\Middleware;

class MaterialController extends Controller {
    public function __construct(protected MaterialServiceInterface $materialService) {}

    public static function middleware(): array {
        return [
            new Middleware('permission:' . PermissionEnum::MATERIAL_CREATE->value, only: ['create', 'store']),
            new Middleware('permission:' . PermissionEnum::MATERIAL_UPDATE->value, only: ['edit', 'update']),
            new Middleware('permission:' . PermissionEnum::MATERIAL_READ->value, only: ['index', 'show']),
            new Middleware('permission:' . PermissionEnum::MATERIAL_DELETE->value, only: ['destroy']),
        ];
    }

    public function index(Request $request) {
        $perPage = $request->get('perPage', 10);
        $data = MaterialResource::collection($this->materialService->getAllPaginated($request->query(), $perPage));

        if ($this->ajax()) {
            return $data;
        }

        return inertia('Material/Index');
    }

    public function create() {
        return inertia('Material/Create');
    }

    public function store(StoreMaterialRequest $request) {
        if ($this->ajax()) {
            return $this->materialService->create($request->validated());
        }
    }

    public function show(Material $material) {
        $data = MaterialResource::make($material);

        if ($this->ajax()) {
            return $data;
        }

        return inertia('Material/Show', compact('data'));
    }

    public function edit(Material $material) {
        $data = MaterialResource::make($material);

        return inertia('Material/Edit', compact('data'));
    }

    public function update(UpdateMaterialRequest $request, Material $material) {
        if ($this->ajax()) {
            return $this->materialService->update($material, $request->validated());
        }
    }

    public function destroy(Material $material) {
        if ($this->ajax()) {
            return $this->materialService->delete($material);
        }
    }
}
