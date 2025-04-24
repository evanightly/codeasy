<?php

namespace App\Http\Resources;

use App\Traits\Resources\JsonResource\HandlesResourceDataSelection;
use Illuminate\Http\Resources\Json\JsonResource;

class LearningMaterialQuestionResource extends JsonResource {
    use HandlesResourceDataSelection;

    public function toArray($request): array {
        $dataSource = [
            'id' => $this->id,
            'learning_material_id' => $this->learning_material_id,
            'title' => $this->title,
            'description' => $this->description,
            'file' => $this->file,
            'file_extension' => $this->file_extension,
            'file_url' => $this->file_url, // Using the accessor from the model
            'type' => $this->type,
            'order_number' => $this->order_number,
            'clue' => $this->clue,
            'active' => $this->active,
            'learning_material' => LearningMaterialResource::make($this->whenLoaded('learning_material')),
            'learning_material_question_test_cases' => LearningMaterialQuestionTestCaseResource::collection($this->whenLoaded('learning_material_question_test_cases')),
            'created_at' => $this->created_at->toDateTimeString(),
            'updated_at' => $this->updated_at->toDateTimeString(),
        ];

        return $this->filterData($request, $dataSource);
    }
}
