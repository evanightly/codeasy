<?php

namespace App\Http\Requests\StudentScore;

use Illuminate\Foundation\Http\FormRequest;

class StoreStudentScoreRequest extends FormRequest {
    public function rules(): array {
        return [
            'user_id' => ['required', 'exists:users,id'],
            'learning_material_question_id' => ['required', 'exists:learning_material_questions,id'],
            'coding_time' => ['nullable', 'integer', 'min:0'],
            'score' => ['nullable', 'integer', 'min:0', 'max:100'],
            'completion_status' => ['nullable', 'boolean'],
            'trial_status' => ['nullable', 'boolean'],
        ];
    }
}
