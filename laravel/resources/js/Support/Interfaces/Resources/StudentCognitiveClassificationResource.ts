import { StudentCognitiveClassification } from '@/Support/Interfaces/Models';
import { Resource } from '@/Support/Interfaces/Resources';
import { CourseResource } from './CourseResource';
import { LearningMaterialResource } from './LearningMaterialResource';
import { UserResource } from './UserResource';

export interface StudentCognitiveClassificationResource
    extends Resource,
        StudentCognitiveClassification {
    user?: UserResource;
    course?: CourseResource;
    learning_material?: LearningMaterialResource;
}
