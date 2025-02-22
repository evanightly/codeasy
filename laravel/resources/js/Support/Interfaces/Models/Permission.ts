import { Model } from '@/Support/Interfaces/Models/Model';

export interface Permission extends Model {
    name?: string;
    guard_name?: string;
    group?: string;
}
