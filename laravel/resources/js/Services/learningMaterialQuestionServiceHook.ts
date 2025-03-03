import { serviceHooksFactory } from '@/Services/serviceHooksFactory';
import { ROUTES } from '@/Support/Constants/routes';
import { LearningMaterialQuestionResource } from '@/Support/Interfaces/Resources';

export const learningMaterialQuestionServiceHook = {
    ...serviceHooksFactory<LearningMaterialQuestionResource>({
        baseRoute: ROUTES.LEARNING_MATERIAL_QUESTIONS,
    }),
    customFunctionExample: async () => {
        console.log('custom function');
    },
};
