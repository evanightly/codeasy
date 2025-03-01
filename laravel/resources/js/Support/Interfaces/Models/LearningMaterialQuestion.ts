import { LearningMaterialTypeEnum } from '@/Support/Enums/learningMaterialTypeEnum';
import { Model } from '@/Support/Interfaces/Models/Model';

export interface LearningMaterialQuestion extends Model {
    learning_material_id?: number;
    title?: string;
    description?: string;
    file?: string;
    type?: LearningMaterialTypeEnum;
    order_number?: number;
    clue?: string;
    active?: boolean;
}
