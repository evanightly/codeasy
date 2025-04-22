<?php

namespace App\Http\Resources;

use App\Traits\Resources\JsonResource\HandlesResourceDataSelection;
use Illuminate\Http\Resources\Json\JsonResource;

class CourseResource extends JsonResource {
    use HandlesResourceDataSelection;

    public function toArray($request): array {
        $dataSource = [
            'id' => $this->id,
            'class_room_id' => $this->class_room_id,
            'teacher_id' => $this->teacher_id,
            'name' => $this->name,
            'description' => $this->description,
            'active' => $this->active,
            'created_at' => $this->created_at->toDateTimeString(),
            'updated_at' => $this->updated_at->toDateTimeString(),
            'classroom' => new ClassRoomResource($this->whenLoaded('classroom')),
            'teacher' => new UserResource($this->whenLoaded('teacher')),
            'learning_materials' => LearningMaterialResource::collection($this->whenLoaded('learning_materials')),
        ];

        return $this->filterData($request, $dataSource);
    }
}
