<?php

namespace App\Http\Controllers\Course\LearningMaterial\LearningMaterialQuestion;

use App\Http\Controllers\Controller;
use App\Http\Requests\LearningMaterialQuestionTestCase\ImportLearningMaterialQuestionTestCaseRequest;
use App\Http\Resources\CourseResource;
use App\Http\Resources\LearningMaterialQuestionResource;
use App\Http\Resources\LearningMaterialQuestionTestCaseResource;
use App\Http\Resources\LearningMaterialResource;
use App\Models\Course;
use App\Models\LearningMaterial;
use App\Models\LearningMaterialQuestion;
use App\Models\LearningMaterialQuestionTestCase;
use App\Services\LearningMaterialQuestionTestCase\CognitiveLevelsTemplateService;
use App\Services\LearningMaterialQuestionTestCaseService;
use App\Support\Enums\IntentEnum;
use App\Support\Enums\PermissionEnum;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Inertia\Inertia;

class LearningMaterialQuestionTestCaseController extends Controller implements HasMiddleware {
    protected $testCaseService;
    protected $templateService;

    public function __construct(
        LearningMaterialQuestionTestCaseService $testCaseService,
        CognitiveLevelsTemplateService $templateService
    ) {
        $this->testCaseService = $testCaseService;
        $this->templateService = $templateService;
    }

    public static function middleware(): array {
        return [
            self::createPermissionMiddleware([
                PermissionEnum::COURSE_READ->value,
                PermissionEnum::LEARNING_MATERIAL_READ->value,
                PermissionEnum::LEARNING_MATERIAL_QUESTION_READ->value,
                PermissionEnum::LEARNING_MATERIAL_QUESTION_TEST_CASE_READ->value,
            ], ['index', 'show', 'create', 'edit', 'allTestCases', 'downloadCognitiveLevelsTemplate']),

            self::createPermissionMiddleware([
                PermissionEnum::COURSE_UPDATE->value,
                PermissionEnum::LEARNING_MATERIAL_UPDATE->value,
                PermissionEnum::LEARNING_MATERIAL_QUESTION_UPDATE->value,
                PermissionEnum::LEARNING_MATERIAL_QUESTION_TEST_CASE_UPDATE->value,
            ], ['bulkUpdateCognitiveLevels']),
        ];
    }

    /**
     * Display test cases for a specific question
     */
    public function index(Course $course, LearningMaterial $learningMaterial, LearningMaterialQuestion $question, Request $request) {
        // Verify relationships
        if ($learningMaterial->course_id != $course->id || $question->learning_material_id != $learningMaterial->id) {
            abort(404);
        }

        $intent = $request->get('intent');

        // Handle import template downloads
        if ($intent === IntentEnum::LEARNING_MATERIAL_QUESTION_TEST_CASE_INDEX_IMPORT_TEMPLATE->value) {
            return $this->testCaseService->downloadTemplate();
        }

        if ($intent === IntentEnum::LEARNING_MATERIAL_QUESTION_TEST_CASE_INDEX_IMPORT_CSV_TEMPLATE->value) {
            return $this->testCaseService->downloadExcelTemplate();
        }

        $testCases = $this->testCaseService->getAll([
            'learning_material_question_id' => $question->id,
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

    /**
     * Store a new test case or handle import operations
     */
    public function store(Course $course, LearningMaterial $learningMaterial, LearningMaterialQuestion $question, ImportLearningMaterialQuestionTestCaseRequest $request) {
        // Verify relationships
        if ($learningMaterial->course_id != $course->id || $question->learning_material_id != $learningMaterial->id) {
            abort(404);
        }

        $intent = $request->get('intent');

        // Handle import operations
        if ($intent === IntentEnum::LEARNING_MATERIAL_QUESTION_TEST_CASE_STORE_IMPORT->value) {
            $request->merge(['learning_material_question_id' => $question->id]);

            return $this->testCaseService->import($request);
        }

        if ($intent === IntentEnum::LEARNING_MATERIAL_QUESTION_TEST_CASE_STORE_PREVIEW_IMPORT->value) {
            return $this->testCaseService->previewImport($request);
        }

        // TODO: refactor this
        // Handle regular test case creation - fall back to regular request validation
        $data = $request->validate([
            'description' => 'nullable|string',
            'language' => 'required|string',
            'input' => 'required|string',
            'hidden' => 'boolean',
            'active' => 'boolean',
            'expected_output_file' => 'nullable|file',
        ]);

        $data['learning_material_question_id'] = $question->id;

        $testCase = $this->testCaseService->create($data);

        if ($this->ajax()) {
            return new LearningMaterialQuestionTestCaseResource($testCase);
        }

        // return redirect()->route('courses.learning-materials.questions.test-cases.index', [
        //     'course' => $course,
        //     'learningMaterial' => $learningMaterial,
        //     'question' => $question,
        // ]);
    }

    /**
     * Display all test cases in a course with their cognitive levels
     */
    public function allTestCases(Course $course, Request $request) {
        $intent = $request->get('intent');

        // Handle export filtered test cases
        if ($intent === IntentEnum::LEARNING_MATERIAL_QUESTION_TEST_CASE_ALL_TEST_CASES_EXPORT_FILTERED->value) {
            // Process the filters properly
            $filters = $request->all();

            // Decode the selectedMaterialIds from JSON string to array
            if (!empty($filters['selectedMaterialIds'])) {
                $selectedMaterialIds = json_decode($filters['selectedMaterialIds'], true);
                $filters['selectedMaterialIds'] = is_array($selectedMaterialIds) ? $selectedMaterialIds : [];
            } else {
                $filters['selectedMaterialIds'] = [];
            }

            return $this->testCaseService->exportFilteredTestCases($course, $filters);
        }

        // Default behavior - show the page
        $testCases = LearningMaterialQuestionTestCase::whereHas('learning_material_question.learning_material', function ($query) use ($course) {
            $query->where('course_id', $course->id);
        })
            ->with([
                'learning_material_question' => function ($query) {
                    $query->select('id', 'title', 'learning_material_id');
                },
                'learning_material_question.learning_material' => function ($query) {
                    $query->select('id', 'title', 'course_id');
                },
            ])
            ->get();

        return Inertia::render('Course/TestCaseCognitiveLevels/Index', [
            'course' => new CourseResource($course),
            'testCases' => LearningMaterialQuestionTestCaseResource::collection($testCases),
        ]);
    }

    /**
     * Bulk update cognitive levels for multiple test cases
     * TODO: refactor using service
     */
    public function bulkUpdateCognitiveLevels(Course $course, Request $request) {
        $request->validate([
            'updates' => 'required|array',
            'updates.*.id' => 'required|integer|exists:learning_material_question_test_cases,id',
            'updates.*.cognitive_levels' => 'nullable|array',
            'updates.*.cognitive_levels.*' => 'string|in:C1,C2,C3,C4,C5,C6',
        ]);

        $updates = collect($request->input('updates'));

        foreach ($updates as $update) {
            $testCase = LearningMaterialQuestionTestCase::whereHas('learning_material_question.learning_material', function ($query) use ($course) {
                $query->where('course_id', $course->id);
            })->findOrFail($update['id']);

            $testCase->update([
                'cognitive_levels' => $update['cognitive_levels'] ?? [],
            ]);
        }

        if ($this->ajax()) {
            return response()->json([
                'message' => 'Cognitive levels updated successfully',
                'updated_count' => $updates->count(),
            ]);
        }

        return redirect()->route('courses.test-cases.cognitive-levels', $course)
            ->with('success', 'Cognitive levels updated successfully');
    }

    /**
     * Download Excel template for cognitive levels import
     */
    public function downloadCognitiveLevelsTemplate(Course $course, Request $request) {
        // Check if this is a sequence validation export request
        $intent = $request->input('intent');

        if ($intent === IntentEnum::LEARNING_MATERIAL_QUESTION_TEST_CASE_ALL_TEST_CASES_EXPORT_SEQUENCE_VALIDATION->value) {
            // Handle sequence validation export
            $validationData = $request->input('validation_data');
            if (is_string($validationData)) {
                $validationData = json_decode($validationData, true);
            }

            $materials = $request->input('materials');
            if (is_string($materials)) {
                $materials = json_decode($materials, true);
            }

            $filters = [
                'selectedMaterialIds' => $materials ?: [],
                'searchQuery' => $request->input('search_query', ''),
            ];

            return $this->testCaseService->exportSequenceValidation($course, $validationData, $filters);
        }

        // Default: Download template
        $templatePath = $this->templateService->generateTemplate();

        return response()->download($templatePath, 'cognitive-levels-template.xlsx', [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    /**
     * Export sequence validation report via POST request
     */
    public function exportSequenceValidation(Course $course, Request $request) {
        // Decode the validation data from JSON
        $validationData = $request->input('validationData');
        if (is_string($validationData)) {
            $validationData = json_decode($validationData, true);
        }

        // Decode the materials data
        $materials = $request->input('materials');
        if (is_string($materials)) {
            $materials = json_decode($materials, true);
        }

        $filters = [
            'selectedMaterialIds' => $materials ?: [],
            'searchQuery' => $request->input('searchQuery', ''),
        ];

        return $this->testCaseService->exportSequenceValidation($course, $validationData, $filters);
    }
}
