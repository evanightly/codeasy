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

    /**
     * Get the latest progress/activity data for teacher's students.
     */
    public function getTeacherLatestProgress(int $teacherId): array;

    /**
     * Get all courses taught by a teacher.
     */
    public function getTeacherCourses(int $teacherId): array;

    /**
     * Get the latest progress/activity data for a specific course.
     */
    public function getCourseLatestProgress(int $courseId): array;

    /**
     * Get students with no progress for a specific course.
     */
    public function getCourseStudentsNoProgress(int $courseId): array;

    /**
     * Get currently active users grouped by roles.
     */
    public function getActiveUsers(int $minutesThreshold = 15): array;

    /**
     * Get student learning progress chart data with time filtering.
     */
    public function getStudentLearningProgressData(int $userId, array $filters = []): array;

    /**
     * Get student cognitive levels distribution data.
     */
    public function getStudentCognitiveLevelsData(int $userId, array $filters = []): array;

    /**
     * Get student module progress data.
     */
    public function getStudentModuleProgressData(int $userId, array $filters = []): array;

    /**
     * Get student daily activity data showing coding sessions and time spent.
     */
    public function getStudentDailyActivityData(int $userId, array $filters = []): array;

    /**
     * Get student weekly streak data showing consecutive learning days.
     */
    public function getStudentWeeklyStreakData(int $userId, array $filters = []): array;

    /**
     * Get student score trends over time for performance analysis.
     */
    public function getStudentScoreTrendsData(int $userId, array $filters = []): array;

    /**
     * Get student time analysis data showing coding efficiency and patterns.
     */
    public function getStudentTimeAnalysisData(int $userId, array $filters = []): array;

    /**
     * Get student difficulty progression showing improvement across complexity levels.
     */
    public function getStudentDifficultyProgressData(int $userId, array $filters = []): array;

    /**
     * Get student comparison stats relative to class average.
     */
    public function getStudentComparisonStatsData(int $userId, array $filters = []): array;

    /**
     * Get student achievement summary including badges, milestones, and accomplishments.
     */
    public function getStudentAchievementSummaryData(int $userId, array $filters = []): array;
}
