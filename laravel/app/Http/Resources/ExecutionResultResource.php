<?php

namespace App\Http\Resources;

use App\Traits\Resources\JsonResource\HandlesResourceDataSelection;
use Illuminate\Http\Resources\Json\JsonResource;

class ExecutionResultResource extends JsonResource {
    use HandlesResourceDataSelection;

    public function toArray($request): array {
        $dataSource = [
            'id' => $this->id,
            'student_score_id' => $this->student_score_id,
            'code' => $this->code,
            'compile_count' => $this->compile_count,
            'compile_status' => $this->compile_status,
            'output_image' => $this->output_image,
            'created_at' => $this->created_at->toDateTimeString(),
            'updated_at' => $this->updated_at->toDateTimeString(),
            'student_score' => StudentScoreResource::make($this->whenLoaded('studentScore')),
        ];

        return $this->filterData($request, $dataSource);
    }
}
