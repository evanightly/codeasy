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
            'affected_students_count' => $this->affected_student_ids ? count($this->affected_student_ids) : 0,
            'time_remaining' => $this->status === 'pending' ? now()->diffInSeconds($this->scheduled_at, false) : null,
        ];

        return $this->filterData($request, $dataSource);
    }
}
