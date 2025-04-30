<?php

namespace App\Http\Controllers;

use App\Http\Requests\LearningMaterialQuestion\StoreLearningMaterialQuestionRequest;
use App\Http\Requests\LearningMaterialQuestion\UpdateLearningMaterialQuestionRequest;
use App\Http\Resources\LearningMaterialQuestionResource;
use App\Models\LearningMaterialQuestion;
use App\Support\Enums\PermissionEnum;
use App\Support\Interfaces\Services\LearningMaterialQuestionServiceInterface;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;

class LearningMaterialQuestionController extends Controller implements HasMiddleware {
    public function __construct(protected LearningMaterialQuestionServiceInterface $learningMaterialQuestionService) {}

    public static function middleware(): array {
        $questionReadPermissions = [
            PermissionEnum::LEARNING_MATERIAL_QUESTION_READ->value,
            PermissionEnum::LEARNING_MATERIAL_QUESTION_TEST_CASE_CREATE->value,
            PermissionEnum::LEARNING_MATERIAL_QUESTION_TEST_CASE_READ->value,
        ];

        return [
            self::createPermissionMiddleware([PermissionEnum::LEARNING_MATERIAL_QUESTION_CREATE->value], ['create', 'store']),
            self::createPermissionMiddleware([PermissionEnum::LEARNING_MATERIAL_QUESTION_UPDATE->value], ['edit', 'update']),
            self::createPermissionMiddleware($questionReadPermissions, ['index', 'show']),
            self::createPermissionMiddleware([PermissionEnum::LEARNING_MATERIAL_QUESTION_DELETE->value], ['destroy']),
        ];
    }

    public function index(Request $request) {
        $data = LearningMaterialQuestionResource::collection($this->learningMaterialQuestionService->getAllPaginated($request->query()));

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
