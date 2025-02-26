import { Model } from '@/Support/Interfaces/Models/Model';

export interface Material extends Model {
    course_id: number;
    name: string;
    description: string;
    file: string;
    active: boolean;
}
