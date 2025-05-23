<?php

namespace App\Http\Controllers;

use App\Http\Requests\ExecutionResult\StoreExecutionResultRequest;
use App\Http\Requests\ExecutionResult\UpdateExecutionResultRequest;
use App\Http\Resources\ExecutionResultResource;
use App\Models\ExecutionResult;
use App\Support\Enums\PermissionEnum;
use App\Support\Interfaces\Services\ExecutionResultServiceInterface;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;

class ExecutionResultController extends Controller implements HasMiddleware {
    public function __construct(protected ExecutionResultServiceInterface $executionResultService) {}

    public static function middleware(): array {
        return [
            self::createPermissionMiddleware([PermissionEnum::EXECUTION_RESULT_CREATE->value], ['create', 'store']),
            self::createPermissionMiddleware([PermissionEnum::EXECUTION_RESULT_UPDATE->value], ['edit', 'update']),
            self::createPermissionMiddleware([PermissionEnum::EXECUTION_RESULT_READ->value], ['index', 'show']),
            self::createPermissionMiddleware([PermissionEnum::EXECUTION_RESULT_DELETE->value], ['destroy']),
        ];
    }

    public function index(Request $request) {
        $data = ExecutionResultResource::collection($this->executionResultService->getAllPaginated($request->query()));

        if ($this->ajax()) {
            return $data;
        }

        return inertia('ExecutionResult/Index');
    }

    public function create() {
        return inertia('ExecutionResult/Create');
    }

    public function store(StoreExecutionResultRequest $request) {
        if ($this->ajax()) {
            return $this->executionResultService->create($request->validated());
        }
    }

    public function show(ExecutionResult $executionResult) {
        $data = ExecutionResultResource::make($executionResult);

        if ($this->ajax()) {
            return $data;
        }

        return inertia('ExecutionResult/Show', compact('data'));
    }

    public function edit(ExecutionResult $executionResult) {
        $data = ExecutionResultResource::make($executionResult);

        return inertia('ExecutionResult/Edit', compact('data'));
    }

    public function update(UpdateExecutionResultRequest $request, ExecutionResult $executionResult) {
        if ($this->ajax()) {
            return $this->executionResultService->update($executionResult, $request->validated());
        }
    }

    public function destroy(ExecutionResult $executionResult) {
        if ($this->ajax()) {
            return $this->executionResultService->delete($executionResult);
        }
    }
}
