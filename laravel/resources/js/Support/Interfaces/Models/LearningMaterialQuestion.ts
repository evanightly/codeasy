import { LearningMaterialType } from '@/Support/Enums/learningMaterialType';
import { Model } from '@/Support/Interfaces/Models/Model';

export interface LearningMaterialQuestion extends Model {
    learning_material_id: number;
    title: string;
    description: string;
    file?: string;
    type: LearningMaterialType;
    order_number: number;
    clue: string;
    active: boolean;
}
