<?php

namespace App\Http\Resources;

use App\Traits\Resources\JsonResource\HandlesResourceDataSelection;
use Illuminate\Http\Resources\Json\JsonResource;

class StudentCourseCognitiveClassificationResource extends JsonResource {
    use HandlesResourceDataSelection;

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray($request): array {
        $dataSource = [
            'id' => $this->id,
            'course_id' => $this->course_id,
            'user_id' => $this->user_id,
            'classification_type' => $this->classification_type,
            'classification_level' => $this->classification_level,
            'classification_score' => $this->classification_score,
            'raw_data' => $this->raw_data,
            'classified_at' => $this->classified_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'course' => new CourseResource($this->whenLoaded('course')),
            'user' => new UserResource($this->whenLoaded('user')),
        ];

        return $this->filterData($request, $dataSource);
    }
}
