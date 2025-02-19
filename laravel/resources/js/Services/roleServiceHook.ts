import { serviceHooksFactory } from '@/Services/serviceHooksFactory';
import { ROUTES } from '@/Support/Constants/routes';
import { RoleResource } from '@/Support/Interfaces/Resources';

export const roleServiceHook = {
    ...serviceHooksFactory<RoleResource>({
        baseRoute: ROUTES.ROLES,
    }),
    customFunctionExample: async () => {
        console.log('custom function');
    },
};
