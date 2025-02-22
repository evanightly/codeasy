import { ROUTES } from '@/Support/Constants/routes';
import { serviceHooksFactory } from '@/Services/serviceHooksFactory';
import { SchoolResource } from '@/Support/Interfaces/Resources';

export const schoolServiceHook = {
    ...serviceHooksFactory<SchoolResource>({
        baseRoute: ROUTES.SCHOOLS
    }),
    customFunctionExample: async () => {
        console.log('custom function');
    },
};
