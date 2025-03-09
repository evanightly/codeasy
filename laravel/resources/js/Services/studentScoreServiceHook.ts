import { ROUTES } from '@/Support/Constants/routes';
import { serviceHooksFactory } from '@/Services/serviceHooksFactory';
import { StudentScoreResource } from '@/Support/Interfaces/Resources';

export const studentScoreServiceHook = {
    ...serviceHooksFactory<StudentScoreResource>({
        baseRoute: ROUTES.STUDENT_SCORES
    }),
    customFunctionExample: async () => {
        console.log('custom function');
    },
};
