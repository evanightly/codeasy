<?php

namespace App\Http\Controllers;

use App\Http\Requests\SchoolRequest\StoreSchoolRequestRequest;
use App\Http\Requests\SchoolRequest\UpdateSchoolRequestRequest;
use App\Http\Resources\SchoolRequestResource;
use App\Models\SchoolRequest;
use App\Support\Interfaces\Services\SchoolRequestServiceInterface;
use Illuminate\Http\Request;
use App\Support\Enums\PermissionEnum;
use Illuminate\Routing\Controllers\Middleware;

class SchoolRequestController extends Controller {
    public function __construct(protected SchoolRequestServiceInterface $schoolRequestService) {}

    public static function middleware(): array {
        return [
            new Middleware('permission:' . PermissionEnum::SCHOOL_REQUEST_CREATE->value, only: ['create', 'store']),
            new Middleware('permission:' . PermissionEnum::SCHOOL_REQUEST_UPDATE->value, only: ['edit', 'update']),
            new Middleware('permission:' . PermissionEnum::SCHOOL_REQUEST_READ->value, only: ['index', 'show']),
            new Middleware('permission:' . PermissionEnum::SCHOOL_REQUEST_DELETE->value, only: ['destroy']),
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
        $data = SchoolRequestResource::make($schoolRequest);

        if ($this->ajax()) {
            return $data;
        }

        return inertia('SchoolRequest/Show', compact('data'));
    }

    public function edit(SchoolRequest $schoolRequest) {
        $data = SchoolRequestResource::make($schoolRequest);

        return inertia('SchoolRequest/Edit', compact('data'));
    }

    public function update(UpdateSchoolRequestRequest $request, SchoolRequest $schoolRequest) {
        if ($this->ajax()) {
            return $this->schoolRequestService->update($schoolRequest, $request->validated());
        }
    }

    public function destroy(SchoolRequest $schoolRequest) {
        if ($this->ajax()) {
            return $this->schoolRequestService->delete($schoolRequest);
        }
    }
}
