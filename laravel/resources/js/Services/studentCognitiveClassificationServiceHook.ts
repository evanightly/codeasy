import { createMutation, mutationApi } from '@/Helpers';
import { ROUTES } from '@/Support/Constants/routes';
import { TANSTACK_QUERY_KEYS } from '@/Support/Constants/tanstackQueryKeys';
import { IntentEnum } from '@/Support/Enums/intentEnum';
import { StudentCognitiveClassificationResource } from '@/Support/Interfaces/Resources';
import { serviceHooksFactory } from './serviceHooksFactory';

export const studentCognitiveClassificationServiceHook = {
    ...serviceHooksFactory<StudentCognitiveClassificationResource>({
        baseRoute: ROUTES.STUDENT_COGNITIVE_CLASSIFICATIONS,
        baseKey: TANSTACK_QUERY_KEYS.STUDENT_COGNITIVE_CLASSIFICATIONS,
    }),

    /**
     * Run cognitive classification process for a course
     */
    useRunClassification: () => {
        return createMutation({
            mutationFn: async (params: { course_id: number; classification_type?: string }) => {
                return mutationApi({
                    method: 'post',
                    url: route(`${ROUTES.STUDENT_COGNITIVE_CLASSIFICATIONS}.store`),
                    data: params,
                    params: {
                        intent: IntentEnum.STUDENT_COGNITIVE_CLASSIFICATION_STORE_RUN_CLASSIFICATION,
                    },
                });
            },
            invalidateQueryKeys: [
                { queryKey: [TANSTACK_QUERY_KEYS.STUDENT_COGNITIVE_CLASSIFICATIONS], exact: false },
            ],
        });
    },

    /**
     * Export cognitive classifications as Excel
     */
    useExportExcel: () => {
        return createMutation({
            mutationFn: async (params?: any) => {
                // Use window.open for direct download
                const url = route(`${ROUTES.STUDENT_COGNITIVE_CLASSIFICATIONS}.index`, {
                    ...params,
                    intent: IntentEnum.STUDENT_COGNITIVE_CLASSIFICATION_INDEX_EXPORT,
                });
                window.open(url, '_blank');
                return true;
            },
        });
    },

    /**
     * Export raw student data used for classifications as Excel
     */
    useExportRawDataExcel: () => {
        return createMutation({
            mutationFn: async (params: {
                course_id: number;
                export_format?: string;
                include_classification?: boolean;
            }) => {
                // Use window.open for direct download
                const url = route(`${ROUTES.STUDENT_COGNITIVE_CLASSIFICATIONS}.index`, {
                    ...params,
                    intent: IntentEnum.STUDENT_COGNITIVE_CLASSIFICATION_INDEX_EXPORT_RAW_DATA,
                });
                window.open(url, '_blank');
                return true;
            },
        });
    },
};
