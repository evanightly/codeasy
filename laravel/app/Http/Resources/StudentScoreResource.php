<?php

namespace App\Http\Resources;

use App\Traits\Resources\JsonResource\HandlesResourceDataSelection;
use Illuminate\Http\Resources\Json\JsonResource;

class StudentScoreResource extends JsonResource {
    use HandlesResourceDataSelection;

    public function toArray($request): array {
        $dataSource = [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'learning_material_question_id' => $this->learning_material_question_id,
            'score' => $this->score,
            'completion_status' => $this->completion_status,
            'trial_status' => $this->trial_status,
            'compile_count' => $this->compile_count,
            'completed_execution_result_id' => $this->completed_execution_result_id,
            'test_case_complete_count' => $this->test_case_complete_count,
            'test_case_total_count' => $this->test_case_total_count,
            'created_at' => $this->created_at->toDateTimeString(),
            'updated_at' => $this->updated_at->toDateTimeString(),
            'user' => UserResource::make($this->whenLoaded('user')),
            'learning_material_question' => LearningMaterialQuestionResource::make($this->whenLoaded('question')),
        ];

        return $this->filterData($request, $dataSource);
    }
}
