import { createMutation, mutationApi } from '@/Helpers';
import { serviceHooksFactory } from '@/Services/serviceHooksFactory';
import { ROUTES } from '@/Support/Constants/routes';
import { IntentEnum } from '@/Support/Enums/intentEnum';
import { UserResource } from '@/Support/Interfaces/Resources';

export const userServiceHook = {
    ...serviceHooksFactory<UserResource>({
        baseRoute: ROUTES.USERS,
    }),
    customFunctionExample: async () => {
        console.log('custom function');
    },
    useUpdatePreferences: () => {
        return createMutation({
            mutationFn: async (params: { id: number; preferences: { locale: string } }) => {
                return mutationApi({
                    method: 'put',
                    url: route(`${ROUTES.USERS}.update`, params.id),
                    data: params.preferences,
                    params: { intent: IntentEnum.USER_UPDATE_PREFERENCES },
                });
            },
            invalidateQueryKeys: [{ queryKey: ['users'], exact: false }],
        });
    },
    useImportStudents: () => {
        return createMutation({
            mutationFn: async (file: File) => {
                const formData = new FormData();
                formData.append('file', file);

                return mutationApi({
                    method: 'post',
                    url: route(`${ROUTES.USERS}.store`),
                    data: formData,
                    params: { intent: IntentEnum.USER_STORE_IMPORT_STUDENTS },
                    requestConfig: {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    },
                });
            },
            invalidateQueryKeys: [{ queryKey: ['users'], exact: false }],
        });
    },
    usePreviewImportStudents: () => {
        return createMutation({
            mutationFn: async (file: File) => {
                const formData = new FormData();
                formData.append('file', file);

                return mutationApi({
                    method: 'post',
                    url: route(`${ROUTES.USERS}.store`),
                    data: formData,
                    params: { intent: IntentEnum.USER_STORE_PREVIEW_IMPORT_STUDENTS },
                    requestConfig: {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    },
                });
            },
        });
    },
    useDownloadStudentImportTemplate: () => {
        return createMutation({
            mutationFn: async () => {
                const response = await fetch(
                    route(`${ROUTES.USERS}.index`, {
                        intent: IntentEnum.USER_INDEX_IMPORT_STUDENTS_TEMPLATE,
                    }),
                );
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `student_import_template_${new Date().toISOString().split('T')[0]}.xlsx`;
                a.click();
                window.URL.revokeObjectURL(url);
            },
        });
    },
    useDownloadStudentImportCsvTemplate: () => {
        return createMutation({
            mutationFn: async () => {
                const response = await fetch(
                    route(`${ROUTES.USERS}.index`, {
                        intent: IntentEnum.USER_INDEX_IMPORT_STUDENTS_CSV_TEMPLATE,
                    }),
                );
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `student_import_template_${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
                window.URL.revokeObjectURL(url);
            },
        });
    },
};
