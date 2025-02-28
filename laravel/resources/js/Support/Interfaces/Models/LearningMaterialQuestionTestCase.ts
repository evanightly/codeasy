import { Model } from '@/Support/Interfaces/Models/Model';

export interface LearningMaterialQuestionTestCase extends Model {
    learning_material_question_id: number;
    input: string;
    expected_output: string;
    description: string;
    order_number: number;
    hidden: boolean;
    active: boolean;
}
