import { createMutation, mutationApi } from '@/Helpers';
import { serviceHooksFactory } from '@/Services/serviceHooksFactory';
import { ROUTES } from '@/Support/Constants/routes';
import { TANSTACK_QUERY_KEYS } from '@/Support/Constants/tanstackQueryKeys';
import { IntentEnum } from '@/Support/Enums/intentEnum';
import { CourseResource } from '@/Support/Interfaces/Resources';

const baseKey = TANSTACK_QUERY_KEYS.COURSES;

export const courseServiceHook = {
    ...serviceHooksFactory<CourseResource>({
        baseRoute: ROUTES.COURSES,
        baseKey,
    }),
    useAssignTeacher: () => {
        return createMutation({
            mutationFn: async (params: { id: number; data: { teacher_id: number } }) => {
                return mutationApi({
                    method: 'put',
                    url: route(`${ROUTES.COURSES}.update`, params.id),
                    data: params.data,
                });
            },
            invalidateQueryKeys: [{ queryKey: [baseKey], exact: false }],
        });
    },
    downloadImportTemplate: () => {
        return createMutation({
            mutationFn: async () => {
                return mutationApi({
                    method: 'get',
                    url: route(`${ROUTES.COURSES}.index`),
                    params: {
                        intent: IntentEnum.COURSE_INDEX_IMPORT_TEMPLATE,
                    },
                    requestConfig: {
                        responseType: 'blob', // This is crucial for binary data
                    },
                });
            },
        });
    },
    importCourses: () => {
        return createMutation({
            mutationFn: async (formData: FormData) => {
                return mutationApi({
                    method: 'post',
                    url: route(`${ROUTES.COURSES}.store`),
                    params: {
                        intent: IntentEnum.COURSE_STORE_IMPORT,
                    },
                    data: formData,
                });
            },
            invalidateQueryKeys: [{ queryKey: [baseKey], exact: false }],
        });
    },
    previewImport: () => {
        return createMutation({
            mutationFn: async (formData: FormData) => {
                return mutationApi({
                    method: 'post',
                    url: route(`${ROUTES.COURSES}.store`),
                    params: {
                        intent: IntentEnum.COURSE_STORE_PREVIEW_IMPORT,
                    },
                    data: formData,
                });
            },
        });
    },
};
