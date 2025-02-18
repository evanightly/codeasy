import { ROUTES } from '@/Support/Constants/routes';
import { serviceHooksFactory } from '@/Services/serviceHooksFactory';
import { PermissionResource } from '@/Support/Interfaces/Resources';

export const permissionServiceHook = {
    ...serviceHooksFactory<PermissionResource>({
        baseRoute: ROUTES.PERMISSIONS
    }),
    customFunctionExample: async () => {
        console.log('custom function');
    },
};
