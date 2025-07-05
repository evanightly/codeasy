import { User } from '@/Support/Interfaces/Models';
import {
    ClassRoomResource,
    Resource,
    RoleResource,
    SchoolResource,
} from '@/Support/Interfaces/Resources';

export interface UserResource extends Resource, User {
    roles?: RoleResource[];
    schools?: SchoolResource[];
    classrooms?: ClassRoomResource[];
    profile_image_url?: string;
}
