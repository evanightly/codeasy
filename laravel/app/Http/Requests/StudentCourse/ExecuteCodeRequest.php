<?php

namespace App\Http\Requests\StudentCourse;

use Illuminate\Foundation\Http\FormRequest;

class ExecuteCodeRequest extends FormRequest {
    public function rules(): array {
        return [
            'student_score_id' => ['required', 'exists:student_scores,id'],
            'code' => ['required', 'string'],
        ];
    }
}
