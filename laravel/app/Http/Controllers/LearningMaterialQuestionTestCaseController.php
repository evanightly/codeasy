<?php

namespace App\Http\Controllers;

use App\Http\Requests\LearningMaterialQuestionTestCase\StoreLearningMaterialQuestionTestCaseRequest;
use App\Http\Requests\LearningMaterialQuestionTestCase\UpdateLearningMaterialQuestionTestCaseRequest;
use App\Http\Resources\LearningMaterialQuestionTestCaseResource;
use App\Models\LearningMaterialQuestionTestCase;
use App\Support\Enums\PermissionEnum;
use App\Support\Interfaces\Services\LearningMaterialQuestionTestCaseServiceInterface;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;

class LearningMaterialQuestionTestCaseController extends Controller implements HasMiddleware {
    public function __construct(protected LearningMaterialQuestionTestCaseServiceInterface $learningMaterialQuestionTestCaseService) {}

    public static function middleware(): array {
        return [
            self::createPermissionMiddleware([PermissionEnum::LEARNING_MATERIAL_QUESTION_TEST_CASE_CREATE->value], ['create', 'store']),
            self::createPermissionMiddleware([PermissionEnum::LEARNING_MATERIAL_QUESTION_TEST_CASE_UPDATE->value], ['edit', 'update']),
            self::createPermissionMiddleware([PermissionEnum::LEARNING_MATERIAL_QUESTION_TEST_CASE_READ->value], ['index', 'show']),
            self::createPermissionMiddleware([PermissionEnum::LEARNING_MATERIAL_QUESTION_TEST_CASE_DELETE->value], ['destroy']),
        ];
    }

    public function index(Request $request) {
        $data = LearningMaterialQuestionTestCaseResource::collection($this->learningMaterialQuestionTestCaseService->getAllPaginated($request->query()));

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

    public function show(LearningMaterialQuestionTestCase $testCase) {
        $data = LearningMaterialQuestionTestCaseResource::make($testCase);

        if ($this->ajax()) {
            return $data;
        }

        return inertia('LearningMaterialQuestionTestCase/Show', compact('data'));
    }

    public function edit(LearningMaterialQuestionTestCase $testCase) {
        $data = LearningMaterialQuestionTestCaseResource::make($testCase);

        return inertia('LearningMaterialQuestionTestCase/Edit', compact('data'));
    }

    public function update(UpdateLearningMaterialQuestionTestCaseRequest $request, LearningMaterialQuestionTestCase $testCase) {
        if ($this->ajax()) {
            return $this->learningMaterialQuestionTestCaseService->update($testCase, $request->validated());
        }
    }

    public function destroy(LearningMaterialQuestionTestCase $testCase) {
        if ($this->ajax()) {
            return $this->learningMaterialQuestionTestCaseService->delete($testCase);
        }
    }
}
