import { serviceHooksFactory } from '@/Services/serviceHooksFactory';
import { ROUTES } from '@/Support/Constants/routes';
import { StudentCourseCognitiveClassificationResource } from '@/Support/Interfaces/Resources';

export const studentCourseCognitiveClassificationServiceHook = {
    ...serviceHooksFactory<StudentCourseCognitiveClassificationResource>({
        baseRoute: ROUTES.STUDENT_COURSE_COGNITIVE_CLASSIFICATIONS,
    }),
    customFunctionExample: async () => {
        console.log('custom function');
    },
};
