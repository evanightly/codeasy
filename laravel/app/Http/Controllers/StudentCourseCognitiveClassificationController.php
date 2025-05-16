<?php

namespace App\Http\Controllers;

use App\Http\Requests\StudentCourseCognitiveClassification\StoreStudentCourseCognitiveClassificationRequest;
use App\Http\Requests\StudentCourseCognitiveClassification\UpdateStudentCourseCognitiveClassificationRequest;
use App\Http\Resources\StudentCourseCognitiveClassificationResource;
use App\Models\StudentCourseCognitiveClassification;
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
        $perPage = $request->get('perPage', 10);
        $data = StudentCourseCognitiveClassificationResource::collection($this->studentCourseCognitiveClassificationService->getAllPaginated($request->query(), $perPage));

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

    public function show(StudentCourseCognitiveClassification $studentCourseCognitiveClassification) {
        $data = StudentCourseCognitiveClassificationResource::make($studentCourseCognitiveClassification);

        if ($this->ajax()) {
            return $data;
        }

        return inertia('StudentCourseCognitiveClassification/Show', compact('data'));
    }

    public function edit(StudentCourseCognitiveClassification $studentCourseCognitiveClassification) {
        $data = StudentCourseCognitiveClassificationResource::make($studentCourseCognitiveClassification);

        return inertia('StudentCourseCognitiveClassification/Edit', compact('data'));
    }

    public function update(UpdateStudentCourseCognitiveClassificationRequest $request, StudentCourseCognitiveClassification $studentCourseCognitiveClassification) {
        if ($this->ajax()) {
            return $this->studentCourseCognitiveClassificationService->update($studentCourseCognitiveClassification, $request->validated());
        }
    }

    public function destroy(StudentCourseCognitiveClassification $studentCourseCognitiveClassification) {
        if ($this->ajax()) {
            return $this->studentCourseCognitiveClassificationService->delete($studentCourseCognitiveClassification);
        }
    }
}
