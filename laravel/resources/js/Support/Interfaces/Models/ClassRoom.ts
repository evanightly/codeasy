import { Model } from '@/Support/Interfaces/Models/Model';

export interface ClassRoom extends Model {
    school_id: number;
    grade: number;
    year: number;
    active: boolean;
}
