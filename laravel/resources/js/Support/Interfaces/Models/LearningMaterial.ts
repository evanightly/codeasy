import { FileTypeEnum } from '@/Support/Enums/fileTypeEnum';
import { LearningMaterialType } from '@/Support/Enums/learningMaterialType';
import { Model } from '@/Support/Interfaces/Models/Model';

export interface LearningMaterial extends Model {
    course_id: number;
    title: string;
    description: string;
    file?: string;
    file_type?: FileTypeEnum;
    type: LearningMaterialType;
    order_number: number;
    active: boolean;
}
