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

    /**
     * Export student scores tabular data to Excel
     */
    useExportTabularData: () => {
        return createMutation({
            mutationFn: async (filters?: { course_id?: number; learning_material_id?: number }) => {
                const url = route(`${ROUTES.STUDENT_SCORES}.index`);
                const params = {
                    intent: IntentEnum.STUDENT_SCORE_INDEX_EXPORT_TABULAR_DATA,
                    ...filters,
                };

                // Create a temporary link element to trigger download
                const link = document.createElement('a');
                link.href = `${url}?${new URLSearchParams(params as any).toString()}`;
                // Use localized filename (the backend will handle the actual filename with timestamp)
                link.download = `student_scores_export_${new Date().toISOString().slice(0, 10)}.xlsx`;

                // Trigger download
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                return { success: true, message: 'Export started successfully' };
            },
        });
    },

    /**
     * Get available classification history dates for a course
     */
    useGetClassificationHistoryDates: (courseId?: number, classificationType?: string) => {
        return useQuery({
            queryKey: [baseKey, 'classification-history-dates', courseId, classificationType],
            queryFn: async () => {
                if (!courseId || !classificationType) return [];

                const response = await fetch(
                    route(`${ROUTES.STUDENT_SCORES}.index`) +
                        `?intent=${IntentEnum.STUDENT_SCORE_INDEX_GET_CLASSIFICATION_HISTORY_DATES}&course_id=${courseId}&classification_type=${classificationType}`,
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch classification history dates');
                }

                return response.json();
            },
            enabled: !!courseId && !!classificationType,
        });
    },

    /**
     * Export enhanced student scores data to Excel with multiple sheets
     */
    useExportEnhancedData: () => {
        return createMutation({
            mutationFn: async (filters?: {
                course_id?: number;
                learning_material_id?: number;
                selected_student_ids?: number[];
                classification_type?: string;
                classification_date?: string;
            }) => {
                const url = route(`${ROUTES.STUDENT_SCORES}.index`);
                const params = {
                    intent: IntentEnum.STUDENT_SCORE_INDEX_EXPORT_ENHANCED_DATA,
                    ...filters,
                };

                // Create a temporary link element to trigger download
                const link = document.createElement('a');
                link.href = `${url}?${new URLSearchParams(params as any).toString()}`;
                // Use localized filename (the backend will handle the actual filename with timestamp)
                link.download = `completion_rate_report_${new Date().toISOString().slice(0, 10)}.xlsx`;

                // Trigger download
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                return { success: true, message: 'Enhanced export started successfully' };
            },
        });
    },

    customFunctionExample: async () => {
        console.log('custom function');
    },
};
