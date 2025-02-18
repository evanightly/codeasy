import { Permission } from '@/Support/Interfaces/Models';
import { Resource } from '@/Support/Interfaces/Resources';

export interface PermissionResource extends Resource, Permission {}
