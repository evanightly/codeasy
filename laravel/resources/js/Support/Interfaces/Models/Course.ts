import { Model } from '@/Support/Interfaces/Models/Model';

export interface Course extends Model {
    classroom_id: number;
    name: string;
    description: string;
    active: boolean;
}
