<?php

namespace App\Http\Controllers;

use App\Http\Requests\Course\StoreCourseRequest;
use App\Http\Requests\Course\UpdateCourseRequest;
use App\Http\Resources\CourseResource;
use App\Models\Course;
use App\Support\Enums\IntentEnum;
use App\Support\Enums\PermissionEnum;
use App\Support\Interfaces\Services\CourseServiceInterface;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;

class CourseController extends Controller implements HasMiddleware {
    public function __construct(protected CourseServiceInterface $courseService) {}

    public static function middleware(): array {
        $courseReadPermissions = [
            PermissionEnum::COURSE_READ->value,
            PermissionEnum::LEARNING_MATERIAL_CREATE->value,
            PermissionEnum::LEARNING_MATERIAL_READ->value,
        ];

        return [
            self::createPermissionMiddleware([PermissionEnum::COURSE_CREATE->value], ['create', 'store']),
            self::createPermissionMiddleware([PermissionEnum::COURSE_UPDATE->value], ['edit', 'update']),
            self::createPermissionMiddleware($courseReadPermissions, ['index', 'show']),
            self::createPermissionMiddleware([PermissionEnum::COURSE_DELETE->value], ['destroy']),
        ];
    }

    public function index(Request $request) {
        $intent = $request->get('intent');

        if ($this->ajax()) {
            switch ($intent) {
                case IntentEnum::COURSE_INDEX_IMPORT_TEMPLATE->value:
                    return $this->courseService->downloadTemplate();
                case IntentEnum::COURSE_INDEX_IMPORT_MATERIAL_TEMPLATE->value:
                    return $this->courseService->downloadMaterialTemplate();
                case IntentEnum::COURSE_INDEX_ENROLLED_STUDENT->value:
                    $enrolledCourses = $this->courseService->getEnrolledCoursesForCurrentUser($request->query());

                    return CourseResource::collection($enrolledCourses);
            }

            $data = CourseResource::collection($this->courseService->getAllPaginated($request->query()));

            return $data;
        }

        return inertia('Course/Index');
    }

    public function create() {
        return inertia('Course/Create');
    }

    public function store(StoreCourseRequest $request) {
        $intent = $request->get('intent');

        if ($this->ajax()) {
            switch ($intent) {
                case IntentEnum::COURSE_STORE_IMPORT->value:
                    return $this->courseService->import($request);
                case IntentEnum::COURSE_STORE_PREVIEW_IMPORT->value:
                    return $this->courseService->previewImport($request);
            }

            return $this->courseService->create($request->validated());
        }
    }

    public function show(Course $course) {
        $data = CourseResource::make($course->load(['classroom', 'teacher']));

        if ($this->ajax()) {
            return $data;
        }

        return inertia('Course/Show', compact('data'));
    }

    public function edit(Course $course) {
        $data = CourseResource::make($course);

        return inertia('Course/Edit', compact('data'));
    }

    public function update(UpdateCourseRequest $request, Course $course) {
        if ($this->ajax()) {
            return $this->courseService->update($course, $request->validated());
        }
    }

    public function destroy(Course $course) {
        if ($this->ajax()) {
            return $this->courseService->delete($course);
        }
    }
}
