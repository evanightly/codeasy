import { createMutation, mutationApi } from '@/Helpers';
import { serviceHooksFactory } from '@/Services/serviceHooksFactory';
import { ROUTES } from '@/Support/Constants/routes';
import { TANSTACK_QUERY_KEYS } from '@/Support/Constants/tanstackQueryKeys';
import { IntentEnum } from '@/Support/Enums/intentEnum';
import { StudentScoreResource } from '@/Support/Interfaces/Resources';
import { useQuery } from '@tanstack/react-query';

const baseKey = TANSTACK_QUERY_KEYS.STUDENT_SCORES;

export const studentScoreServiceHook = {
    ...serviceHooksFactory<StudentScoreResource>({
        baseRoute: ROUTES.STUDENT_SCORES,
        baseKey,
    }),

    /**
     * Reset student score for re-attempt (when workspace is unlocked)
     */
    useReattempt: () => {
        return createMutation({
            mutationFn: async (params: {
                user_id: number;
                learning_material_question_id: number;
            }) => {
                return mutationApi({
                    method: 'post',
                    url: route(`${ROUTES.STUDENT_SCORES}.store`),
                    data: params,
                    params: { intent: IntentEnum.STUDENT_SCORE_STORE_REATTEMPT },
                });
            },
            invalidateQueryKeys: [{ queryKey: [baseKey], exact: false }],
        });
    },

    /**
     * Unlock workspace for a student (teacher override)
     */
    useUnlockWorkspace: () => {
        return createMutation({
            mutationFn: async (params: { id: number }) => {
                return mutationApi({
                    method: 'put',
                    url: route(`${ROUTES.STUDENT_SCORES}.update`, params.id),
                    params: { intent: IntentEnum.STUDENT_SCORE_UPDATE_UNLOCK_WORKSPACE },
                });
            },
            invalidateQueryKeys: [{ queryKey: [baseKey], exact: false }],
        });
    },

    /**
     * Get locked students for a course/material
     */
    useGetLockedStudents: (filters?: {
        course_id?: number;
        learning_material_id?: number;
        user_id?: number;
    }) => {
        return useQuery({
            queryKey: [baseKey, 'locked-students', filters],
            queryFn: async () => {
                const response = await window.axios.get(route(`${ROUTES.STUDENT_SCORES}.index`), {
                    params: {
                        intent: IntentEnum.STUDENT_SCORE_INDEX_LOCKED_STUDENTS,
                        ...filters,
                    },
                });
                return response.data;
            },
            enabled: !!filters?.course_id,
        });
    },

    /**
     * Mark answer as done (completed)
     */
    useMarkAsDone: () => {
        return createMutation({
            mutationFn: async (params: { id: number }) => {
                return mutationApi({
                    method: 'put',
                    url: route(`${ROUTES.STUDENT_SCORES}.update`, params.id),
                    params: { intent: IntentEnum.STUDENT_SCORE_UPDATE_MARK_AS_DONE },
                });
            },
            invalidateQueryKeys: [{ queryKey: [baseKey], exact: false }],
        });
    },

    /**
     * Allow re-attempt by marking question as not completed
     */
    useAllowReAttempt: () => {
        return createMutation({
            mutationFn: async (params: { id: number }) => {
                return mutationApi({
                    method: 'put',
                    url: route(`${ROUTES.STUDENT_SCORES}.update`, params.id),
                    params: { intent: IntentEnum.STUDENT_SCORE_UPDATE_ALLOW_REATTEMPT },
                });
            },
            invalidateQueryKeys: [{ queryKey: [baseKey], exact: false }],
        });
    },

    /**
     * Allow re-attempt for all questions in a material
     */
    useAllowReAttemptAll: () => {
        return createMutation({
            mutationFn: async (params: { id: number; material_id: number }) => {
                return mutationApi({
                    method: 'put',
                    url: route(`${ROUTES.STUDENT_SCORES}.update`, params.id),
                    data: { material_id: params.material_id },
                    params: { intent: IntentEnum.STUDENT_SCORE_UPDATE_ALLOW_REATTEMPT_ALL },
                });
            },
            invalidateQueryKeys: [{ queryKey: [baseKey], exact: false }],
        });
    },

    customFunctionExample: async () => {
        console.log('custom function');
    },
};
