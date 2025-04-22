<?php

namespace App\Http\Controllers;

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
    public function index(Request $request): Response|array {
        $user = $request->user();
        $dashboardData = $this->dashboardService->getDashboardData($user);

        if ($this->ajax()) {
            return $dashboardData;
        }

        return Inertia::render('Dashboard/Index', [
            'dashboardData' => $dashboardData,
        ]);
    }

    /**
     * Get detailed progress data for a specific course.
     */
    public function getCourseProgress(Request $request, int $courseId): JsonResponse {
        $courseProgressData = $this->dashboardService->getDetailedCourseProgress($courseId);

        return response()->json($courseProgressData);
    }

    /**
     * Get detailed progress data for a specific material.
     */
    public function getMaterialProgress(Request $request, int $materialId): JsonResponse {
        $materialProgressData = $this->dashboardService->getDetailedMaterialProgress($materialId);

        return response()->json($materialProgressData);
    }

    /**
     * Get detailed progress data for a specific student.
     */
    public function getStudentProgress(Request $request, int $userId): JsonResponse {
        $studentProgressData = $this->dashboardService->getStudentDetailedProgress($userId);

        return response()->json($studentProgressData);
    }
}
