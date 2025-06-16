<?php

namespace App\Http\Controllers;

use App\Support\Enums\IntentEnum;
use App\Support\Interfaces\Services\DashboardServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller {
    public function __construct(
        protected DashboardServiceInterface $dashboardService
    ) {}

    /**
     * Display the dashboard with student progress tracking.
     */
    public function index(Request $request): Response|JsonResponse {
        $user = $request->user();
        $intent = $request->get('intent');

        switch ($intent) {
            case IntentEnum::DASHBOARD_INDEX_GET_STUDENT_COURSE_PROGRESS->value:
                $courseId = $request->get('courseId');
                $data = $this->dashboardService->getDetailedCourseProgress($courseId);

                return response()->json($data);

            case IntentEnum::DASHBOARD_INDEX_GET_STUDENT_MATERIAL_PROGRESS->value:
                $materialId = $request->get('materialId');
                $data = $this->dashboardService->getDetailedMaterialProgress($materialId);

                return response()->json($data);

            case IntentEnum::DASHBOARD_INDEX_GET_STUDENT_PROGRESS->value:
                $userId = $request->get('userId');
                $data = $this->dashboardService->getStudentDetailedProgress($userId);

                return response()->json($data);

            case IntentEnum::DASHBOARD_INDEX_GET_STUDENT_LATEST_WORK->value:
                $data = $this->dashboardService->getStudentLatestWork($user->id);

                return response()->json($data);

            case IntentEnum::DASHBOARD_INDEX_GET_TEACHER_LATEST_PROGRESS->value:
                $data = $this->dashboardService->getTeacherLatestProgress($user->id);

                return response()->json($data);

            case IntentEnum::DASHBOARD_INDEX_GET_TEACHER_COURSES->value:
                $data = $this->dashboardService->getTeacherCourses($user->id);

                return response()->json($data);

            case IntentEnum::DASHBOARD_INDEX_GET_COURSE_LATEST_PROGRESS->value:
                $courseId = $request->get('courseId');
                $data = $this->dashboardService->getCourseLatestProgress($courseId);

                return response()->json($data);

            case IntentEnum::DASHBOARD_INDEX_GET_COURSE_STUDENTS_NO_PROGRESS->value:
                $courseId = $request->get('courseId');
                $data = $this->dashboardService->getCourseStudentsNoProgress($courseId);

                return response()->json($data);

            case IntentEnum::DASHBOARD_INDEX_GET_ACTIVE_USERS->value:
                $minutesThreshold = $request->get('minutesThreshold', 15);
                $data = $this->dashboardService->getActiveUsers($minutesThreshold);

                return response()->json($data);

            case IntentEnum::DASHBOARD_INDEX_GET_DATA->value:
            default:
                $dashboardData = $this->dashboardService->getDashboardData($user);

                if ($this->ajax()) {
                    return response()->json(data: ['dashboardData' => $dashboardData]);
                }

                return Inertia::render('Dashboard/Index', [
                    'dashboardData' => $dashboardData,
                ]);
        }
    }
}
