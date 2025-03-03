import { ROUTES } from '@/Support/Constants/routes';
import { serviceHooksFactory } from '@/Services/serviceHooksFactory';
import { LearningMaterialResource } from '@/Support/Interfaces/Resources';

export const learningMaterialServiceHook = {
    ...serviceHooksFactory<LearningMaterialResource>({
        baseRoute: ROUTES.LEARNING_MATERIALS
    }),
    customFunctionExample: async () => {
        console.log('custom function');
    },
};
