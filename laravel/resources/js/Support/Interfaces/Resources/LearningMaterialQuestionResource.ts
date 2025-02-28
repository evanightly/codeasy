import { LearningMaterialQuestion } from '@/Support/Interfaces/Models';
import { LearningMaterialResource, Resource } from '@/Support/Interfaces/Resources';

export interface LearningMaterialQuestionResource extends Resource, LearningMaterialQuestion {
    learning_material?: LearningMaterialResource;
}
