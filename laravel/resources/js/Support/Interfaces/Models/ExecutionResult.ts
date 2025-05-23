import { Model } from '@/Support/Interfaces/Models/Model';

export interface ExecutionResult extends Model {
    student_score_id: number;
    code: string;
    compile_count: number;
    compile_status: string;
    output_image: string;
    variable_count: number;
    function_count: number;
    test_case_complete_count: number;
    test_case_total_count: number;
}
