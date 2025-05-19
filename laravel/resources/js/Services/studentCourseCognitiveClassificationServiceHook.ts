import { createMutation, mutationApi } from '@/Helpers';
import { serviceHooksFactory } from '@/Services/serviceHooksFactory';
import { ROUTES } from '@/Support/Constants/routes';
import { TANSTACK_QUERY_KEYS } from '@/Support/Constants/tanstackQueryKeys';
import { IntentEnum } from '@/Support/Enums/intentEnum';
import { StudentCourseCognitiveClassificationResource } from '@/Support/Interfaces/Resources';
import { useQuery } from '@tanstack/react-query';

export const studentCourseCognitiveClassificationServiceHook = {
    ...serviceHooksFactory<StudentCourseCognitiveClassificationResource>({
        baseRoute: ROUTES.STUDENT_COURSE_COGNITIVE_CLASSIFICATIONS,
        baseKey: TANSTACK_QUERY_KEYS.STUDENT_COURSE_COGNITIVE_CLASSIFICATIONS,
    }),

    /**
     * Get course cognitive classification for a student
     */
    useGetCourseClassificationForStudent: (
        userId: number,
        courseId: number,
        classificationType: string = 'topsis',
    ) => {
        return useQuery<StudentCourseCognitiveClassificationResource>({
            queryKey: [
                TANSTACK_QUERY_KEYS.STUDENT_COURSE_COGNITIVE_CLASSIFICATIONS,
                'student',
                userId,
                courseId,
                classificationType,
            ],
            queryFn: async () => {
                const response = await window.axios.get(
                    route(`${ROUTES.STUDENT_COURSE_COGNITIVE_CLASSIFICATIONS}.index`),
                    {
                        params: {
                            intent: IntentEnum.STUDENT_COURSE_COGNITIVE_CLASSIFICATION_INDEX_GET_BY_USER_AND_COURSE,
                            user_id: userId,
                            course_id: courseId,
                            classification_type: classificationType,
                        },
                    },
                );
                return response.data;
            },
            enabled: !!userId && !!courseId,
        });
    },

    /**
     * Get cognitive report for a course
     */
    useGetCourseReport: (courseId: number, classificationType: string = 'topsis') => {
        return useQuery({
            queryKey: [
                TANSTACK_QUERY_KEYS.STUDENT_COURSE_COGNITIVE_CLASSIFICATIONS,
                'report',
                courseId,
                classificationType,
            ],
            queryFn: async () => {
                const response = await window.axios.get(
                    route(`${ROUTES.STUDENT_COURSE_COGNITIVE_CLASSIFICATIONS}.index`),
                    {
                        params: {
                            intent: IntentEnum.STUDENT_COURSE_COGNITIVE_CLASSIFICATION_INDEX_GET_COURSE_REPORT,
                            course_id: courseId,
                            classification_type: classificationType,
                        },
                    },
                );
                return response.data;
            },
            enabled: !!courseId,
        });
    },
};
