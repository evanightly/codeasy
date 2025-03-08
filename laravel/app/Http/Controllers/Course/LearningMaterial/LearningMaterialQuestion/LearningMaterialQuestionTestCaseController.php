<?php

namespace App\Http\Controllers\Course\LearningMaterial\LearningMaterialQuestion;

use App\Http\Controllers\Controller;
use App\Http\Resources\CourseResource;
use App\Http\Resources\LearningMaterialQuestionResource;
use App\Http\Resources\LearningMaterialQuestionTestCaseResource;
use App\Http\Resources\LearningMaterialResource;
use App\Models\Course;
use App\Models\LearningMaterial;
use App\Models\LearningMaterialQuestion;
use App\Models\LearningMaterialQuestionTestCase;
use App\Services\LearningMaterialQuestionTestCaseService;
use App\Support\Enums\PermissionEnum;
use Illuminate\Routing\Controllers\HasMiddleware;
use Inertia\Inertia;

class LearningMaterialQuestionTestCaseController extends Controller implements HasMiddleware {
    protected $testCaseService;

    public function __construct(LearningMaterialQuestionTestCaseService $testCaseService) {
        $this->testCaseService = $testCaseService;
    }

    public static function middleware(): array {
        return [
            self::createPermissionMiddleware([
                PermissionEnum::COURSE_READ->value,
                PermissionEnum::LEARNING_MATERIAL_READ->value,
                PermissionEnum::LEARNING_MATERIAL_QUESTION_READ->value,
                PermissionEnum::LEARNING_MATERIAL_QUESTION_TEST_CASE_READ->value,
            ], ['index', 'show', 'create', 'edit']),
        ];
    }

    /**
     * Display test cases for a specific question
     */
    public function index(Course $course, LearningMaterial $learningMaterial, LearningMaterialQuestion $question) {
        // Verify relationships
        if ($learningMaterial->course_id != $course->id || $question->learning_material_id != $learningMaterial->id) {
            abort(404);
        }

        $testCases = $this->testCaseService->getAll([
            'question_id' => $question->id,
        ]);

        if ($this->ajax()) {
            return [
                'course' => new CourseResource($course),
                'learningMaterial' => new LearningMaterialResource($learningMaterial),
                'question' => new LearningMaterialQuestionResource($question),
                'testCases' => LearningMaterialQuestionTestCaseResource::collection($testCases),
            ];
        }

        return Inertia::render('Course/LearningMaterial/LearningMaterialQuestion/LearningMaterialQuestionTestCase/Index', [
            'course' => new CourseResource($course),
            'learningMaterial' => new LearningMaterialResource($learningMaterial),
            'question' => new LearningMaterialQuestionResource($question),
            'testCases' => LearningMaterialQuestionTestCaseResource::collection($testCases),
        ]);
    }

    /**
     * Show create form for a new test case
     */
    public function create(Course $course, LearningMaterial $learningMaterial, LearningMaterialQuestion $question) {
        // Verify relationships
        if ($learningMaterial->course_id != $course->id || $question->learning_material_id != $learningMaterial->id) {
            abort(404);
        }

        return Inertia::render('Course/LearningMaterial/LearningMaterialQuestion/LearningMaterialQuestionTestCase/Create', [
            'course' => new CourseResource($course),
            'learningMaterial' => new LearningMaterialResource($learningMaterial),
            'question' => new LearningMaterialQuestionResource($question),
        ]);
    }

    /**
     * Show a specific test case
     */
    public function show(Course $course, LearningMaterial $learningMaterial, LearningMaterialQuestion $question, LearningMaterialQuestionTestCase $testCase) {
        // Verify relationships
        if ($learningMaterial->course_id != $course->id ||
            $question->learning_material_id != $learningMaterial->id ||
            $testCase->learning_material_question_id != $question->id) {
            abort(404);
        }

        if ($this->ajax()) {
            return [
                'course' => new CourseResource($course),
                'learningMaterial' => new LearningMaterialResource($learningMaterial),
                'question' => new LearningMaterialQuestionResource($question),
                'testCase' => new LearningMaterialQuestionTestCaseResource($testCase),
            ];
        }

        return Inertia::render('Course/LearningMaterial/LearningMaterialQuestion/LearningMaterialQuestionTestCase/Show', [
            'course' => new CourseResource($course),
            'learningMaterial' => new LearningMaterialResource($learningMaterial),
            'question' => new LearningMaterialQuestionResource($question),
            'testCase' => new LearningMaterialQuestionTestCaseResource($testCase),
        ]);
    }

    /**
     * Edit form for a test case
     */
    public function edit(Course $course, LearningMaterial $learningMaterial, LearningMaterialQuestion $question, LearningMaterialQuestionTestCase $testCase) {
        // // Verify relationships
        if ($learningMaterial->course_id != $course->id ||
            $question->learning_material_id != $learningMaterial->id ||
            $testCase->learning_material_question_id != $question->id) {
            abort(404);
        }

        return Inertia::render('Course/LearningMaterial/LearningMaterialQuestion/LearningMaterialQuestionTestCase/Edit', [
            'course' => new CourseResource($course),
            'learningMaterial' => new LearningMaterialResource($learningMaterial),
            'question' => new LearningMaterialQuestionResource($question),
            'testCase' => new LearningMaterialQuestionTestCaseResource($testCase),
        ]);
    }
}
