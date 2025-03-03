import { LearningMaterial } from '../Models';
import { CourseResource } from './CourseResource';
import { Resource } from './Resource';

export interface LearningMaterialResource extends Resource, LearningMaterial {
    course?: CourseResource;
    file_url?: string;
}
