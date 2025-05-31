import { LearningMaterial } from '../Models';
import { CourseResource } from './CourseResource';
import { Resource } from './Resource';

export interface LearningMaterialResource extends Resource, LearningMaterial {
    course?: CourseResource;
    file_url?: string;
    full_file_url?: string; // URL for the full PDF version
    /**
     * Percentage of completed questions for the current user in this learning material (0-100).
     * Added by backend for progress indicator in StudentController@show.
     */
    progress_percentage?: number;
}
