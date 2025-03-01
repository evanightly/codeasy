import { createMutation, mutationApi } from '@/Helpers';
import { serviceHooksFactory } from '@/Services/serviceHooksFactory';
import { ROUTES } from '@/Support/Constants/routes';
import { TANSTACK_QUERY_KEYS } from '@/Support/Constants/tanstackQueryKeys';
import { CourseResource } from '@/Support/Interfaces/Resources';

const baseKey = TANSTACK_QUERY_KEYS.COURSES;

export const courseServiceHook = {
    ...serviceHooksFactory<CourseResource>({
        baseRoute: ROUTES.COURSES,
        baseKey,
    }),
    useAssignTeacher: () => {
        return createMutation({
            mutationFn: async (params: { id: number; data: { teacher_id: number } }) => {
                return mutationApi({
                    method: 'put',
                    url: route(`${ROUTES.COURSES}.update`, params.id),
                    data: params.data,
                });
            },
            invalidateQueryKeys: [{ queryKey: [baseKey], exact: false }],
        });
    },
};
