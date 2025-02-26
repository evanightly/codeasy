<?php

namespace App\Http\Resources;

use App\Traits\Resources\JsonResource\HandlesResourceDataSelection;
use Illuminate\Http\Resources\Json\JsonResource;

class ClassRoomResource extends JsonResource {
    use HandlesResourceDataSelection;

    public function toArray($request): array {
        $dataSource = [
            'id' => $this->id,
            'school_id' => $this->school_id,
            'name' => $this->name,
            'description' => $this->description,
            'grade' => $this->grade,
            'year' => $this->year,
            'active' => $this->active,
            'school' => new SchoolResource($this->whenLoaded('school')),
            'students' => UserResource::collection($this->whenLoaded('students')),
            'courses' => CourseResource::collection($this->whenLoaded('courses')),
            'created_at' => $this->created_at->toDateTimeString(),
            'updated_at' => $this->updated_at->toDateTimeString(),
        ];

        return $this->filterData($request, $dataSource);
    }
}
