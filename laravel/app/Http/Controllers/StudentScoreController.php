<?php

namespace App\Http\Controllers;

use App\Http\Requests\StudentScore\StoreStudentScoreRequest;
use App\Http\Requests\StudentScore\UpdateStudentScoreRequest;
use App\Http\Resources\StudentScoreResource;
use App\Models\StudentScore;
use App\Support\Enums\IntentEnum;
use App\Support\Enums\PermissionEnum;
use App\Support\Interfaces\Services\StudentScoreServiceInterface;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Support\Facades\Log;

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
        $intent = $request->get('intent');

        if ($intent === IntentEnum::STUDENT_SCORE_INDEX_LOCKED_STUDENTS->value) {
            Log::info('Calling getLockedStudents method');
            $data = $this->studentScoreService->getLockedStudents($request->query());

            if ($this->ajax()) {
                return $data;
            }

            return inertia('StudentScore/LockedStudents', ['data' => $data]);
        }

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
        $intent = $request->get('intent');

        if ($intent === IntentEnum::STUDENT_SCORE_STORE_REATTEMPT->value) {
            $userId = $request->validated()['user_id'];
            $questionId = $request->validated()['learning_material_question_id'];

            try {
                $result = $this->studentScoreService->resetForReattempt($userId, $questionId);

                if ($this->ajax()) {
                    return ['success' => $result, 'message' => 'Score reset for re-attempt'];
                }
            } catch (\Exception $e) {
                if ($this->ajax()) {
                    return response()->json(['error' => $e->getMessage()], 400);
                }
            }
        }

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
        $intent = $request->get('intent');

        switch ($intent) {
            case IntentEnum::STUDENT_SCORE_UPDATE_UNLOCK_WORKSPACE->value:
                $userId = $studentScore->user_id;
                $materialId = $studentScore->learning_material_question->learning_material_id;

                try {
                    $result = $this->studentScoreService->unlockWorkspaceForMaterial($userId, $materialId);

                    if ($this->ajax()) {
                        return ['success' => $result, 'message' => 'Workspace unlocked successfully'];
                    }
                } catch (\Exception $e) {
                    if ($this->ajax()) {
                        return response()->json(['error' => $e->getMessage()], 400);
                    }
                }
                break;

            case IntentEnum::STUDENT_SCORE_UPDATE_MARK_AS_DONE->value:
                $userId = $studentScore->user_id;
                $questionId = $studentScore->learning_material_question_id;

                try {
                    $result = $this->studentScoreService->markAsDone($userId, $questionId);

                    if ($this->ajax()) {
                        return ['success' => $result, 'message' => 'Answer marked as done successfully'];
                    }
                } catch (\Exception $e) {
                    if ($this->ajax()) {
                        return response()->json(['error' => $e->getMessage()], 400);
                    }
                }
                break;

            case IntentEnum::STUDENT_SCORE_UPDATE_ALLOW_REATTEMPT->value:
                $userId = $studentScore->user_id;
                $questionId = $studentScore->learning_material_question_id;

                try {
                    $result = $this->studentScoreService->allowReAttempt($userId, $questionId);

                    if ($this->ajax()) {
                        return ['success' => $result, 'message' => 'Re-attempt allowed successfully'];
                    }
                } catch (\Exception $e) {
                    if ($this->ajax()) {
                        return response()->json(['error' => $e->getMessage()], 400);
                    }
                }
                break;
        }

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
