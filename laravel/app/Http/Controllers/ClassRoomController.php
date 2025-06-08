<?php

namespace App\Http\Controllers;

use App\Http\Requests\ClassRoom\StoreClassRoomRequest;
use App\Http\Requests\ClassRoom\UpdateClassRoomRequest;
use App\Http\Resources\ClassRoomResource;
use App\Models\ClassRoom;
use App\Support\Enums\IntentEnum;
use App\Support\Enums\PermissionEnum;
use App\Support\Interfaces\Services\ClassRoomServiceInterface;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;

class ClassRoomController extends Controller implements HasMiddleware {
    public function __construct(protected ClassRoomServiceInterface $classRoomService) {}

    public static function middleware(): array {
        $classRoomReadPermissions = [
            PermissionEnum::CLASS_ROOM_READ->value,
            PermissionEnum::CLASS_ROOM_STUDENT_CREATE->value,
            PermissionEnum::CLASS_ROOM_STUDENT_READ->value,
            PermissionEnum::COURSE_CREATE->value,
            PermissionEnum::COURSE_READ->value,
        ];

        return [
            self::createPermissionMiddleware([PermissionEnum::CLASS_ROOM_CREATE->value], ['create', 'store']),
            self::createPermissionMiddleware([PermissionEnum::CLASS_ROOM_UPDATE->value], ['edit', 'update']),
            self::createPermissionMiddleware($classRoomReadPermissions, ['index', 'show']),
            self::createPermissionMiddleware([PermissionEnum::CLASS_ROOM_DELETE->value], ['destroy']),
        ];
    }

    public function index(Request $request) {
        $data = ClassRoomResource::collection($this->classRoomService->getAllPaginated($request->query()));

        if ($this->ajax()) {
            return $data;
        }

        return inertia('ClassRoom/Index');
    }

    public function create() {
        return inertia('ClassRoom/Create');
    }

    public function store(StoreClassRoomRequest $request) {
        if ($this->ajax()) {
            return $this->classRoomService->create($request->validated());
        }
    }

    public function show(ClassRoom $classRoom) {
        $data = ClassRoomResource::make($classRoom->load(['school', 'students', 'courses']));

        if ($this->ajax()) {
            return $data;
        }

        return inertia('ClassRoom/Show', compact('data'));
    }

    public function edit(ClassRoom $classRoom) {
        $data = ClassRoomResource::make($classRoom);

        return inertia('ClassRoom/Edit', compact('data'));
    }

    public function update(UpdateClassRoomRequest $request, ClassRoom $classRoom) {
        $intent = $request->get('intent');

        if ($this->ajax()) {
            switch ($intent) {
                case IntentEnum::CLASS_ROOM_UPDATE_ASSIGN_STUDENT->value:
                    $this->classRoomService->assignStudent($classRoom, $request->validated());

                    return;
                case IntentEnum::CLASS_ROOM_UPDATE_UNASSIGN_STUDENT->value:
                    $this->classRoomService->unassignStudent($classRoom, $request->validated());

                    return;
                case IntentEnum::CLASS_ROOM_UPDATE_BULK_ASSIGN_STUDENTS->value:
                    $this->classRoomService->assignBulkStudents($classRoom, $request->validated());

                    return;
                case IntentEnum::CLASS_ROOM_UPDATE_BULK_UNASSIGN_STUDENTS->value:
                    $this->classRoomService->unassignBulkStudents($classRoom, $request->validated());

                    return;
            }

            return $this->classRoomService->update($classRoom, $request->validated());
        }
    }

    public function destroy(ClassRoom $classRoom) {
        if ($this->ajax()) {
            return $this->classRoomService->delete($classRoom);
        }
    }
}
