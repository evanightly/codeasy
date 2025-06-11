import { createMutation, mutationApi } from '@/Helpers';
import { serviceHooksFactory } from '@/Services/serviceHooksFactory';
import { ROUTES } from '@/Support/Constants/routes';
import { TANSTACK_QUERY_KEYS } from '@/Support/Constants/tanstackQueryKeys';
import { IntentEnum } from '@/Support/Enums/intentEnum';
import { LearningMaterialQuestionTestCaseResource } from '@/Support/Interfaces/Resources';

export const learningMaterialQuestionTestCaseServiceHook = {
    ...serviceHooksFactory<LearningMaterialQuestionTestCaseResource>({
        baseRoute: ROUTES.LEARNING_MATERIAL_QUESTION_TEST_CASES,
        baseKey: TANSTACK_QUERY_KEYS.LEARNING_MATERIAL_QUESTION_TEST_CASES,
    }),

    // Import functionality
    useImport: () => {
        return createMutation({
            mutationFn: async (params: {
                file: File;
                learning_material_question_id: number;
                course: number;
                learningMaterial: number;
                question: number;
            }) => {
                const formData = new FormData();
                formData.append('file', params.file);
                formData.append(
                    'learning_material_question_id',
                    params.learning_material_question_id.toString(),
                );

                return mutationApi({
                    method: 'post',
                    url: route('courses.learning-materials.questions.test-cases.store', {
                        course: params.course,
                        learningMaterial: params.learningMaterial,
                        question: params.question,
                    }),
                    data: formData,
                    params: {
                        intent: IntentEnum.LEARNING_MATERIAL_QUESTION_TEST_CASE_STORE_IMPORT,
                    },
                    requestConfig: {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    },
                });
            },
            invalidateQueryKeys: [
                {
                    queryKey: [TANSTACK_QUERY_KEYS.LEARNING_MATERIAL_QUESTION_TEST_CASES],
                    exact: false,
                },
            ],
        });
    },

    usePreviewImport: () => {
        return createMutation({
            mutationFn: async (params: {
                file: File;
                course: number;
                learningMaterial: number;
                question: number;
            }) => {
                const formData = new FormData();
                formData.append('file', params.file);

                return mutationApi({
                    method: 'post',
                    url: route('courses.learning-materials.questions.test-cases.store', {
                        course: params.course,
                        learningMaterial: params.learningMaterial,
                        question: params.question,
                    }),
                    data: formData,
                    params: {
                        intent: IntentEnum.LEARNING_MATERIAL_QUESTION_TEST_CASE_STORE_PREVIEW_IMPORT,
                    },
                    requestConfig: {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    },
                });
            },
        });
    },

    useDownloadTemplate: () => {
        return createMutation({
            mutationFn: async (params: {
                course: number;
                learningMaterial: number;
                question: number;
                format?: 'csv' | 'xlsx';
            }) => {
                const intent =
                    params.format === 'xlsx'
                        ? IntentEnum.LEARNING_MATERIAL_QUESTION_TEST_CASE_INDEX_IMPORT_CSV_TEMPLATE
                        : IntentEnum.LEARNING_MATERIAL_QUESTION_TEST_CASE_INDEX_IMPORT_TEMPLATE;

                const response = await fetch(
                    route('courses.learning-materials.questions.test-cases.index', {
                        course: params.course,
                        learningMaterial: params.learningMaterial,
                        question: params.question,
                        intent: intent,
                    }),
                );

                if (!response.ok) {
                    throw new Error('Failed to download template');
                }

                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `test_cases_template.${params.format || 'csv'}`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

                return { success: true };
            },
        });
    },
};
