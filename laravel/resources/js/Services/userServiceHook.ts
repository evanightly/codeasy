import { serviceHooksFactory } from '@/Services/serviceHooksFactory';
import { ROUTES } from '@/Support/Constants/routes';
import { UserResource } from '@/Support/Interfaces/Resources';

export const userServiceHook = {
    ...serviceHooksFactory<UserResource>({
        baseRoute: ROUTES.USERS,
    }),
    customFunctionExample: async () => {
        console.log('custom function');
    },
};
