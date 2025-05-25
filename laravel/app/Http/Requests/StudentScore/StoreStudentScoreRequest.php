<?php

namespace App\Http\Requests\StudentScore;

use App\Support\Enums\IntentEnum;
use Illuminate\Foundation\Http\FormRequest;

class StoreStudentScoreRequest extends FormRequest {
    public function rules(): array {
        $intent = $this->get('intent');

        $rules = [
            'user_id' => ['required', 'exists:users,id'],
            'learning_material_question_id' => ['required', 'exists:learning_material_questions,id'],
            'coding_time' => ['nullable', 'integer', 'min:0'],
            // 'compile_count' => ['nullable', 'integer', 'min:1'],
            'score' => ['nullable', 'integer', 'min:0', 'max:100'],
            'completion_status' => ['nullable', 'boolean'],
            'trial_status' => ['nullable', 'boolean'],
        ];

        if ($intent === IntentEnum::STUDENT_SCORE_STORE_REATTEMPT->value) {
            // For re-attempt, only user_id and learning_material_question_id are required
            $rules = [
                'user_id' => ['required', 'exists:users,id'],
                'learning_material_question_id' => ['required', 'exists:learning_material_questions,id'],
            ];
        }

        return $rules;
    }
}
