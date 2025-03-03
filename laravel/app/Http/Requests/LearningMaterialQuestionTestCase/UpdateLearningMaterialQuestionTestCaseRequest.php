<?php

namespace App\Http\Requests\LearningMaterialQuestionTestCase;

use Illuminate\Foundation\Http\FormRequest;

class UpdateLearningMaterialQuestionTestCaseRequest extends FormRequest {
    public function rules(): array {
        return [
            'learning_material_question_id' => ['nullable', 'exists:learning_material_questions,id'],
            'input' => ['nullable', 'string'],
            'expected_output' => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
            'order_number' => ['nullable', 'integer'],
            'hidden' => ['boolean'],
            'active' => ['boolean'],
        ];
    }
}
