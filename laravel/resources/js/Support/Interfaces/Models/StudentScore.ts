import { Model } from '@/Support/Interfaces/Models/Model';

export interface StudentScore extends Model {
    user_id: number;
    learning_material_question_id: number;
    score: number;
    completion_status: string;
    trial_status: string;
}
