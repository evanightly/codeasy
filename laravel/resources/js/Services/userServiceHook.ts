import { ROUTES } from '@/Support/Constants/routes';
import { serviceHooksFactory } from '@/Services/serviceHooksFactory';
import { UserResource } from '@/Support/Interfaces/Resources';

export const userServiceHook = {
    ...serviceHooksFactory<UserResource>({
        baseRoute: ROUTES.USERS
    }),
    customFunctionExample: async () => {
        console.log('custom function');
    },
};
