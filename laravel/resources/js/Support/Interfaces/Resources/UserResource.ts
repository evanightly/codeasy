import { User } from '@/Support/Interfaces/Models';
import { Resource, RoleResource } from '@/Support/Interfaces/Resources';

export interface UserResource extends Resource, User {
    roles?: RoleResource[];
}
