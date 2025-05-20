import { StudentScore } from '@/Support/Interfaces/Models';
import {
    ExecutionResultResource,
    LearningMaterialQuestionResource,
    Resource,
    UserResource,
} from '@/Support/Interfaces/Resources';

export interface StudentScoreResource extends Resource, StudentScore {
    user?: UserResource;
    learning_material_question?: LearningMaterialQuestionResource;
    completed_execution_result?: ExecutionResultResource;
}
