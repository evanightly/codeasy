<?php

namespace App\Http\Requests\StudentCourse;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTimeRequest extends FormRequest {
    public function rules(): array {
        return [
            'student_score_id' => ['required', 'exists:student_scores,id'],
            'seconds' => ['required', 'integer', 'min:0'],
        ];
    }
}
