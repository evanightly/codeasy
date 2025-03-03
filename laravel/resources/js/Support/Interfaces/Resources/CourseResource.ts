import { Course } from '../Models';
import { ClassRoomResource } from './ClassRoomResource';
import { LearningMaterialResource } from './LearningMaterialResource';
import { Resource } from './Resource';
import { UserResource } from './UserResource';

export interface CourseResource extends Resource, Course {
    classroom?: ClassRoomResource;
    teacher?: UserResource;
    learning_materials?: LearningMaterialResource[];
}
