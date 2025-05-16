import { Resource } from '@/Support/Interfaces/Resources';
import { StudentCourseCognitiveClassification } from '@/Support/Interfaces/Models';
import { CourseResource } from './CourseResource';
import { UserResource } from './UserResource';

export interface StudentCourseCognitiveClassificationResource extends Resource, StudentCourseCognitiveClassification {
    course?: CourseResource;
    user?: UserResource;
}
