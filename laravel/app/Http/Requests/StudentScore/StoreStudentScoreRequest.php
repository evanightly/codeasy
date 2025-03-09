<?php

namespace App\Http\Requests\StudentScore;

use Illuminate\Foundation\Http\FormRequest;

class StoreStudentScoreRequest extends FormRequest {
    public function rules(): array {
        return [
            'user_id' => 'required|exists:users,id',
            'learning_material_question_id' => 'required|exists:learning_material_questions,id',
            'score' => 'required|integer',
            'completion_status' => 'required|boolean',
            'trial_status' => 'required|boolean',
        ];
    }
}
