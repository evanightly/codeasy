<?php

namespace App\Http\Controllers;

use App\Http\Requests\StudentCognitiveClassification\StoreStudentCognitiveClassificationRequest;
use App\Http\Requests\StudentCognitiveClassification\UpdateStudentCognitiveClassificationRequest;
use App\Http\Resources\StudentCognitiveClassificationResource;
use App\Models\StudentCognitiveClassification;
use App\Support\Enums\IntentEnum;
use App\Support\Enums\PermissionEnum;
use App\Support\Interfaces\Services\StudentCognitiveClassificationServiceInterface;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;

class StudentCognitiveClassificationController extends Controller implements HasMiddleware {
    public function __construct(protected StudentCognitiveClassificationServiceInterface $studentCognitiveClassificationService) {}

    public static function middleware(): array {
        return [
            self::createPermissionMiddleware([PermissionEnum::STUDENT_COGNITIVE_CLASSIFICATION_CREATE->value], ['create', 'store']),
            self::createPermissionMiddleware([PermissionEnum::STUDENT_COGNITIVE_CLASSIFICATION_UPDATE->value], ['edit', 'update']),
            self::createPermissionMiddleware([PermissionEnum::STUDENT_COGNITIVE_CLASSIFICATION_READ->value], ['index', 'show']),
            self::createPermissionMiddleware([PermissionEnum::STUDENT_COGNITIVE_CLASSIFICATION_DELETE->value], ['destroy']),
        ];
    }

    public function index(Request $request) {
        $intent = $request->get('intent');

        if ($intent === IntentEnum::STUDENT_COGNITIVE_CLASSIFICATION_INDEX_EXPORT->value) {
            return $this->studentCognitiveClassificationService->exportToExcel($request->query());
        }

        if ($intent === IntentEnum::STUDENT_COGNITIVE_CLASSIFICATION_INDEX_EXPORT_RAW_DATA->value) {
            $courseId = $request->get('course_id');
            $exportFormat = $request->get('export_format', 'raw');
            $includeClassification = $request->get('include_classification', false);

            if (!$courseId) {
                return response()->json(['error' => 'Course ID is required'], 422);
            }

            return $this->studentCognitiveClassificationService->exportRawDataToExcel(
                $courseId,
                null,
                $exportFormat,
                $includeClassification
            );
        }

        $data = StudentCognitiveClassificationResource::collection($this->studentCognitiveClassificationService->getAllPaginated($request->query()));

        if ($this->ajax()) {
            return $data;
        }

        return inertia('StudentCognitiveClassification/Index');
    }

    public function create() {
        return inertia('StudentCognitiveClassification/Create');
    }

    public function store(StoreStudentCognitiveClassificationRequest $request) {
        $intent = $request->get('intent');

        if ($intent === IntentEnum::STUDENT_COGNITIVE_CLASSIFICATION_STORE_RUN_CLASSIFICATION->value) {
            return $this->studentCognitiveClassificationService->runClassification($request->validated());
        }

        if ($this->ajax()) {
            return $this->studentCognitiveClassificationService->create($request->validated());
        }
    }

    public function show(StudentCognitiveClassification $studentCognitiveClassification) {
        $data = StudentCognitiveClassificationResource::make($studentCognitiveClassification);

        if ($this->ajax()) {
            return $data;
        }

        return inertia('StudentCognitiveClassification/Show', compact('data'));
    }

    public function edit(StudentCognitiveClassification $studentCognitiveClassification) {
        $data = StudentCognitiveClassificationResource::make($studentCognitiveClassification);

        return inertia('StudentCognitiveClassification/Edit', compact('data'));
    }

    public function update(UpdateStudentCognitiveClassificationRequest $request, StudentCognitiveClassification $studentCognitiveClassification) {
        if ($this->ajax()) {
            return $this->studentCognitiveClassificationService->update($studentCognitiveClassification, $request->validated());
        }
    }

    public function destroy(StudentCognitiveClassification $studentCognitiveClassification) {
        if ($this->ajax()) {
            return $this->studentCognitiveClassificationService->delete($studentCognitiveClassification);
        }
    }
}
