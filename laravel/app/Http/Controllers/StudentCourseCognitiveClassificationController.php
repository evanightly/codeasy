<?php

namespace App\Http\Controllers;

use App\Http\Requests\StudentCourseCognitiveClassification\StoreStudentCourseCognitiveClassificationRequest;
use App\Http\Requests\StudentCourseCognitiveClassification\UpdateStudentCourseCognitiveClassificationRequest;
use App\Http\Resources\StudentCourseCognitiveClassificationResource;
use App\Models\StudentCourseCognitiveClassification;
use App\Support\Enums\IntentEnum;
use App\Support\Enums\PermissionEnum;
use App\Support\Interfaces\Services\StudentCourseCognitiveClassificationServiceInterface;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;

class StudentCourseCognitiveClassificationController extends Controller implements HasMiddleware {
    public function __construct(protected StudentCourseCognitiveClassificationServiceInterface $studentCourseCognitiveClassificationService) {}

    public static function middleware(): array {
        return [
            self::createPermissionMiddleware([PermissionEnum::STUDENT_COURSE_COGNITIVE_CLASSIFICATION_CREATE->value], ['create', 'store']),
            self::createPermissionMiddleware([PermissionEnum::STUDENT_COURSE_COGNITIVE_CLASSIFICATION_UPDATE->value], ['edit', 'update']),
            self::createPermissionMiddleware([PermissionEnum::STUDENT_COURSE_COGNITIVE_CLASSIFICATION_READ->value], ['index', 'show']),
            self::createPermissionMiddleware([PermissionEnum::STUDENT_COURSE_COGNITIVE_CLASSIFICATION_DELETE->value], ['destroy']),
        ];
    }

    public function index(Request $request) {
        $intent = $request->get('intent');

        // Get course cognitive classification for a student
        if ($intent === IntentEnum::STUDENT_COURSE_COGNITIVE_CLASSIFICATION_INDEX_GET_BY_USER_AND_COURSE->value) {
            $userId = $request->get('user_id');
            $courseId = $request->get('course_id');
            $classificationType = $request->get('classification_type', 'topsis');

            if (!$userId || !$courseId) {
                return response()->json(['error' => 'User ID and Course ID are required'], 422);
            }

            $classification = $this->studentCourseCognitiveClassificationService->getOrCreateCourseClassification(
                $userId,
                $courseId,
                $classificationType
            );

            return new StudentCourseCognitiveClassificationResource($classification);
        }

        // Get cognitive report for a course
        if ($intent === IntentEnum::STUDENT_COURSE_COGNITIVE_CLASSIFICATION_INDEX_GET_COURSE_REPORT->value) {
            $courseId = $request->get('course_id');
            $classificationType = $request->get('classification_type', 'topsis');

            if (!$courseId) {
                return response()->json(['error' => 'Course ID is required'], 422);
            }

            $report = $this->studentCourseCognitiveClassificationService->getCourseCognitiveReport(
                $courseId,
                $classificationType
            );

            return response()->json($report);
        }

        // Regular index page with pagination
        $perPage = $request->get('perPage', 10);
        $data = StudentCourseCognitiveClassificationResource::collection(
            $this->studentCourseCognitiveClassificationService->getAllPaginated($request->query(), $perPage)
        );

        if ($this->ajax()) {
            return $data;
        }

        return inertia('StudentCourseCognitiveClassification/Index');
    }

    public function create() {
        return inertia('StudentCourseCognitiveClassification/Create');
    }

    public function store(StoreStudentCourseCognitiveClassificationRequest $request) {
        if ($this->ajax()) {
            return $this->studentCourseCognitiveClassificationService->create($request->validated());
        }
    }

    public function show(StudentCourseCognitiveClassification $studentCourseClassification) {
        $intent = request()->get('intent');

        // Export calculation steps as Excel file
        if ($intent === IntentEnum::STUDENT_COURSE_COGNITIVE_CLASSIFICATION_INDEX_EXPORT_CALCULATION_STEPS->value) {
            return $this->studentCourseCognitiveClassificationService->exportCalculationStepsToExcel($studentCourseClassification);
        }

        // Get detailed classification information with material breakdowns
        if ($intent === IntentEnum::STUDENT_COURSE_COGNITIVE_CLASSIFICATION_SHOW_DETAILS->value) {
            $details = $this->studentCourseCognitiveClassificationService->getDetailedClassification($studentCourseClassification);

            return response()->json($details);
        }

        $data = StudentCourseCognitiveClassificationResource::make($studentCourseClassification->load(['course', 'user']));

        if ($this->ajax()) {
            return $data;
        }

        return inertia('StudentCourseCognitiveClassification/Show', compact('data'));
    }

    public function edit(StudentCourseCognitiveClassification $studentCourseClassification) {
        $data = StudentCourseCognitiveClassificationResource::make($studentCourseClassification);

        return inertia('StudentCourseCognitiveClassification/Edit', compact('data'));
    }

    public function update(UpdateStudentCourseCognitiveClassificationRequest $request, StudentCourseCognitiveClassification $studentCourseClassification) {
        if ($this->ajax()) {
            return $this->studentCourseCognitiveClassificationService->update($studentCourseClassification, $request->validated());
        }
    }

    public function destroy(StudentCourseCognitiveClassification $studentCourseClassification) {
        if ($this->ajax()) {
            return $this->studentCourseCognitiveClassificationService->delete($studentCourseClassification);
        }
    }
}
