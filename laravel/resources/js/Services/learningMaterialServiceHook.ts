import { serviceHooksFactory } from '@/Services/serviceHooksFactory';
import { ROUTES } from '@/Support/Constants/routes';
import { LearningMaterialResource } from '@/Support/Interfaces/Resources';

export const learningMaterialServiceHook = {
    ...serviceHooksFactory<LearningMaterialResource>({
        baseRoute: ROUTES.LEARNING_MATERIALS,
    }),
    customFunctionExample: async () => {
        console.log('custom function');
    },
};
