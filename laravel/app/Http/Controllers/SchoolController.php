<?php

namespace App\Http\Controllers;

use App\Http\Requests\School\StoreSchoolRequest;
use App\Http\Requests\School\UpdateSchoolRequest;
use App\Http\Resources\SchoolResource;
use App\Models\School;
use App\Models\User;
use App\Support\Enums\IntentEnum;
use App\Support\Enums\PermissionEnum;
use App\Support\Interfaces\Services\SchoolServiceInterface;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Support\Facades\Auth;

class SchoolController extends Controller implements HasMiddleware {
    public function __construct(protected SchoolServiceInterface $schoolService) {}

    public static function middleware(): array {
        // Define permissions that should grant access to school listing
        $schoolReadPermissions = [
            PermissionEnum::SCHOOL_READ->value,
            PermissionEnum::SCHOOL_REQUEST_CREATE->value,
            PermissionEnum::SCHOOL_REQUEST_READ->value,
            PermissionEnum::CLASS_ROOM_CREATE->value,
        ];

        return [
            self::createPermissionMiddleware([PermissionEnum::SCHOOL_CREATE->value], ['create', 'store']),
            self::createPermissionMiddleware([PermissionEnum::SCHOOL_UPDATE->value], ['edit', 'update']),
            self::createPermissionMiddleware($schoolReadPermissions, ['show']),
            self::createPermissionMiddleware([PermissionEnum::SCHOOL_DELETE->value], ['destroy']),
        ];
    }

    public function index(Request $request) {
        $data = SchoolResource::collection($this->schoolService->getAllPaginated($request->query()));

        if ($this->ajax()) {
            return $data;
        }

        return inertia('School/Index');
    }

    public function create() {
        return inertia('School/Create');
    }

    public function store(StoreSchoolRequest $request) {
        if ($this->ajax()) {
            return $this->schoolService->create($request->validated());
        }
    }

    public function show(School $school) {
        /** @var User $user */
        $user = Auth::user();
        // Check if user administrator of the school
        if (!$user->isSchoolAdmin($school)) {
            abort(403, 'You do not have permission to view this school.');
        }

        $data = SchoolResource::make($school->load(['administrators', 'teachers', 'students']));

        if ($this->ajax()) {
            return $data;
        }

        return inertia('School/Show', compact('data'));
    }

    public function edit(School $school) {
        $data = SchoolResource::make($school);

        return inertia('School/Edit', compact('data'));
    }

    public function update(UpdateSchoolRequest $request, School $school) {
        $intent = $request->get('intent');

        if ($this->ajax()) {
            switch ($intent) {
                case IntentEnum::SCHOOL_UPDATE_ASSIGN_ADMIN->value:
                    $this->schoolService->assignSchoolAdmin($school, $request->validated());

                    return;
                case IntentEnum::SCHOOL_UPDATE_UNASSIGN_ADMIN->value:
                    $this->schoolService->unassignSchoolAdmin($school, $request->validated());

                    return;
                case IntentEnum::SCHOOL_UPDATE_ASSIGN_STUDENT->value:
                    $this->schoolService->assignStudent($school, $request->validated());

                    return;
                case IntentEnum::SCHOOL_UPDATE_UNASSIGN_STUDENT->value:
                    $this->schoolService->unassignStudent($school, $request->validated());

                    return;
                case IntentEnum::SCHOOL_UPDATE_BULK_ASSIGN_STUDENTS->value:
                    $this->schoolService->assignBulkStudents($school, $request->validated());

                    return;
                case IntentEnum::SCHOOL_UPDATE_BULK_UNASSIGN_STUDENTS->value:
                    $this->schoolService->unassignBulkStudents($school, $request->validated());

                    return;
            }

            return $this->schoolService->update($school, $request->validated());
        }
    }

    public function destroy(School $school) {
        if ($this->ajax()) {
            return $this->schoolService->delete($school);
        }
    }
}
