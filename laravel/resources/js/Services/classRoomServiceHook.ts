import { createMutation, mutationApi } from '@/Helpers';
import { serviceHooksFactory } from '@/Services/serviceHooksFactory';
import { ROUTES } from '@/Support/Constants/routes';
import { TANSTACK_QUERY_KEYS } from '@/Support/Constants/tanstackQueryKeys';
import { IntentEnum } from '@/Support/Enums/intentEnum';
import { ClassRoomResource } from '@/Support/Interfaces/Resources';

const baseKey = TANSTACK_QUERY_KEYS.CLASS_ROOMS;

export const classRoomServiceHook = {
    ...serviceHooksFactory<ClassRoomResource>({
        baseRoute: ROUTES.CLASS_ROOMS,
        baseKey,
    }),
    useAssignStudent: () => {
        return createMutation({
            mutationFn: async (params: { id: number; data: { user_id: number } }) => {
                return mutationApi({
                    method: 'put',
                    url: route(`${ROUTES.CLASS_ROOMS}.update`, params.id),
                    data: params.data,
                    params: { intent: IntentEnum.CLASS_ROOM_UPDATE_ASSIGN_STUDENT },
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
                    url: route(`${ROUTES.CLASS_ROOMS}.update`, params.id),
                    data: params.data,
                    params: { intent: IntentEnum.CLASS_ROOM_UPDATE_UNASSIGN_STUDENT },
                });
            },
            invalidateQueryKeys: [{ queryKey: [baseKey], exact: false }],
        });
    },
};
