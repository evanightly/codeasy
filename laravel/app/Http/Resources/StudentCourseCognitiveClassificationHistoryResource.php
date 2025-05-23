<?php

namespace App\Http\Resources;

use App\Traits\Resources\JsonResource\HandlesResourceDataSelection;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StudentCourseCognitiveClassificationHistoryResource extends JsonResource {
    use HandlesResourceDataSelection;

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array {
        $dataSource = [
            'id' => $this->id,
            'course_id' => $this->course_id,
            'user_id' => $this->user_id,
            'student_course_cognitive_classification_id' => $this->student_course_cognitive_classification_id,
            'classification_type' => $this->classification_type,
            'classification_level' => $this->classification_level,
            'classification_score' => $this->classification_score,
            'raw_data' => $this->raw_data,
            'classified_at' => $this->classified_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'course' => new CourseResource($this->whenLoaded('course')),
            'user' => new UserResource($this->whenLoaded('user')),
            'student_course_cognitive_classification' => new StudentCourseCognitiveClassificationResource($this->whenLoaded('student_course_cognitive_classification')),
        ];

        return $this->filterData($request, $dataSource);
    }
}
