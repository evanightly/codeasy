import { SchoolRequestStatusEnum } from '@/Support/Enums/schoolRequestStatusEnum';
import { Model } from '@/Support/Interfaces/Models/Model';

export interface SchoolRequest extends Model {
    user_id?: number;
    school_id?: number;
    status?: SchoolRequestStatusEnum;
    message?: string;
}
