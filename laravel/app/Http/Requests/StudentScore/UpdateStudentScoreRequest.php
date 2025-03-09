<?php

namespace App\Http\Requests\StudentScore;

use Illuminate\Foundation\Http\FormRequest;

class UpdateStudentScoreRequest extends FormRequest {
    public function rules(): array {
        return [
            'user_id' => 'nullable|exists:users,id',
            'learning_material_question_id' => 'nullable|exists:learning_material_questions,id',
            'score' => 'nullable|integer',
            'completion_status' => 'nullable|boolean',
            'trial_status' => 'nullable|boolean',
        ];
    }
}
