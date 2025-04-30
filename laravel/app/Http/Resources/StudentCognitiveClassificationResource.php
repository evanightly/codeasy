<?php

namespace App\Http\Resources;

use App\Traits\Resources\JsonResource\HandlesResourceDataSelection;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StudentCognitiveClassificationResource extends JsonResource {
    use HandlesResourceDataSelection;

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array {

        $dataSource = [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'course_id' => $this->course_id,
            'classification_level' => $this->classification_level,
            'classification_score' => $this->classification_score,
            'classification_type' => $this->classification_type,
            'raw_data' => $this->raw_data,
            'classified_at' => $this->classified_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'user' => new UserResource($this->whenLoaded('user')),
            'course' => new CourseResource($this->whenLoaded('course')),
        ];

        return $this->filterData($request, $dataSource);
    }
}
