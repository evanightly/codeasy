import { ROUTES } from '@/Support/Constants/routes';
import { TANSTACK_QUERY_KEYS } from '@/Support/Constants/tanstackQueryKeys';
import { useQuery } from '@tanstack/react-query';
import {
    CourseProgressData,
    DashboardProgressData,
    DetailedMaterialProgressData,
    StudentDetailedProgressData,
} from '../Support/Interfaces/Resources/DashboardResource';

export const dashboardServiceHook = {
    /**
     * Get dashboard data for the current user based on their role
     */
    useGetDashboardData: () => {
        return useQuery<DashboardProgressData>({
            queryKey: [TANSTACK_QUERY_KEYS.DASHBOARD],
            queryFn: async () => {
                const response = await window.axios.get(route(`${ROUTES.DASHBOARD}.index`));
                return response.data;
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
                const response = await window.axios.get(
                    route(`${ROUTES.DASHBOARD}.courses.progress`, { courseId }),
                );
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
                const response = await window.axios.get(
                    route(`${ROUTES.DASHBOARD}.materials.progress`, { materialId }),
                );
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
                const response = await window.axios.get(
                    route(`${ROUTES.DASHBOARD}.students.progress`, { userId }),
                );
                return response.data;
            },
            enabled: !!userId,
        });
    },
};
