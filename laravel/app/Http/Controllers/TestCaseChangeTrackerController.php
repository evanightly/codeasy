<?php

namespace App\Http\Controllers;

use App\Http\Requests\TestCaseChangeTracker\StoreTestCaseChangeTrackerRequest;
use App\Http\Requests\TestCaseChangeTracker\UpdateTestCaseChangeTrackerRequest;
use App\Http\Resources\TestCaseChangeTrackerResource;
use App\Models\TestCaseChangeTracker;
use App\Support\Enums\PermissionEnum;
use App\Support\Interfaces\Services\TestCaseChangeTrackerServiceInterface;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;

class TestCaseChangeTrackerController extends Controller implements HasMiddleware {
    public function __construct(protected TestCaseChangeTrackerServiceInterface $testCaseChangeTrackerService) {}

    public static function middleware(): array {
        return [
            self::createPermissionMiddleware([PermissionEnum::TEST_CASE_CHANGE_TRACKER_CREATE->value], ['create', 'store']),
            self::createPermissionMiddleware([PermissionEnum::TEST_CASE_CHANGE_TRACKER_UPDATE->value], ['edit', 'update']),
            self::createPermissionMiddleware([PermissionEnum::TEST_CASE_CHANGE_TRACKER_READ->value], ['index', 'show']),
            self::createPermissionMiddleware([PermissionEnum::TEST_CASE_CHANGE_TRACKER_DELETE->value], ['destroy']),
        ];
    }

    public function index(Request $request) {
        $perPage = $request->get('perPage', 10);
        $data = TestCaseChangeTrackerResource::collection($this->testCaseChangeTrackerService->getAllPaginated($request->query(), $perPage));

        if ($this->ajax()) {
            return $data;
        }

        return inertia('TestCaseChangeTracker/Index');
    }

    public function create() {
        return inertia('TestCaseChangeTracker/Create');
    }

    public function store(StoreTestCaseChangeTrackerRequest $request) {
        if ($this->ajax()) {
            return $this->testCaseChangeTrackerService->create($request->validated());
        }
    }

    public function show(TestCaseChangeTracker $testCaseChangeTracker) {
        $data = TestCaseChangeTrackerResource::make($testCaseChangeTracker);

        if ($this->ajax()) {
            return $data;
        }

        return inertia('TestCaseChangeTracker/Show', compact('data'));
    }

    public function edit(TestCaseChangeTracker $testCaseChangeTracker) {
        $data = TestCaseChangeTrackerResource::make($testCaseChangeTracker);

        return inertia('TestCaseChangeTracker/Edit', compact('data'));
    }

    public function update(UpdateTestCaseChangeTrackerRequest $request, TestCaseChangeTracker $testCaseChangeTracker) {
        if ($this->ajax()) {
            return $this->testCaseChangeTrackerService->update($testCaseChangeTracker, $request->validated());
        }
    }

    public function destroy(TestCaseChangeTracker $testCaseChangeTracker) {
        if ($this->ajax()) {
            return $this->testCaseChangeTrackerService->delete($testCaseChangeTracker);
        }
    }
}
