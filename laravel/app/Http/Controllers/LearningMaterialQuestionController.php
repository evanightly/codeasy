<?php

namespace App\Http\Controllers;

use App\Http\Requests\LearningMaterialQuestion\StoreLearningMaterialQuestionRequest;
use App\Http\Requests\LearningMaterialQuestion\UpdateLearningMaterialQuestionRequest;
use App\Http\Resources\LearningMaterialQuestionResource;
use App\Models\LearningMaterialQuestion;
use App\Support\Interfaces\Services\LearningMaterialQuestionServiceInterface;
use Illuminate\Http\Request;
use App\Support\Enums\PermissionEnum;
use Illuminate\Routing\Controllers\Middleware;

class LearningMaterialQuestionController extends Controller {
    public function __construct(protected LearningMaterialQuestionServiceInterface $learningMaterialQuestionService) {}

    public static function middleware(): array {
        return [
            new Middleware('permission:' . PermissionEnum::LEARNINGMATERIALQUESTION_CREATE->value, only: ['create', 'store']),
            new Middleware('permission:' . PermissionEnum::LEARNINGMATERIALQUESTION_UPDATE->value, only: ['edit', 'update']),
            new Middleware('permission:' . PermissionEnum::LEARNINGMATERIALQUESTION_READ->value, only: ['index', 'show']),
            new Middleware('permission:' . PermissionEnum::LEARNINGMATERIALQUESTION_DELETE->value, only: ['destroy']),
        ];
    }

    public function index(Request $request) {
        $perPage = $request->get('perPage', 10);
        $data = LearningMaterialQuestionResource::collection($this->learningMaterialQuestionService->getAllPaginated($request->query(), $perPage));

        if ($this->ajax()) {
            return $data;
        }

        return inertia('LearningMaterialQuestion/Index');
    }

    public function create() {
        return inertia('LearningMaterialQuestion/Create');
    }

    public function store(StoreLearningMaterialQuestionRequest $request) {
        if ($this->ajax()) {
            return $this->learningMaterialQuestionService->create($request->validated());
        }
    }

    public function show(LearningMaterialQuestion $learningMaterialQuestion) {
        $data = LearningMaterialQuestionResource::make($learningMaterialQuestion);

        if ($this->ajax()) {
            return $data;
        }

        return inertia('LearningMaterialQuestion/Show', compact('data'));
    }

    public function edit(LearningMaterialQuestion $learningMaterialQuestion) {
        $data = LearningMaterialQuestionResource::make($learningMaterialQuestion);

        return inertia('LearningMaterialQuestion/Edit', compact('data'));
    }

    public function update(UpdateLearningMaterialQuestionRequest $request, LearningMaterialQuestion $learningMaterialQuestion) {
        if ($this->ajax()) {
            return $this->learningMaterialQuestionService->update($learningMaterialQuestion, $request->validated());
        }
    }

    public function destroy(LearningMaterialQuestion $learningMaterialQuestion) {
        if ($this->ajax()) {
            return $this->learningMaterialQuestionService->delete($learningMaterialQuestion);
        }
    }
}
