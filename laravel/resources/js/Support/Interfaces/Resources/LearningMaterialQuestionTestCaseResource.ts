import { LearningMaterialQuestionTestCase } from '@/Support/Interfaces/Models';
import { Resource } from '@/Support/Interfaces/Resources';

export interface LearningMaterialQuestionTestCaseResource
    extends Resource,
        LearningMaterialQuestionTestCase {
    learning_material_question?: LearningMaterialQuestionTestCaseResource;
    expected_output_file_url?: string;
}
