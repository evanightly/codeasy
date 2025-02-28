<?php

namespace App\Http\Controllers;

use App\Http\Requests\LearningMaterialQuestionTestCase\StoreLearningMaterialQuestionTestCaseRequest;
use App\Http\Requests\LearningMaterialQuestionTestCase\UpdateLearningMaterialQuestionTestCaseRequest;
use App\Http\Resources\LearningMaterialQuestionTestCaseResource;
use App\Models\LearningMaterialQuestionTestCase;
use App\Support\Interfaces\Services\LearningMaterialQuestionTestCaseServiceInterface;
use Illuminate\Http\Request;
use App\Support\Enums\PermissionEnum;
use Illuminate\Routing\Controllers\Middleware;

class LearningMaterialQuestionTestCaseController extends Controller {
    public function __construct(protected LearningMaterialQuestionTestCaseServiceInterface $learningMaterialQuestionTestCaseService) {}

    public static function middleware(): array {
        return [
            new Middleware('permission:' . PermissionEnum::LEARNING_MATERIAL_QUESTION_TEST_CASE_CREATE->value, only: ['create', 'store']),
            new Middleware('permission:' . PermissionEnum::LEARNING_MATERIAL_QUESTION_TEST_CASE_UPDATE->value, only: ['edit', 'update']),
            new Middleware('permission:' . PermissionEnum::LEARNING_MATERIAL_QUESTION_TEST_CASE_READ->value, only: ['index', 'show']),
            new Middleware('permission:' . PermissionEnum::LEARNING_MATERIAL_QUESTION_TEST_CASE_DELETE->value, only: ['destroy']),
        ];
    }

    public function index(Request $request) {
        $perPage = $request->get('perPage', 10);
        $data = LearningMaterialQuestionTestCaseResource::collection($this->learningMaterialQuestionTestCaseService->getAllPaginated($request->query(), $perPage));

        if ($this->ajax()) {
            return $data;
        }

        return inertia('LearningMaterialQuestionTestCase/Index');
    }

    public function create() {
        return inertia('LearningMaterialQuestionTestCase/Create');
    }

    public function store(StoreLearningMaterialQuestionTestCaseRequest $request) {
        if ($this->ajax()) {
            return $this->learningMaterialQuestionTestCaseService->create($request->validated());
        }
    }

    public function show(LearningMaterialQuestionTestCase $learningMaterialQuestionTestCase) {
        $data = LearningMaterialQuestionTestCaseResource::make($learningMaterialQuestionTestCase);

        if ($this->ajax()) {
            return $data;
        }

        return inertia('LearningMaterialQuestionTestCase/Show', compact('data'));
    }

    public function edit(LearningMaterialQuestionTestCase $learningMaterialQuestionTestCase) {
        $data = LearningMaterialQuestionTestCaseResource::make($learningMaterialQuestionTestCase);

        return inertia('LearningMaterialQuestionTestCase/Edit', compact('data'));
    }

    public function update(UpdateLearningMaterialQuestionTestCaseRequest $request, LearningMaterialQuestionTestCase $learningMaterialQuestionTestCase) {
        if ($this->ajax()) {
            return $this->learningMaterialQuestionTestCaseService->update($learningMaterialQuestionTestCase, $request->validated());
        }
    }

    public function destroy(LearningMaterialQuestionTestCase $learningMaterialQuestionTestCase) {
        if ($this->ajax()) {
            return $this->learningMaterialQuestionTestCaseService->delete($learningMaterialQuestionTestCase);
        }
    }
}
