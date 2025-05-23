import { Model } from '@/Support/Interfaces/Models/Model';

export interface StudentScore extends Model {
    user_id: number;
    learning_material_question_id: number;
    score: number;
    completion_status: string;
    trial_status: string;
    compile_count: number;
    completed_execution_result_id: number;
    test_case_complete_count: number;
    test_case_total_count: number;
}
