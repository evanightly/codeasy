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
    coding_time: number;

    // Workspace locking fields
    is_workspace_locked: boolean;
    workspace_locked_at: string | null;
    workspace_unlock_at: string | null;
    can_reattempt: boolean;
}
