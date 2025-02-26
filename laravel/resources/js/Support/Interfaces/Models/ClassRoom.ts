import { Model } from '@/Support/Interfaces/Models/Model';

export interface ClassRoom extends Model {
    name?: string;
    description?: string;
    school_id?: number;
    grade?: number;
    year?: number;
    active?: boolean;
}
