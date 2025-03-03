<?php

namespace App\Http\Requests\LearningMaterialQuestionTestCase;

use Illuminate\Foundation\Http\FormRequest;

class UpdateLearningMaterialQuestionTestCaseRequest extends FormRequest {
    public function rules(): array {
        return [
            'learning_material_question_id' => ['nullable', 'exists:learning_material_questions,id'],
            'input' => ['nullable', 'string'],
            'expected_output_file' => ['nullable', 'file', 'max:2048', 'mimes:pdf,jpg,jpeg,png'],
            'description' => ['nullable', 'string'],
            'hidden' => ['boolean'],
            'active' => ['boolean'],
        ];
    }
}
