import { Model } from './Model';

/**
 * StudentCognitiveClassification model interface
 */
export interface StudentCognitiveClassification extends Model {
    user_id: number;
    course_id: number;
    classification_level: string;
    classification_score: number;
    raw_data: Record<string, any>;
    classified_at: string;
}
