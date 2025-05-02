import { Resource } from '@/Support/Interfaces/Resources';
import { TestCaseChangeTracker } from '@/Support/Interfaces/Models';
import { LearningMaterialQuestionTestCaseResource } from './LearningMaterialQuestionTestCaseResource';
import { LearningMaterialQuestionResource } from './LearningMaterialQuestionResource';
import { LearningMaterialResource } from './LearningMaterialResource';
import { CourseResource } from './CourseResource';

export interface TestCaseChangeTrackerResource extends Resource, TestCaseChangeTracker {
    learning_material_question_test_case?: LearningMaterialQuestionTestCaseResource;
    learning_material_question?: LearningMaterialQuestionResource;
    learning_material?: LearningMaterialResource;
    course?: CourseResource;
}
