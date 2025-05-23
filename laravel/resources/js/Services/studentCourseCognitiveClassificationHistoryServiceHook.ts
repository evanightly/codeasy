import { serviceHooksFactory } from '@/Services/serviceHooksFactory';
import { ROUTES } from '@/Support/Constants/routes';
import { StudentCourseCognitiveClassificationHistoryResource } from '@/Support/Interfaces/Resources';

export const studentCourseCognitiveClassificationHistoryServiceHook = {
    ...serviceHooksFactory<StudentCourseCognitiveClassificationHistoryResource>({
        baseRoute: ROUTES.STUDENT_COURSE_COGNITIVE_CLASSIFICATION_HISTORYS,
    }),
    customFunctionExample: async () => {
        console.log('custom function');
    },
};
