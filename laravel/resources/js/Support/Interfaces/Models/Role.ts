import { Model } from '@/Support/Interfaces/Models/Model';

export interface Role extends Model {
    name?: string;
    guard_name?: string;
}
