import { serviceHooksFactory } from '@/Services/serviceHooksFactory';
import { ROUTES } from '@/Support/Constants/routes';
import { StudentCognitiveClassificationResource } from '@/Support/Interfaces/Resources';

export const studentCognitiveClassificationServiceHook = {
    ...serviceHooksFactory<StudentCognitiveClassificationResource>({
        baseRoute: ROUTES.STUDENT_COGNITIVE_CLASSIFICATIONS,
    }),
    customFunctionExample: async () => {
        console.log('custom function');
    },
};
