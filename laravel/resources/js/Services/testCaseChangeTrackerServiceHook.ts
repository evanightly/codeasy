import { serviceHooksFactory } from '@/Services/serviceHooksFactory';
import { ROUTES } from '@/Support/Constants/routes';
import { TestCaseChangeTrackerResource } from '@/Support/Interfaces/Resources';

export const testCaseChangeTrackerServiceHook = {
    ...serviceHooksFactory<TestCaseChangeTrackerResource>({
        baseRoute: ROUTES.TEST_CASE_CHANGE_TRACKERS,
    }),
    customFunctionExample: async () => {
        console.log('custom function');
    },
};
