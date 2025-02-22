import { Model } from '@/Support/Interfaces/Models/Model';

export interface School extends Model {
    name?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    phone?: string;
    email?: string;
    website?: string;
    logo?: string;
    active?: boolean;
}
