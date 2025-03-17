import { ROUTES } from '@/Support/Constants/routes';
import { serviceHooksFactory } from '@/Services/serviceHooksFactory';
import { ExecutionResultResource } from '@/Support/Interfaces/Resources';

export const executionResultServiceHook = {
    ...serviceHooksFactory<ExecutionResultResource>({
        baseRoute: ROUTES.EXECUTION_RESULTS
    }),
    customFunctionExample: async () => {
        console.log('custom function');
    },
};
