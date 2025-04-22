import { LearningMaterial } from '../Models';
import { CourseResource } from './CourseResource';
import { Resource } from './Resource';

export interface LearningMaterialResource extends Resource, LearningMaterial {
    course?: CourseResource;
    file_url?: string;
    /**
     * Percentage of completed questions for the current user in this learning material (0-100).
     * Added by backend for progress indicator in StudentController@show.
     */
    progress_percentage?: number;
}
