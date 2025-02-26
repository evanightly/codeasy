import { ROUTES } from '@/Support/Constants/routes';
import { serviceHooksFactory } from '@/Services/serviceHooksFactory';
import { CourseResource } from '@/Support/Interfaces/Resources';

export const courseServiceHook = {
    ...serviceHooksFactory<CourseResource>({
        baseRoute: ROUTES.COURSES
    }),
    customFunctionExample: async () => {
        console.log('custom function');
    },
};
