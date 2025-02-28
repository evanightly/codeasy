<?php

namespace App\Http\Resources;

use App\Traits\Resources\JsonResource\HandlesResourceDataSelection;
use Illuminate\Http\Resources\Json\JsonResource;

class LearningMaterialResource extends JsonResource {
    use HandlesResourceDataSelection;

    public function toArray($request): array {
        $dataSource = [
            'id' => $this->id,
            'course_id' => $this->course_id,
            'title' => $this->title,
            'description' => $this->description,
            'file' => $this->file,
            'file_type' => $this->file_type,
            'type' => $this->type,
            'order_number' => $this->order_number,
            'active' => $this->active,
            'created_at' => $this->created_at->toDateTimeString(),
            'updated_at' => $this->updated_at->toDateTimeString(),
            'course' => new CourseResource($this->whenLoaded('course')),
        ];

        return $this->filterData($request, $dataSource);
    }
}
