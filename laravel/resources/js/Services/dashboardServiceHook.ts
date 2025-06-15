import { ROUTES } from '@/Support/Constants/routes';
import { TANSTACK_QUERY_KEYS } from '@/Support/Constants/tanstackQueryKeys';
import { IntentEnum } from '@/Support/Enums/intentEnum';
import { useQuery } from '@tanstack/react-query';
import {
    CourseData,
    CourseProgressData,
    CourseStudentsNoProgressData,
    DashboardProgressData,
    DetailedMaterialProgressData,
    StudentDetailedProgressData,
    StudentLatestWorkData,
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
};
