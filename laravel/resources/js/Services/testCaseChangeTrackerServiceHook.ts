import { createMutation, mutationApi } from '@/Helpers';
import { serviceHooksFactory } from '@/Services/serviceHooksFactory';
import { ROUTES } from '@/Support/Constants/routes';
import { TANSTACK_QUERY_KEYS } from '@/Support/Constants/tanstackQueryKeys';
import { IntentEnum } from '@/Support/Enums/intentEnum';
import { TestCaseChangeTrackerResource } from '@/Support/Interfaces/Resources';

export const testCaseChangeTrackerServiceHook = {
    ...serviceHooksFactory<TestCaseChangeTrackerResource>({
        baseRoute: ROUTES.TEST_CASE_CHANGE_TRACKERS,
        baseKey: TANSTACK_QUERY_KEYS.TEST_CASE_CHANGE_TRACKERS,
    }),

    /**
     * Execute a pending re-execution now
     */
    useExecuteNow: () => {
        return createMutation({
            mutationFn: async (params: { id: number }) => {
                return mutationApi({
                    method: 'get',
                    url: route(`${ROUTES.TEST_CASE_CHANGE_TRACKERS}.show`, params.id),
                    params: {
                        intent: IntentEnum.TEST_CASE_CHANGE_TRACKER_SHOW_EXECUTE_NOW,
                    },
                });
            },
            invalidateQueryKeys: [
                { queryKey: [TANSTACK_QUERY_KEYS.TEST_CASE_CHANGE_TRACKERS], exact: false },
            ],
        });
    },
};
