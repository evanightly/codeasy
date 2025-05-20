import { Resource } from '@/Support/Interfaces/Resources';
import { StudentCourseCognitiveClassificationHistory } from '@/Support/Interfaces/Models';
import { CourseResource } from './CourseResource';
import { UserResource } from './UserResource';
import { StudentCourseCognitiveClassificationResource } from './StudentCourseCognitiveClassificationResource';

export interface StudentCourseCognitiveClassificationHistoryResource extends Resource, StudentCourseCognitiveClassificationHistory {
    course?: CourseResource;
    user?: UserResource;
    student_course_cognitive_classification?: StudentCourseCognitiveClassificationResource;
}
