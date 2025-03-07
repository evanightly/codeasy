import { serviceHooksFactory } from '@/Services/serviceHooksFactory';
import { ROUTES } from '@/Support/Constants/routes';
import { LearningMaterialQuestionTestCaseResource } from '@/Support/Interfaces/Resources';

export const learningMaterialQuestionTestCaseServiceHook = {
    ...serviceHooksFactory<LearningMaterialQuestionTestCaseResource>({
        baseRoute: ROUTES.LEARNING_MATERIAL_QUESTION_TEST_CASES,
    }),
    customFunctionExample: async () => {
        console.log('custom function');
    },
};
