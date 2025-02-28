<?php

namespace App\Http\Controllers;

use App\Http\Requests\LearningMaterial\StoreLearningMaterialRequest;
use App\Http\Requests\LearningMaterial\UpdateLearningMaterialRequest;
use App\Http\Resources\LearningMaterialResource;
use App\Models\LearningMaterial;
use App\Support\Interfaces\Services\LearningMaterialServiceInterface;
use Illuminate\Http\Request;
use App\Support\Enums\PermissionEnum;
use Illuminate\Routing\Controllers\Middleware;

class LearningMaterialController extends Controller {
    public function __construct(protected LearningMaterialServiceInterface $learningMaterialService) {}

    public static function middleware(): array {
        return [
            new Middleware('permission:' . PermissionEnum::LEARNING_MATERIAL_CREATE->value, only: ['create', 'store']),
            new Middleware('permission:' . PermissionEnum::LEARNING_MATERIAL_UPDATE->value, only: ['edit', 'update']),
            new Middleware('permission:' . PermissionEnum::LEARNING_MATERIAL_READ->value, only: ['index', 'show']),
            new Middleware('permission:' . PermissionEnum::LEARNING_MATERIAL_DELETE->value, only: ['destroy']),
        ];
    }

    public function index(Request $request) {
        $perPage = $request->get('perPage', 10);
        $data = LearningMaterialResource::collection($this->learningMaterialService->getAllPaginated($request->query(), $perPage));

        if ($this->ajax()) {
            return $data;
        }

        return inertia('LearningMaterial/Index');
    }

    public function create() {
        return inertia('LearningMaterial/Create');
    }

    public function store(StoreLearningMaterialRequest $request) {
        if ($this->ajax()) {
            return $this->learningMaterialService->create($request->validated());
        }
    }

    public function show(LearningMaterial $learningMaterial) {
        $data = LearningMaterialResource::make($learningMaterial);

        if ($this->ajax()) {
            return $data;
        }

        return inertia('LearningMaterial/Show', compact('data'));
    }

    public function edit(LearningMaterial $learningMaterial) {
        $data = LearningMaterialResource::make($learningMaterial);

        return inertia('LearningMaterial/Edit', compact('data'));
    }

    public function update(UpdateLearningMaterialRequest $request, LearningMaterial $learningMaterial) {
        if ($this->ajax()) {
            return $this->learningMaterialService->update($learningMaterial, $request->validated());
        }
    }

    public function destroy(LearningMaterial $learningMaterial) {
        if ($this->ajax()) {
            return $this->learningMaterialService->delete($learningMaterial);
        }
    }
}
