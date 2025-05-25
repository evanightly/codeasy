import { Course } from '../Models';
import { ClassRoomResource } from './ClassRoomResource';
import { LearningMaterialResource } from './LearningMaterialResource';
import { Resource } from './Resource';
import { UserResource } from './UserResource';

export interface CourseResource extends Resource, Course {
    classroom?: ClassRoomResource;
    teacher?: UserResource;
    learning_materials?: LearningMaterialResource[];
    /**
     * Percentage of completed questions for the current user in this course (0-100).
     * Added by backend for progress indicator in student course list.
     */
    progress_percentage?: number;

    workspace_lock_timeout_days?: number;
}
