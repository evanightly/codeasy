import { Model } from '@/Support/Interfaces/Models/Model';

export interface User extends Model {
    name?: string;
    username?: string;
    email?: string;
    email_verified_at?: string | null;
    password?: string | null;
    password_confirmation?: string | null;
    remember_token?: string | null;
}
