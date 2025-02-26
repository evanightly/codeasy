import { ROUTES } from '@/Support/Constants/routes';
import { serviceHooksFactory } from '@/Services/serviceHooksFactory';
import { MaterialResource } from '@/Support/Interfaces/Resources';

export const materialServiceHook = {
    ...serviceHooksFactory<MaterialResource>({
        baseRoute: ROUTES.MATERIALS
    }),
    customFunctionExample: async () => {
        console.log('custom function');
    },
};
