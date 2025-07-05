import { createMutation, mutationApi } from '@/Helpers';
import { serviceHooksFactory } from '@/Services/serviceHooksFactory';
import { ROUTES } from '@/Support/Constants/routes';
import { TANSTACK_QUERY_KEYS } from '@/Support/Constants/tanstackQueryKeys';
import { IntentEnum } from '@/Support/Enums/intentEnum';
import { SchoolResource } from '@/Support/Interfaces/Resources';

const baseKey = TANSTACK_QUERY_KEYS.SCHOOLS;

export const schoolServiceHook = {
    ...serviceHooksFactory<SchoolResource>({
        baseRoute: ROUTES.SCHOOLS,
        baseKey,
    }),
    useAssignAdmin: () => {
        return createMutation({
            mutationFn: async (params: { id: number; data: { user_ids: number[] } }) => {
                return mutationApi({
                    method: 'put',
                    url: route(`${ROUTES.SCHOOLS}.update`, params.id),
                    data: params.data,
                    params: { intent: IntentEnum.SCHOOL_UPDATE_ASSIGN_BULK_ADMINS },
                });
            },
            invalidateQueryKeys: [{ queryKey: [baseKey], exact: false }],
        });
    },
    useUnassignAdmin: () => {
        return createMutation({
            mutationFn: async (params: { id: number; data: { user_id: number } }) => {
                return mutationApi({
                    method: 'put',
                    url: route(`${ROUTES.SCHOOLS}.update`, params.id),
                    data: params.data,
                    params: { intent: IntentEnum.SCHOOL_UPDATE_UNASSIGN_ADMIN },
                });
            },
            invalidateQueryKeys: [{ queryKey: [baseKey], exact: false }],
        });
    },
    useAssignStudent: () => {
        return createMutation({
            mutationFn: async (params: { id: number; data: { user_id: number } }) => {
                return mutationApi({
                    method: 'put',
                    url: route(`${ROUTES.SCHOOLS}.update`, params.id),
                    data: params.data,
                    params: { intent: IntentEnum.SCHOOL_UPDATE_ASSIGN_STUDENT },
                });
            },
            invalidateQueryKeys: [{ queryKey: [baseKey], exact: false }],
        });
    },
    useUnassignStudent: () => {
        return createMutation({
            mutationFn: async (params: { id: number; data: { user_id: number } }) => {
                return mutationApi({
                    method: 'put',
                    url: route(`${ROUTES.SCHOOLS}.update`, params.id),
                    data: params.data,
                    params: { intent: IntentEnum.SCHOOL_UPDATE_UNASSIGN_STUDENT },
                });
            },
            invalidateQueryKeys: [{ queryKey: [baseKey], exact: false }],
        });
    },
    useBulkAssignStudents: () => {
        return createMutation({
            mutationFn: async (params: { id: number; data: { user_ids: number[] } }) => {
                return mutationApi({
                    method: 'put',
                    url: route(`${ROUTES.SCHOOLS}.update`, params.id),
                    data: params.data,
                    params: { intent: IntentEnum.SCHOOL_UPDATE_BULK_ASSIGN_STUDENTS },
                });
            },
            invalidateQueryKeys: [{ queryKey: [baseKey], exact: false }],
        });
    },
    useBulkUnassignStudents: () => {
        return createMutation({
            mutationFn: async (params: { id: number; data: { user_ids: number[] } }) => {
                return mutationApi({
                    method: 'put',
                    url: route(`${ROUTES.SCHOOLS}.update`, params.id),
                    data: params.data,
                    params: { intent: IntentEnum.SCHOOL_UPDATE_BULK_UNASSIGN_STUDENTS },
                });
            },
            invalidateQueryKeys: [{ queryKey: [baseKey], exact: false }],
        });
    },
};
