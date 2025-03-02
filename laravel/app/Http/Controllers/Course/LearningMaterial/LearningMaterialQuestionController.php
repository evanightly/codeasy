<?php

namespace App\Http\Controllers\Course\LearningMaterial;

use App\Http\Controllers\Controller;
use App\Http\Resources\CourseResource;
use App\Http\Resources\LearningMaterialQuestionResource;
use App\Http\Resources\LearningMaterialResource;
use App\Models\Course;
use App\Models\LearningMaterial;
use App\Models\LearningMaterialQuestion;
use App\Services\LearningMaterialQuestionService;
use Inertia\Inertia;

class LearningMaterialQuestionController extends Controller {
    protected $questionService;

    public function __construct(LearningMaterialQuestionService $questionService) {
        $this->questionService = $questionService;
    }

    /**
     * Display questions for a specific learning material
     */
    public function index(Course $course, LearningMaterial $learningMaterial) {
        // Verify this learning material belongs to this course
        if ($learningMaterial->course_id != $course->id) {
            abort(404);
        }

        $questions = $this->questionService->getAll([
            'learning_material_id' => $learningMaterial->id,
        ]);

        if ($this->ajax()) {
            return [
                'course' => new CourseResource($course),
                'learningMaterial' => new LearningMaterialResource($learningMaterial),
                'questions' => LearningMaterialQuestionResource::collection($questions),
            ];
        }

        return Inertia::render('Course/LearningMaterial/LearningMaterialQuestion/Index', [
            'course' => new CourseResource($course),
            'learningMaterial' => new LearningMaterialResource($learningMaterial),
            'questions' => LearningMaterialQuestionResource::collection($questions),
        ]);
    }

    /**
     * Show create form for a new question
     */
    public function create(Course $course, LearningMaterial $learningMaterial) {
        // Verify this learning material belongs to this course
        if ($learningMaterial->course_id != $course->id) {
            abort(404);
        }

        return Inertia::render('Course/LearningMaterial/LearningMaterialQuestion/Create', [
            'course' => new CourseResource($course),
            'learningMaterial' => new LearningMaterialResource($learningMaterial),
        ]);
    }

    /**
     * Show a specific question
     */
    public function show(Course $course, LearningMaterial $learningMaterial, LearningMaterialQuestion $question) {
        // Verify relationships
        if ($learningMaterial->course_id != $course->id || $question->learning_material_id != $learningMaterial->id) {
            abort(404);
        }

        // $question->load(['testCases']); // Load associated test cases if needed

        if ($this->ajax()) {
            return [
                'course' => new CourseResource($course),
                'learningMaterial' => new LearningMaterialResource($learningMaterial),
                'question' => new LearningMaterialQuestionResource($question),
            ];
        }

        return Inertia::render('Course/LearningMaterial/LearningMaterialQuestion/Show', [
            'course' => new CourseResource($course),
            'learningMaterial' => new LearningMaterialResource($learningMaterial),
            'question' => new LearningMaterialQuestionResource($question),
        ]);
    }

    /**
     * Edit form for a question
     */
    public function edit(Course $course, LearningMaterial $learningMaterial, LearningMaterialQuestion $question) {
        // Verify relationships
        if ($learningMaterial->course_id != $course->id || $question->learning_material_id != $learningMaterial->id) {
            abort(404);
        }

        return Inertia::render('Course/LearningMaterial/LearningMaterialQuestion/Edit', [
            'course' => new CourseResource($course),
            'learningMaterial' => new LearningMaterialResource($learningMaterial),
            'question' => new LearningMaterialQuestionResource($question),
        ]);
    }
}
