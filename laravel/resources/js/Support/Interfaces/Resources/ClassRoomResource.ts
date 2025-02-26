import { ClassRoom } from '@/Support/Interfaces/Models';
import { Resource, SchoolResource, UserResource } from '@/Support/Interfaces/Resources';

export interface ClassRoomResource extends Resource, ClassRoom {
    school?: SchoolResource;
    students?: UserResource[];
}
