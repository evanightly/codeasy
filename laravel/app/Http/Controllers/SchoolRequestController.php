<?php

namespace App\Http\Controllers;

use App\Http\Requests\SchoolRequest\StoreSchoolRequestRequest;
use App\Http\Requests\SchoolRequest\UpdateSchoolRequestRequest;
use App\Http\Resources\SchoolRequestResource;
use App\Models\SchoolRequest;
use App\Support\Enums\IntentEnum;
use App\Support\Enums\PermissionEnum;
use App\Support\Interfaces\Services\SchoolRequestServiceInterface;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;

class SchoolRequestController extends Controller implements HasMiddleware {
    public function __construct(protected SchoolRequestServiceInterface $schoolRequestService) {}

    public static function middleware(): array {
        $schoolRequestReadPermissions = [
            PermissionEnum::SCHOOL_REQUEST_READ->value,
            // PermissionEnum::SCHOOL_ADMIN->value, // Commented out as it doesn't exist in the enum
        ];

        return [
            self::createPermissionMiddleware([PermissionEnum::SCHOOL_REQUEST_CREATE->value], ['create', 'store']),
            self::createPermissionMiddleware([PermissionEnum::SCHOOL_REQUEST_UPDATE->value], ['edit', 'update']),
            self::createPermissionMiddleware($schoolRequestReadPermissions, ['index', 'show']),
            self::createPermissionMiddleware([PermissionEnum::SCHOOL_REQUEST_DELETE->value], ['destroy']),
        ];
    }

    public function index(Request $request) {
        $perPage = $request->get('perPage', 10);
        $data = SchoolRequestResource::collection($this->schoolRequestService->getAllPaginated($request->query(), $perPage));

        if ($this->ajax()) {
            return $data;
        }

        return inertia('SchoolRequest/Index');
    }

    public function create() {
        return inertia('SchoolRequest/Create');
    }

    public function store(StoreSchoolRequestRequest $request) {
        if ($this->ajax()) {
            return $this->schoolRequestService->create($request->validated());
        }
    }

    public function show(SchoolRequest $schoolRequest) {
        $data = SchoolRequestResource::make($schoolRequest->load('user', 'school'));

        if ($this->ajax()) {
            return $data;
        }

        return inertia('SchoolRequest/Show', compact('data'));
    }

    public function edit(SchoolRequest $schoolRequest) {
        abort(403);
        $data = SchoolRequestResource::make($schoolRequest->load('user', 'school'));

        return inertia('SchoolRequest/Edit', compact('data'));
    }

    public function update(UpdateSchoolRequestRequest $request, SchoolRequest $schoolRequest) {
        $intent = $request->get('intent');

        if ($this->ajax()) {
            switch ($intent) {
                case IntentEnum::SCHOOL_REQUEST_UPDATE_APPROVE_TEACHER->value:
                    return $this->schoolRequestService->approveTeacherRequest($schoolRequest);
                case IntentEnum::SCHOOL_REQUEST_UPDATE_REJECT_TEACHER->value:
                    return $this->schoolRequestService->rejectTeacherRequest($schoolRequest);
                case IntentEnum::SCHOOL_REQUEST_UPDATE_APPROVE_STUDENT->value:
                    return $this->schoolRequestService->approveStudentRequest($schoolRequest);
                case IntentEnum::SCHOOL_REQUEST_UPDATE_REJECT_STUDENT->value:
                    return $this->schoolRequestService->rejectStudentRequest($schoolRequest);
            }

            return $this->schoolRequestService->update($schoolRequest, $request->validated());
        }
    }

    public function destroy(SchoolRequest $schoolRequest) {
        if ($this->ajax()) {
            return $this->schoolRequestService->delete($schoolRequest);
        }
    }
}
