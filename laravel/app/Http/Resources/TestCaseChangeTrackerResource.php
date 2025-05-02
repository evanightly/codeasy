<?php

namespace App\Http\Resources;

use App\Traits\Resources\JsonResource\HandlesResourceDataSelection;
use Illuminate\Http\Resources\Json\JsonResource;

class TestCaseChangeTrackerResource extends JsonResource {
    use HandlesResourceDataSelection;

    public function toArray($request): array {
        $dataSource = [
            'id' => $this->id,
            'test_case_id' => $this->test_case_id,
            'learning_material_question_id' => $this->learning_material_question_id,
            'learning_material_id' => $this->learning_material_id,
            'course_id' => $this->course_id,
            'change_type' => $this->change_type,
            'previous_data' => $this->previous_data,
            'affected_student_ids' => $this->affected_student_ids,
            'status' => $this->status,
            'scheduled_at' => $this->scheduled_at,
            'completed_at' => $this->completed_at,
            'execution_details' => $this->execution_details,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'test_case' => new LearningMaterialQuestionTestCaseResource($this->whenLoaded('learning_material_question_test_case')),
            'learning_material_question' => new LearningMaterialQuestionResource($this->whenLoaded('learning_material_question')),
            'learning_material' => new LearningMaterialResource($this->whenLoaded('learning_material')),
            'course' => new CourseResource($this->whenLoaded('course')),
            'affected_students_count' => $this->affected_students_count,
            'time_remaining' => $this->status === 'pending' ? now()->diffInSeconds($this->scheduled_at, false) : null,
        ];

        return $this->filterData($request, $dataSource);
    }

    /**
     * Get the count of affected students, handling various possible formats.
     */
    private function getAffectedStudentsCount(): int {
        // If already an array, just count it
        if (is_array($this->affected_student_ids)) {
            return count($this->affected_student_ids);
        }

        // If it's a string, try to decode it as JSON
        if (is_string($this->affected_student_ids)) {
            $decoded = json_decode($this->affected_student_ids, true);

            // If we got a valid array or object back
            if (is_array($decoded)) {
                // Handle associative arrays (objects) by counting values
                if (array_keys($decoded) !== range(0, count($decoded) - 1)) {
                    // This is an associative array, just count values
                    return count(array_values($decoded));
                }

                // Plain array, just count it
                return count($decoded);
            }
        }

        // Default to 0 if we couldn't parse it
        return 0;
    }
}
