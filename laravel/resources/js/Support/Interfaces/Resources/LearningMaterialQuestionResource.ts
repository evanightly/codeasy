import { LearningMaterialQuestion } from '@/Support/Interfaces/Models';
import { LearningMaterialQuestionTestCaseResource, LearningMaterialResource, Resource } from '@/Support/Interfaces/Resources';

export interface LearningMaterialQuestionResource extends Resource, LearningMaterialQuestion {
    learning_material?: LearningMaterialResource;
    learning_material_question_test_cases?: LearningMaterialQuestionTestCaseResource[];
    file_url?: string;
}
