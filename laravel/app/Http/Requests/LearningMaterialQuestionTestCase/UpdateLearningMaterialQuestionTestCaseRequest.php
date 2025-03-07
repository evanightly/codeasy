<?php

namespace App\Http\Requests\LearningMaterialQuestionTestCase;

use App\Support\Enums\ProgrammingLanguageEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateLearningMaterialQuestionTestCaseRequest extends FormRequest {
    public function rules(): array {
        return [
            'learning_material_question_id' => ['nullable', 'exists:learning_material_questions,id'],
            'language' => ['nullable', Rule::enum(ProgrammingLanguageEnum::class)],
            'input' => ['nullable', 'string'],
            'expected_output_file' => ['nullable', 'file', 'max:2048', 'mimes:pdf,jpg,jpeg,png'],
            'description' => ['nullable', 'string'],
            'hidden' => ['boolean'],
            'active' => ['boolean'],
        ];
    }
}
