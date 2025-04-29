import { Resource } from '@/Support/Interfaces/Resources';
import { StudentCognitiveClassification } from '@/Support/Interfaces/Models';
import { UserResource } from './UserResource';
import { CourseResource } from './CourseResource';

export interface StudentCognitiveClassificationResource extends Resource, StudentCognitiveClassification {
    user?: UserResource;
    course?: CourseResource;
}
