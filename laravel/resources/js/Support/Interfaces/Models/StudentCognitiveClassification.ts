import { Model } from './Model';

/**
 * StudentCognitiveClassification model interface
 */
export interface StudentCognitiveClassification extends Model {
    user_id: number;
    course_id: number;
    learning_material_id: number | null;
    classification_level: string;
    classification_score: number;
    classification_type: string;
    raw_data: Record<string, any>;
    classified_at: string;
    is_course_level: boolean;
}
