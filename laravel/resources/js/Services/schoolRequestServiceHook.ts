import { createMutation, mutationApi } from '@/Helpers';
import { serviceHooksFactory } from '@/Services/serviceHooksFactory';
import { ROUTES } from '@/Support/Constants/routes';
import { TANSTACK_QUERY_KEYS } from '@/Support/Constants/tanstackQueryKeys';
import { IntentEnum } from '@/Support/Enums/intentEnum';
import { RoleEnum } from '@/Support/Enums/roleEnum';
import { SchoolRequestResource } from '@/Support/Interfaces/Resources';

const baseKey = TANSTACK_QUERY_KEYS.SCHOOL_REQUESTS;

export const schoolRequestServiceHook = {
    ...serviceHooksFactory<SchoolRequestResource>({
        baseRoute: ROUTES.SCHOOL_REQUESTS,
        baseKey,
    }),
    useApproveTeacher: () => {
        return createMutation({
            mutationFn: async (params: { id: number }) => {
                return mutationApi({
                    method: 'put',
                    url: route(`${ROUTES.SCHOOL_REQUESTS}.update`, params.id),
                    params: { intent: IntentEnum.SCHOOL_REQUEST_UPDATE_APPROVE_TEACHER },
                });
            },
            invalidateQueryKeys: [{ queryKey: [baseKey], exact: false }],
        });
    },
    useRejectTeacher: () => {
        return createMutation({
            mutationFn: async (params: { id: number }) => {
                return mutationApi({
                    method: 'put',
                    url: route(`${ROUTES.SCHOOL_REQUESTS}.update`, params.id),
                    params: { intent: IntentEnum.SCHOOL_REQUEST_UPDATE_REJECT_TEACHER },
                });
            },
            invalidateQueryKeys: [{ queryKey: [baseKey], exact: false }],
        });
    },
    useApproveStudent: () => {
        return createMutation({
            mutationFn: async (params: { id: number }) => {
                return mutationApi({
                    method: 'put',
                    url: route(`${ROUTES.SCHOOL_REQUESTS}.update`, params.id),
                    params: { intent: IntentEnum.SCHOOL_REQUEST_UPDATE_APPROVE_STUDENT },
                });
            },
            invalidateQueryKeys: [{ queryKey: [baseKey], exact: false }],
        });
    },
    useRejectStudent: () => {
        return createMutation({
            mutationFn: async (params: { id: number }) => {
                return mutationApi({
                    method: 'put',
                    url: route(`${ROUTES.SCHOOL_REQUESTS}.update`, params.id),
                    params: { intent: IntentEnum.SCHOOL_REQUEST_UPDATE_REJECT_STUDENT },
                });
            },
            invalidateQueryKeys: [{ queryKey: [baseKey], exact: false }],
        });
    },
    // For backward compatibility
    useApprove: () => {
        return createMutation({
            mutationFn: async (params: { id: number; userRole?: string }) => {
                const intent =
                    params.userRole === RoleEnum.STUDENT
                        ? IntentEnum.SCHOOL_REQUEST_UPDATE_APPROVE_STUDENT
                        : IntentEnum.SCHOOL_REQUEST_UPDATE_APPROVE_TEACHER;

                return mutationApi({
                    method: 'put',
                    url: route(`${ROUTES.SCHOOL_REQUESTS}.update`, params.id),
                    params: { intent },
                });
            },
            invalidateQueryKeys: [{ queryKey: [baseKey], exact: false }],
        });
    },
    useReject: () => {
        return createMutation({
            mutationFn: async (params: { id: number; userRole?: string }) => {
                const intent =
                    params.userRole === RoleEnum.STUDENT
                        ? IntentEnum.SCHOOL_REQUEST_UPDATE_REJECT_STUDENT
                        : IntentEnum.SCHOOL_REQUEST_UPDATE_REJECT_TEACHER;

                return mutationApi({
                    method: 'put',
                    url: route(`${ROUTES.SCHOOL_REQUESTS}.update`, params.id),
                    params: { intent },
                });
            },
            invalidateQueryKeys: [{ queryKey: [baseKey], exact: false }],
        });
    },
};
