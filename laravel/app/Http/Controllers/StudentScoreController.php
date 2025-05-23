<?php

namespace App\Http\Controllers;

use App\Http\Requests\StudentScore\StoreStudentScoreRequest;
use App\Http\Requests\StudentScore\UpdateStudentScoreRequest;
use App\Http\Resources\StudentScoreResource;
use App\Models\StudentScore;
use App\Support\Enums\PermissionEnum;
use App\Support\Interfaces\Services\StudentScoreServiceInterface;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;

class StudentScoreController extends Controller implements HasMiddleware {
    public function __construct(protected StudentScoreServiceInterface $studentScoreService) {}

    public static function middleware(): array {
        return [
            self::createPermissionMiddleware([PermissionEnum::STUDENT_SCORE_CREATE->value], ['create', 'store']),
            self::createPermissionMiddleware([PermissionEnum::STUDENT_SCORE_UPDATE->value], ['edit', 'update']),
            self::createPermissionMiddleware([PermissionEnum::STUDENT_SCORE_READ->value], ['index', 'show']),
            self::createPermissionMiddleware([PermissionEnum::STUDENT_SCORE_DELETE->value], ['destroy']),
        ];
    }

    public function index(Request $request) {
        $data = StudentScoreResource::collection($this->studentScoreService->getAllPaginated($request->query()));

        if ($this->ajax()) {
            return $data;
        }

        return inertia('StudentScore/Index');
    }

    public function create() {
        return inertia('StudentScore/Create');
    }

    public function store(StoreStudentScoreRequest $request) {
        if ($this->ajax()) {
            return $this->studentScoreService->create($request->validated());
        }
    }

    public function show(StudentScore $studentScore) {
        $data = StudentScoreResource::make($studentScore);

        if ($this->ajax()) {
            return $data;
        }

        return inertia('StudentScore/Show', compact('data'));
    }

    public function edit(StudentScore $studentScore) {
        $data = StudentScoreResource::make($studentScore);

        return inertia('StudentScore/Edit', compact('data'));
    }

    public function update(UpdateStudentScoreRequest $request, StudentScore $studentScore) {
        if ($this->ajax()) {
            return $this->studentScoreService->update($studentScore, $request->validated());
        }
    }

    public function destroy(StudentScore $studentScore) {
        if ($this->ajax()) {
            return $this->studentScoreService->delete($studentScore);
        }
    }
}
