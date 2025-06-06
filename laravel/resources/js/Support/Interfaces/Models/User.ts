import { Model } from '@/Support/Interfaces/Models/Model';

export interface User extends Model {
    name?: string;
    username?: string;
    email?: string;
    email_verified_at?: string | null;
    password?: string;
    remember_token?: string | null;
    image_url?: string | null;
    image_path?: string | null;
    profile_image?: string | null;
    profile_image_path?: string | null;
    preferences?: {
        locale?: string;
        [key: string]: any;
    } | null;
}
