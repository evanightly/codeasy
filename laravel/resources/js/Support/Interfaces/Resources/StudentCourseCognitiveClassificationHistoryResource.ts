import { StudentCourseCognitiveClassificationHistory } from '@/Support/Interfaces/Models';
import { Resource } from '@/Support/Interfaces/Resources';
import { CourseResource } from './CourseResource';
import { StudentCourseCognitiveClassificationResource } from './StudentCourseCognitiveClassificationResource';
import { UserResource } from './UserResource';

export interface StudentCourseCognitiveClassificationHistoryResource
    extends Resource,
        StudentCourseCognitiveClassificationHistory {
    course?: CourseResource;
    user?: UserResource;
    student_course_cognitive_classification?: StudentCourseCognitiveClassificationResource;
}
