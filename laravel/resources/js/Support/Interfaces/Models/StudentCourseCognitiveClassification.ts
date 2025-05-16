import { Model } from './Model';

/**
 * StudentCourseCognitiveClassification model interface
 */
export interface StudentCourseCognitiveClassification extends Model {
    course_id: number;
    user_id: string;
    classification_type: string;
    classification_level: string;
    classification_score: number;
    raw_data: Record<string, any>;
    classified_at: string;
}
