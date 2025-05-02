import { TestCaseChangeTracker } from '@/Support/Interfaces/Models';
import { Resource } from '@/Support/Interfaces/Resources';
import { CourseResource } from './CourseResource';
import { LearningMaterialQuestionResource } from './LearningMaterialQuestionResource';
import { LearningMaterialQuestionTestCaseResource } from './LearningMaterialQuestionTestCaseResource';
import { LearningMaterialResource } from './LearningMaterialResource';

export interface TestCaseChangeTrackerResource extends Resource, TestCaseChangeTracker {
    learning_material_question_test_case?: LearningMaterialQuestionTestCaseResource;
    learning_material_question?: LearningMaterialQuestionResource;
    learning_material?: LearningMaterialResource;
    course?: CourseResource;
    affected_students_count?: number;
}
