<?php

namespace App\Support\Interfaces\Services;

use App\Models\User;

interface DashboardServiceInterface {
    /**
     * Get dashboard data specific to the user's role.
     */
    public function getDashboardData(User $user): array;

    /**
     * Get teacher's student progress tracking data.
     */
    public function getTeacherStudentProgress(User $teacher): array;

    /**
     * Get detailed progress for a specific course.
     */
    public function getDetailedCourseProgress(int $courseId): array;

    /**
     * Get detailed progress for a specific material.
     */
    public function getDetailedMaterialProgress(int $materialId): array;

    /**
     * Get detailed progress for a specific student.
     */
    public function getStudentDetailedProgress(int $userId): array;

    /**
     * Get the latest work data for a specific student.
     */
    public function getStudentLatestWork(int $userId): array;
}
