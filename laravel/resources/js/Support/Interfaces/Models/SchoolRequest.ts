import { Model } from '@/Support/Interfaces/Models/Model';

export interface SchoolRequest extends Model {
    user_id?: number;
    school_id?: number;
    status?: string;
    message?: string;
}
