import { Model } from './Model';

/**
 * TestCaseChangeTracker model interface
 */
export interface TestCaseChangeTracker extends Model {
    test_case_id: number;
    learning_material_question_id: number;
    learning_material_id: number;
    course_id: number;
    change_type: string;
    previous_data?: Record<string, any>;
    affected_student_ids: Record<string, any>;
    status: string;
    scheduled_at: string;
    completed_at?: string;
    execution_details?: Record<string, any>;
}
