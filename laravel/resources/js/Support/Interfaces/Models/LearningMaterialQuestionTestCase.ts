import { Model } from '@/Support/Interfaces/Models/Model';

export interface LearningMaterialQuestionTestCase extends Model {
    learning_material_question_id?: number;
    input?: string;
    expected_output_file?: string;
    expected_output_file_extension?: string;
    description?: string;
    language?: string;
    order_number?: number;
    hidden?: boolean;
    active?: boolean;
    cognitive_levels?: string[]; // Array of cognitive levels (C1, C2, C3, C4, C5, C6)
}
