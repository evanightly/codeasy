<?php

namespace App\Http\Requests\StudentScore;

use App\Support\Enums\IntentEnum;
use Illuminate\Foundation\Http\FormRequest;

class UpdateStudentScoreRequest extends FormRequest {
    public function rules(): array {
        $intent = $this->get('intent');

        $rules = [
            // 'user_id' => 'nullable|exists:users,id',
            // 'learning_material_question_id' => 'nullable|exists:learning_material_questions,id',
            'coding_time' => ['nullable', 'integer', 'min:0'],
            // 'compile_count' => ['nullable', 'integer', 'min:1'],
            'score' => ['nullable', 'integer', 'min:0', 'max:100'],
            'completion_status' => ['nullable', 'boolean'],
            'trial_status' => ['nullable', 'boolean'],
        ];

        switch ($intent) {
            case IntentEnum::STUDENT_SCORE_UPDATE_UNLOCK_WORKSPACE->value:
                // For workspace unlock, no additional fields are required beyond the route model
                $rules = [];
                break;

            case IntentEnum::STUDENT_SCORE_UPDATE_ALLOW_REATTEMPT_ALL->value:
                // For bulk re-attempt, we need the material_id
                $rules = [
                    'material_id' => ['required', 'exists:learning_materials,id'],
                ];
                break;

            default:
                // code...
                break;
        }

        return $rules;
    }
}
