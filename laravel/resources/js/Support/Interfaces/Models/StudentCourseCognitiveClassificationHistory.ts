import { Model } from './Model';

/**
 * StudentCourseCognitiveClassificationHistory model interface
 */
export interface StudentCourseCognitiveClassificationHistory extends Model {
    course_id: number;
    user_id: number;
    student_course_cognitive_classification_id: number;
    classification_type: string;
    classification_level: string;
    classification_score: number;
    raw_data: Record<string, any>;
    classified_at: string;
}
