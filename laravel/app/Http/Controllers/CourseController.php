<?php

namespace App\Http\Controllers;

use App\Http\Requests\Course\StoreCourseRequest;
use App\Http\Requests\Course\UpdateCourseRequest;
use App\Http\Resources\CourseResource;
use App\Models\Course;
use App\Support\Enums\PermissionEnum;
use App\Support\Interfaces\Services\CourseServiceInterface;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\Middleware;

class CourseController extends Controller {
    public function __construct(protected CourseServiceInterface $courseService) {}

    public static function middleware(): array {
        return [
            new Middleware('permission:' . PermissionEnum::COURSE_CREATE->value, only: ['create', 'store']),
            new Middleware('permission:' . PermissionEnum::COURSE_UPDATE->value, only: ['edit', 'update']),
            new Middleware('permission:' . PermissionEnum::COURSE_READ->value, only: ['index', 'show']),
            new Middleware('permission:' . PermissionEnum::COURSE_DELETE->value, only: ['destroy']),
        ];
    }

    public function index(Request $request) {
        $perPage = $request->get('perPage', 10);
        $data = CourseResource::collection($this->courseService->getAllPaginated($request->query(), $perPage));

        if ($this->ajax()) {
            return $data;
        }

        return inertia('Course/Index');
    }

    public function create() {
        return inertia('Course/Create');
    }

    public function store(StoreCourseRequest $request) {
        if ($this->ajax()) {
            return $this->courseService->create($request->validated());
        }
    }

    public function show(Course $course) {
        $data = CourseResource::make($course);

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
