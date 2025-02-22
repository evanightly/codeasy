import { ROUTES } from '@/Support/Constants/routes';
import { serviceHooksFactory } from '@/Services/serviceHooksFactory';
import { SchoolRequestResource } from '@/Support/Interfaces/Resources';

export const schoolRequestServiceHook = {
    ...serviceHooksFactory<SchoolRequestResource>({
        baseRoute: ROUTES.SCHOOL_REQUESTS
    }),
    customFunctionExample: async () => {
        console.log('custom function');
    },
};
