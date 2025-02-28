import { Model } from '@/Support/Interfaces/Models/Model';

export interface Course extends Model {
    class_room_id: number;
    teacher_id: number;
    name: string;
    description: string;
    active: boolean;
}
