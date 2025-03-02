<?php

namespace App\Http\Controllers\Course;

use App\Http\Controllers\Controller;
use App\Http\Resources\CourseResource;
use App\Http\Resources\LearningMaterialResource;
use App\Models\Course;
use App\Models\LearningMaterial;
use App\Services\LearningMaterialService;
use Inertia\Inertia;

class LearningMaterialController extends Controller {
    protected $learningMaterialService;

    public function __construct(LearningMaterialService $learningMaterialService) {
        $this->learningMaterialService = $learningMaterialService;
    }

    /**
     * Display learning materials for a specific course
     */
    public function index(Course $course) {
        $learningMaterials = $this->learningMaterialService->getAll([
            'course_id' => $course->id,
        ]);

        if ($this->ajax()) {
            return [
                'course' => new CourseResource($course),
                'learningMaterials' => LearningMaterialResource::collection($learningMaterials),
            ];
        }

        return Inertia::render('Course/LearningMaterial/Index', [
            'course' => new CourseResource($course),
            'learningMaterials' => LearningMaterialResource::collection($learningMaterials),
        ]);
    }

    /**
     * Show create form for a new learning material in a course
     */
    public function create(Course $course) {
        return Inertia::render('Course/LearningMaterial/Create', [
            'course' => new CourseResource($course),
        ]);
    }

    /**
     * Show a specific learning material from a course
     */
    public function show(Course $course, LearningMaterial $learningMaterial) {
        // Verify this learning material belongs to this course
        if ($learningMaterial->course_id != $course->id) {
            abort(404);
        }

        // $learningMaterial->load(['questions']);

        if ($this->ajax()) {
            return [
                'course' => new CourseResource($course),
                'learningMaterial' => new LearningMaterialResource($learningMaterial),
            ];
        }

        return Inertia::render('Course/LearningMaterial/Show', [
            'course' => new CourseResource($course),
            'learningMaterial' => new LearningMaterialResource($learningMaterial),
        ]);
    }

    /**
     * Edit form for a learning material
     */
    public function edit(Course $course, LearningMaterial $learningMaterial) {
        // Verify this learning material belongs to this course
        if ($learningMaterial->course_id != $course->id) {
            abort(404);
        }

        return Inertia::render('Course/LearningMaterial/Edit', [
            'course' => new CourseResource($course),
            'learningMaterial' => new LearningMaterialResource($learningMaterial),
        ]);
    }
}
