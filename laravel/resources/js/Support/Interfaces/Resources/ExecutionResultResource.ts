import { ExecutionResult } from '@/Support/Interfaces/Models';
import { Resource, StudentScoreResource } from '@/Support/Interfaces/Resources';

export interface ExecutionResultResource extends Resource, ExecutionResult {
    student_score?: StudentScoreResource;
}
