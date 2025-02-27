import { Model } from '@/Support/Interfaces/Models/Model';

export interface ClassRoom extends Model {
    name?: string | null;
    description?: string | null;
    school_id?: number | null;
    grade?: number | null;
    year?: number | null;
    active?: boolean | null;
}
