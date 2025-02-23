import { School } from '@/Support/Interfaces/Models';
import { Resource, UserResource } from '@/Support/Interfaces/Resources';

export interface SchoolResource extends Resource, School {
    administrators?: UserResource[];
    teachers?: UserResource[];
    students?: UserResource[];
}
