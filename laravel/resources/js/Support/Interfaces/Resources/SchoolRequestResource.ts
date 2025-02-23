import { SchoolRequest } from '@/Support/Interfaces/Models';
import { Resource, SchoolResource, UserResource } from '@/Support/Interfaces/Resources';

export interface SchoolRequestResource extends Resource, SchoolRequest {
    user?: UserResource;
    school?: SchoolResource;
}
