import { ROUTES } from '@/Support/Constants/routes';
import { TANSTACK_QUERY_KEYS } from '@/Support/Constants/tanstackQueryKeys';
import { IntentEnum } from '@/Support/Enums/intentEnum';
import { useQuery } from '@tanstack/react-query';
import {
    ActiveUsersData,
    ChartFilters,
    CourseData,
    CourseProgressData,
    CourseStudentsNoProgressData,
    DashboardProgressData,
    DetailedMaterialProgressData,
    StudentAchievementSummaryData,
    StudentCognitiveLevelData,
    StudentComparisonStatsData,
    StudentDailyActivityData,
    StudentDetailedProgressData,
    StudentDifficultyProgressData,
    StudentLatestWorkData,
    StudentLearningProgressData,
    StudentModuleProgressData,
    StudentScoreTrendData,
    StudentTimeAnalysisData,
    StudentWeeklyStreakData,
    TeacherLatestProgressData,
} from '../Support/Interfaces/Resources/DashboardResource';

export const dashboardServiceHook = {
    /**
     * Get dashboard data for the current user based on their role
     */
    useGetDashboardData: () => {
        return useQuery<DashboardProgressData>({
            queryKey: [TANSTACK_QUERY_KEYS.DASHBOARD],
            queryFn: async () => {
                const response = await window.axios.get(route(`${ROUTES.DASHBOARD}.index`), {
                    params: {
                        intent: IntentEnum.DASHBOARD_INDEX_GET_DATA,
                    },
                });
                return response.data.dashboardData;
            },
        });
    },

    /**
     * Get detailed progress data for a specific course
     */
    useGetCourseProgress: (courseId: number) => {
        return useQuery<CourseProgressData>({
            queryKey: [TANSTACK_QUERY_KEYS.DASHBOARD, 'course', courseId],
            queryFn: async () => {
                const response = await window.axios.get(route(`${ROUTES.DASHBOARD}.index`), {
                    params: {
                        intent: IntentEnum.DASHBOARD_INDEX_GET_STUDENT_COURSE_PROGRESS,
                        courseId,
                    },
                });
                return response.data;
            },
            enabled: !!courseId,
        });
    },

    /**
     * Get detailed progress data for a specific learning material
     */
    useGetMaterialProgress: (materialId: number) => {
        return useQuery<DetailedMaterialProgressData>({
            queryKey: [TANSTACK_QUERY_KEYS.DASHBOARD, 'material', materialId],
            queryFn: async () => {
                const response = await window.axios.get(route(`${ROUTES.DASHBOARD}.index`), {
                    params: {
                        intent: IntentEnum.DASHBOARD_INDEX_GET_STUDENT_MATERIAL_PROGRESS,
                        materialId,
                    },
                });
                return response.data;
            },
            enabled: !!materialId,
        });
    },

    /**
     * Get detailed progress data for a specific student
     */
    useGetStudentProgress: (userId: number) => {
        return useQuery<StudentDetailedProgressData>({
            queryKey: [TANSTACK_QUERY_KEYS.DASHBOARD, 'student', userId],
            queryFn: async () => {
                const response = await window.axios.get(route(`${ROUTES.DASHBOARD}.index`), {
                    params: {
                        intent: IntentEnum.DASHBOARD_INDEX_GET_STUDENT_PROGRESS,
                        userId,
                    },
                });
                return response.data;
            },
            enabled: !!userId,
        });
    },

    /**
     * Get the latest work data for the current student
     */
    useGetStudentLatestWork: () => {
        return useQuery<StudentLatestWorkData>({
            queryKey: [TANSTACK_QUERY_KEYS.DASHBOARD, 'latest-work'],
            queryFn: async () => {
                const response = await window.axios.get(route(`${ROUTES.DASHBOARD}.index`), {
                    params: {
                        intent: IntentEnum.DASHBOARD_INDEX_GET_STUDENT_LATEST_WORK,
                    },
                });
                return response.data;
            },
        });
    },

    /**
     * Get the latest progress data for teacher's students
     */
    useGetTeacherLatestProgress: () => {
        return useQuery<TeacherLatestProgressData[]>({
            queryKey: [TANSTACK_QUERY_KEYS.DASHBOARD, 'teacher-latest-progress'],
            queryFn: async () => {
                const response = await window.axios.get(route(`${ROUTES.DASHBOARD}.index`), {
                    params: {
                        intent: IntentEnum.DASHBOARD_INDEX_GET_TEACHER_LATEST_PROGRESS,
                    },
                });
                return response.data;
            },
        });
    },

    /**
     * Get all courses taught by the current teacher
     */
    useGetTeacherCourses: () => {
        return useQuery<CourseData[]>({
            queryKey: [TANSTACK_QUERY_KEYS.DASHBOARD, 'teacher-courses'],
            queryFn: async () => {
                const response = await window.axios.get(route(`${ROUTES.DASHBOARD}.index`), {
                    params: {
                        intent: IntentEnum.DASHBOARD_INDEX_GET_TEACHER_COURSES,
                    },
                });
                return response.data;
            },
        });
    },

    /**
     * Get the latest progress data for a specific course
     */
    useGetCourseLatestProgress: (courseId: number) => {
        return useQuery<TeacherLatestProgressData[]>({
            queryKey: [TANSTACK_QUERY_KEYS.DASHBOARD, 'course-latest-progress', courseId],
            queryFn: async () => {
                const response = await window.axios.get(route(`${ROUTES.DASHBOARD}.index`), {
                    params: {
                        intent: IntentEnum.DASHBOARD_INDEX_GET_COURSE_LATEST_PROGRESS,
                        courseId,
                    },
                });
                return response.data;
            },
            enabled: !!courseId,
        });
    },

    /**
     * Get students with no progress for a specific course
     */
    useGetCourseStudentsNoProgress: (courseId: number) => {
        return useQuery<CourseStudentsNoProgressData>({
            queryKey: [TANSTACK_QUERY_KEYS.DASHBOARD, 'course-students-no-progress', courseId],
            queryFn: async () => {
                const response = await window.axios.get(route(`${ROUTES.DASHBOARD}.index`), {
                    params: {
                        intent: IntentEnum.DASHBOARD_INDEX_GET_COURSE_STUDENTS_NO_PROGRESS,
                        courseId,
                    },
                });
                return response.data;
            },
            enabled: !!courseId,
        });
    },

    /**
     * Get currently active users grouped by roles
     */
    useGetActiveUsers: (minutesThreshold: number = 15) => {
        return useQuery<ActiveUsersData>({
            queryKey: [TANSTACK_QUERY_KEYS.DASHBOARD, 'active-users', minutesThreshold],
            queryFn: async () => {
                const response = await window.axios.get(route(`${ROUTES.DASHBOARD}.index`), {
                    params: {
                        intent: IntentEnum.DASHBOARD_INDEX_GET_ACTIVE_USERS,
                        minutesThreshold,
                    },
                });
                return response.data;
            },
            // Refetch every 30 seconds to keep the data current
            refetchInterval: 30000,
        });
    },

    /**
     * Get student learning progress chart data with filtering
     */
    useGetStudentLearningProgress: (filters: ChartFilters = {}) => {
        return useQuery<StudentLearningProgressData[]>({
            queryKey: [TANSTACK_QUERY_KEYS.DASHBOARD, 'student-learning-progress', filters],
            queryFn: async () => {
                const response = await window.axios.get(route(`${ROUTES.DASHBOARD}.index`), {
                    params: {
                        intent: IntentEnum.DASHBOARD_INDEX_GET_STUDENT_LEARNING_PROGRESS,
                        ...filters,
                    },
                });
                return response.data;
            },
        });
    },

    /**
     * Get student cognitive levels distribution chart data
     */
    useGetStudentCognitiveLevels: (filters: ChartFilters = {}) => {
        return useQuery<StudentCognitiveLevelData[]>({
            queryKey: [TANSTACK_QUERY_KEYS.DASHBOARD, 'student-cognitive-levels', filters],
            queryFn: async () => {
                const response = await window.axios.get(route(`${ROUTES.DASHBOARD}.index`), {
                    params: {
                        intent: IntentEnum.DASHBOARD_INDEX_GET_STUDENT_COGNITIVE_LEVELS,
                        ...filters,
                    },
                });
                return response.data;
            },
        });
    },

    /**
     * Get student module progress chart data
     */
    useGetStudentModuleProgress: (filters: ChartFilters = {}) => {
        return useQuery<StudentModuleProgressData[]>({
            queryKey: [TANSTACK_QUERY_KEYS.DASHBOARD, 'student-module-progress', filters],
            queryFn: async () => {
                const response = await window.axios.get(route(`${ROUTES.DASHBOARD}.index`), {
                    params: {
                        intent: IntentEnum.DASHBOARD_INDEX_GET_STUDENT_MODULE_PROGRESS,
                        ...filters,
                    },
                });
                return response.data;
            },
        });
    },

    /**
     * Get student daily activity data showing coding sessions and time spent
     */
    useGetStudentDailyActivity: (filters: ChartFilters = {}) => {
        return useQuery<StudentDailyActivityData[]>({
            queryKey: [TANSTACK_QUERY_KEYS.DASHBOARD, 'student-daily-activity', filters],
            queryFn: async () => {
                const response = await window.axios.get(route(`${ROUTES.DASHBOARD}.index`), {
                    params: {
                        intent: IntentEnum.DASHBOARD_INDEX_GET_STUDENT_DAILY_ACTIVITY,
                        ...filters,
                    },
                });
                return response.data;
            },
        });
    },

    /**
     * Get student weekly streak data showing consecutive learning days
     */
    useGetStudentWeeklyStreak: (filters: ChartFilters = {}) => {
        return useQuery<StudentWeeklyStreakData>({
            queryKey: [TANSTACK_QUERY_KEYS.DASHBOARD, 'student-weekly-streak', filters],
            queryFn: async () => {
                const response = await window.axios.get(route(`${ROUTES.DASHBOARD}.index`), {
                    params: {
                        intent: IntentEnum.DASHBOARD_INDEX_GET_STUDENT_WEEKLY_STREAK,
                        ...filters,
                    },
                });
                return response.data;
            },
        });
    },

    /**
     * Get student score trends over time for performance analysis
     */
    useGetStudentScoreTrends: (filters: ChartFilters = {}) => {
        return useQuery<StudentScoreTrendData[]>({
            queryKey: [TANSTACK_QUERY_KEYS.DASHBOARD, 'student-score-trends', filters],
            queryFn: async () => {
                const response = await window.axios.get(route(`${ROUTES.DASHBOARD}.index`), {
                    params: {
                        intent: IntentEnum.DASHBOARD_INDEX_GET_STUDENT_SCORE_TRENDS,
                        ...filters,
                    },
                });
                return response.data;
            },
        });
    },

    /**
     * Get student time analysis data showing coding efficiency and patterns
     */
    useGetStudentTimeAnalysis: (filters: ChartFilters = {}) => {
        return useQuery<StudentTimeAnalysisData>({
            queryKey: [TANSTACK_QUERY_KEYS.DASHBOARD, 'student-time-analysis', filters],
            queryFn: async () => {
                const response = await window.axios.get(route(`${ROUTES.DASHBOARD}.index`), {
                    params: {
                        intent: IntentEnum.DASHBOARD_INDEX_GET_STUDENT_TIME_ANALYSIS,
                        ...filters,
                    },
                });
                return response.data;
            },
        });
    },

    /**
     * Get student difficulty progression showing improvement across complexity levels
     */
    useGetStudentDifficultyProgress: (filters: ChartFilters = {}) => {
        return useQuery<StudentDifficultyProgressData[]>({
            queryKey: [TANSTACK_QUERY_KEYS.DASHBOARD, 'student-difficulty-progress', filters],
            queryFn: async () => {
                const response = await window.axios.get(route(`${ROUTES.DASHBOARD}.index`), {
                    params: {
                        intent: IntentEnum.DASHBOARD_INDEX_GET_STUDENT_DIFFICULTY_PROGRESS,
                        ...filters,
                    },
                });
                return response.data;
            },
        });
    },

    /**
     * Get student comparison stats relative to class average
     * Note: Requires course_id in filters to compare with classmates
     */
    useGetStudentComparisonStats: (filters: ChartFilters = {}) => {
        return useQuery<StudentComparisonStatsData>({
            queryKey: [TANSTACK_QUERY_KEYS.DASHBOARD, 'student-comparison-stats', filters],
            queryFn: async () => {
                const response = await window.axios.get(route(`${ROUTES.DASHBOARD}.index`), {
                    params: {
                        intent: IntentEnum.DASHBOARD_INDEX_GET_STUDENT_COMPARISON_STATS,
                        ...filters,
                    },
                });
                console.log(response);

                return response.data;
            },
            // Only run the query if course_id is provided
            enabled: !!filters.course_id,
        });
    },

    /**
     * Get student achievement summary including badges, milestones, and accomplishments
     * Note: Works with or without course_id filter - shows all achievements or course-specific ones
     */
    useGetStudentAchievementSummary: (filters: ChartFilters = {}) => {
        return useQuery<StudentAchievementSummaryData>({
            queryKey: [TANSTACK_QUERY_KEYS.DASHBOARD, 'student-achievement-summary', filters],
            queryFn: async () => {
                const response = await window.axios.get(route(`${ROUTES.DASHBOARD}.index`), {
                    params: {
                        intent: IntentEnum.DASHBOARD_INDEX_GET_STUDENT_ACHIEVEMENT_SUMMARY,
                        ...filters,
                    },
                });
                return response.data;
            },
        });
    },
};
