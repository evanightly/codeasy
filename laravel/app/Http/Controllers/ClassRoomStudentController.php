<?php

namespace App\Http\Controllers;

use App\Http\Requests\ClassRoomStudent\StoreClassRoomStudentRequest;
use App\Http\Requests\ClassRoomStudent\UpdateClassRoomStudentRequest;
use App\Http\Resources\ClassRoomStudentResource;
use App\Models\ClassRoomStudent;
use App\Support\Enums\PermissionEnum;
use App\Support\Interfaces\Services\ClassRoomStudentServiceInterface;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;

class ClassRoomStudentController extends Controller implements HasMiddleware {
    public function __construct(protected ClassRoomStudentServiceInterface $classRoomStudentService) {}

    public static function middleware(): array {
        return [
            self::createPermissionMiddleware([PermissionEnum::CLASS_ROOM_STUDENT_CREATE->value], ['create', 'store']),
            self::createPermissionMiddleware([PermissionEnum::CLASS_ROOM_STUDENT_UPDATE->value], ['edit', 'update']),
            self::createPermissionMiddleware([PermissionEnum::CLASS_ROOM_STUDENT_READ->value], ['index', 'show']),
            self::createPermissionMiddleware([PermissionEnum::CLASS_ROOM_STUDENT_DELETE->value], ['destroy']),
        ];
    }

    public function index(Request $request) {
        $data = ClassRoomStudentResource::collection($this->classRoomStudentService->getAllPaginated($request->query()));

        if ($this->ajax()) {
            return $data;
        }

        return inertia('ClassRoomStudent/Index');
    }

    public function create() {
        return inertia('ClassRoomStudent/Create');
    }

    public function store(StoreClassRoomStudentRequest $request) {
        if ($this->ajax()) {
            return $this->classRoomStudentService->create($request->validated());
        }
    }

    public function show(ClassRoomStudent $classRoomStudent) {
        $data = ClassRoomStudentResource::make($classRoomStudent);

        if ($this->ajax()) {
            return $data;
        }

        return inertia('ClassRoomStudent/Show', compact('data'));
    }

    public function edit(ClassRoomStudent $classRoomStudent) {
        $data = ClassRoomStudentResource::make($classRoomStudent);

        return inertia('ClassRoomStudent/Edit', compact('data'));
    }

    public function update(UpdateClassRoomStudentRequest $request, ClassRoomStudent $classRoomStudent) {
        if ($this->ajax()) {
            return $this->classRoomStudentService->update($classRoomStudent, $request->validated());
        }
    }

    public function destroy(ClassRoomStudent $classRoomStudent) {
        if ($this->ajax()) {
            return $this->classRoomStudentService->delete($classRoomStudent);
        }
    }
}
