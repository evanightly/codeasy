<?php

namespace App\Http\Resources;

use App\Traits\Resources\JsonResource\HandlesResourceDataSelection;
use Illuminate\Http\Resources\Json\JsonResource;

class LearningMaterialQuestionTestCaseResource extends JsonResource {
    use HandlesResourceDataSelection;

    public function toArray($request): array {
        $dataSource = [
            'id' => $this->id,
            'learning_material_question_id' => $this->learning_material_question_id,
            'input' => $this->input,
            'expected_output_file' => $this->expected_output_file,
            'expected_output_file_extension' => $this->expected_output_file_extension,
            'expected_output_file_url' => $this->expected_output_file_url,
            'description' => $this->description,
            'hidden' => $this->hidden,
            'active' => $this->active,
            'question' => LearningMaterialQuestionResource::make($this->whenLoaded('question')),
            'created_at' => $this->created_at->toDateTimeString(),
            'updated_at' => $this->updated_at->toDateTimeString(),
        ];

        return $this->filterData($request, $dataSource);
    }
}
