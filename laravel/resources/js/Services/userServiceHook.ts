import { serviceHooksFactory } from '@/Services/serviceHooksFactory';
import { ROUTES } from '@/Support/Constants/routes';
import { UserResource } from '@/Support/Interfaces/Resources';
import { createMutation, mutationApi } from '@/Helpers';
import { IntentEnum } from '@/Support/Enums/intentEnum';

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
            invalidateQueryKeys: [
                { queryKey: ['users'], exact: false },
            ],
        });
    },
};
