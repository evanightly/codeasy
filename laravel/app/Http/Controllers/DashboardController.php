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

            case IntentEnum::DASHBOARD_INDEX_GET_STUDENT_LEARNING_PROGRESS->value:
                $filters = [
                    'start_date' => $request->get('start_date'),
                    'end_date' => $request->get('end_date'),
                    'course_id' => $request->get('course_id'),
                ];
                $data = $this->dashboardService->getStudentLearningProgressData($user->id, array_filter($filters));

                return response()->json($data);

            case IntentEnum::DASHBOARD_INDEX_GET_STUDENT_COGNITIVE_LEVELS->value:
                $filters = [
                    'course_id' => $request->get('course_id'),
                    'start_date' => $request->get('start_date'),
                    'end_date' => $request->get('end_date'),
                ];
                $data = $this->dashboardService->getStudentCognitiveLevelsData($user->id, array_filter($filters));

                return response()->json($data);

            case IntentEnum::DASHBOARD_INDEX_GET_STUDENT_MODULE_PROGRESS->value:
                $filters = [
                    'course_id' => $request->get('course_id'),
                ];
                $data = $this->dashboardService->getStudentModuleProgressData($user->id, array_filter($filters));

                return response()->json($data);

            case IntentEnum::DASHBOARD_INDEX_GET_STUDENT_DAILY_ACTIVITY->value:
                $filters = [
                    'start_date' => $request->get('start_date'),
                    'end_date' => $request->get('end_date'),
                    'course_id' => $request->get('course_id'),
                ];
                $data = $this->dashboardService->getStudentDailyActivityData($user->id, array_filter($filters));

                return response()->json($data);

            case IntentEnum::DASHBOARD_INDEX_GET_STUDENT_WEEKLY_STREAK->value:
                $filters = [
                    'start_date' => $request->get('start_date'),
                    'end_date' => $request->get('end_date'),
                    'course_id' => $request->get('course_id'),
                ];
                $data = $this->dashboardService->getStudentWeeklyStreakData($user->id, array_filter($filters));

                return response()->json($data);

            case IntentEnum::DASHBOARD_INDEX_GET_STUDENT_SCORE_TRENDS->value:
                $filters = [
                    'start_date' => $request->get('start_date'),
                    'end_date' => $request->get('end_date'),
                    'course_id' => $request->get('course_id'),
                ];
                $data = $this->dashboardService->getStudentScoreTrendsData($user->id, array_filter($filters));

                return response()->json($data);

            case IntentEnum::DASHBOARD_INDEX_GET_STUDENT_TIME_ANALYSIS->value:
                $filters = [
                    'start_date' => $request->get('start_date'),
                    'end_date' => $request->get('end_date'),
                    'course_id' => $request->get('course_id'),
                ];
                $data = $this->dashboardService->getStudentTimeAnalysisData($user->id, array_filter($filters));

                return response()->json($data);

            case IntentEnum::DASHBOARD_INDEX_GET_STUDENT_DIFFICULTY_PROGRESS->value:
                $filters = [
                    'start_date' => $request->get('start_date'),
                    'end_date' => $request->get('end_date'),
                    'course_id' => $request->get('course_id'),
                ];
                $data = $this->dashboardService->getStudentDifficultyProgressData($user->id, array_filter($filters));

                return response()->json($data);

            case IntentEnum::DASHBOARD_INDEX_GET_STUDENT_COMPARISON_STATS->value:
                $filters = [
                    'course_id' => $request->get('course_id'),
                ];
                $data = $this->dashboardService->getStudentComparisonStatsData($user->id, array_filter($filters));

                return response()->json($data);

            case IntentEnum::DASHBOARD_INDEX_GET_STUDENT_ACHIEVEMENT_SUMMARY->value:
                $filters = [
                    'course_id' => $request->get('course_id'),
                ];
                $data = $this->dashboardService->getStudentAchievementSummaryData($user->id, array_filter($filters));

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
