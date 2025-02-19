import { ROUTES } from '@/Support/Constants/routes';
import { serviceHooksFactory } from '@/Services/serviceHooksFactory';
import { RoleResource } from '@/Support/Interfaces/Resources';

export const roleServiceHook = {
    ...serviceHooksFactory<RoleResource>({
        baseRoute: ROUTES.ROLES
    }),
    customFunctionExample: async () => {
        console.log('custom function');
    },
};
