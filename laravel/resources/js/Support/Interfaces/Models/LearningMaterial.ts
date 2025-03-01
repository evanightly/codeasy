import { LearningMaterialTypeEnum } from '@/Support/Enums/learningMaterialTypeEnum';
import { Model } from '@/Support/Interfaces/Models/Model';

export interface LearningMaterial extends Model {
    course_id?: number;
    title?: string;
    description?: string;
    file?: string;
    file_extension?: string;
    type?: LearningMaterialTypeEnum;
    order_number?: number;
    active?: boolean;
}
