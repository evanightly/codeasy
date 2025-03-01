import { Permission } from '@/Support/Interfaces/Models';
import { Resource, RoleResource } from '@/Support/Interfaces/Resources';

export interface PermissionResource extends Resource, Permission {
    users_count?: number;
    roles_count?: number;
    roles?: RoleResource[];
}
