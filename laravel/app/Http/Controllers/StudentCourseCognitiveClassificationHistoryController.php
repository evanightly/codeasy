<?php

namespace App\Http\Controllers;

use App\Http\Requests\StudentCourseCognitiveClassificationHistory\StoreStudentCourseCognitiveClassificationHistoryRequest;
use App\Http\Requests\StudentCourseCognitiveClassificationHistory\UpdateStudentCourseCognitiveClassificationHistoryRequest;
use App\Http\Resources\StudentCourseCognitiveClassificationHistoryResource;
use App\Models\StudentCourseCognitiveClassificationHistory;
use App\Support\Enums\PermissionEnum;
use App\Support\Interfaces\Services\StudentCourseCognitiveClassificationHistoryServiceInterface;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;

class StudentCourseCognitiveClassificationHistoryController extends Controller implements HasMiddleware {
    public function __construct(protected StudentCourseCognitiveClassificationHistoryServiceInterface $studentCourseCognitiveClassificationHistoryService) {}

    public static function middleware(): array {
        return [
            self::createPermissionMiddleware([PermissionEnum::STUDENT_COURSE_COGNITIVE_CLASSIFICATION_HISTORY_CREATE->value], ['create', 'store']),
            self::createPermissionMiddleware([PermissionEnum::STUDENT_COURSE_COGNITIVE_CLASSIFICATION_HISTORY_UPDATE->value], ['edit', 'update']),
            self::createPermissionMiddleware([PermissionEnum::STUDENT_COURSE_COGNITIVE_CLASSIFICATION_HISTORY_READ->value], ['index', 'show']),
            self::createPermissionMiddleware([PermissionEnum::STUDENT_COURSE_COGNITIVE_CLASSIFICATION_HISTORY_DELETE->value], ['destroy']),
        ];
    }

    public function index(Request $request) {
        $perPage = $request->get('perPage', 10);
        $data = StudentCourseCognitiveClassificationHistoryResource::collection($this->studentCourseCognitiveClassificationHistoryService->getAllPaginated($request->query(), $perPage));

        if ($this->ajax()) {
            return $data;
        }

        return inertia('StudentCourseCognitiveClassificationHistory/Index');
    }

    public function create() {
        return inertia('StudentCourseCognitiveClassificationHistory/Create');
    }

    public function store(StoreStudentCourseCognitiveClassificationHistoryRequest $request) {
        if ($this->ajax()) {
            return $this->studentCourseCognitiveClassificationHistoryService->create($request->validated());
        }
    }

    public function show(StudentCourseCognitiveClassificationHistory $studentCourseClassificationHistory) {
        $data = StudentCourseCognitiveClassificationHistoryResource::make($studentCourseClassificationHistory);

        if ($this->ajax()) {
            return $data;
        }

        return inertia('StudentCourseCognitiveClassificationHistory/Show', compact('data'));
    }

    public function edit(StudentCourseCognitiveClassificationHistory $studentCourseClassificationHistory) {
        $data = StudentCourseCognitiveClassificationHistoryResource::make($studentCourseClassificationHistory);

        return inertia('StudentCourseCognitiveClassificationHistory/Edit', compact('data'));
    }

    public function update(UpdateStudentCourseCognitiveClassificationHistoryRequest $request, StudentCourseCognitiveClassificationHistory $studentCourseClassificationHistory) {
        if ($this->ajax()) {
            return $this->studentCourseCognitiveClassificationHistoryService->update($studentCourseClassificationHistory, $request->validated());
        }
    }

    public function destroy(StudentCourseCognitiveClassificationHistory $studentCourseClassificationHistory) {
        if ($this->ajax()) {
            return $this->studentCourseCognitiveClassificationHistoryService->delete($studentCourseClassificationHistory);
        }
    }
}
