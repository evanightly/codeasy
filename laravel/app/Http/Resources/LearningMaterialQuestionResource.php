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
            'type' => $this->type,
            'order_number' => $this->order_number,
            'clue' => $this->clue,
            'active' => $this->active,
            'learning_material' => LearningMaterialResource::make($this->whenLoaded('learningMaterial')),
            'created_at' => $this->created_at->toDateTimeString(),
            'updated_at' => $this->updated_at->toDateTimeString(),
        ];

        return $this->filterData($request, $dataSource);
    }
}
