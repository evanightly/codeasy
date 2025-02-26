<?php

namespace App\Http\Controllers;

use App\Http\Requests\School\StoreSchoolRequest;
use App\Http\Requests\School\UpdateSchoolRequest;
use App\Http\Resources\SchoolResource;
use App\Models\School;
use App\Support\Enums\IntentEnum;
use App\Support\Enums\PermissionEnum;
use App\Support\Interfaces\Services\SchoolServiceInterface;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\Middleware;

class SchoolController extends Controller {
    public function __construct(protected SchoolServiceInterface $schoolService) {}

    public static function middleware(): array {
        return [
            new Middleware('permission:' . PermissionEnum::SCHOOL_CREATE->value, only: ['create', 'store']),
            new Middleware('permission:' . PermissionEnum::SCHOOL_UPDATE->value, only: ['edit', 'update']),
            new Middleware('permission:' . PermissionEnum::SCHOOL_READ->value, only: ['index', 'show']),
            new Middleware('permission:' . PermissionEnum::SCHOOL_DELETE->value, only: ['destroy']),
        ];
    }

    public function index(Request $request) {
        $perPage = $request->get('perPage', 10);
        $data = SchoolResource::collection($this->schoolService->getAllPaginated($request->query(), $perPage));

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
