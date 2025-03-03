import { Role } from '@/Support/Interfaces/Models';
import { PermissionResource, Resource, UserResource } from '@/Support/Interfaces/Resources';

export interface RoleResource extends Resource, Role {
    users_count?: number;
    deletable?: boolean;
    permissions?: PermissionResource[] | number[]; // number is the id of the permission for creating a new role
    users?: UserResource[];
}
