<?php

namespace App\Http\Requests\LearningMaterialQuestionTestCase;

use App\Support\Enums\ProgrammingLanguageEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreLearningMaterialQuestionTestCaseRequest extends FormRequest {
    public function rules(): array {
        return [
            'learning_material_question_id' => ['required', 'exists:learning_material_questions,id'],
            'language' => ['required', Rule::enum(ProgrammingLanguageEnum::class)],
            'input' => ['required', 'string'],
            'expected_output_file' => ['required', 'file', 'max:2048', 'mimes:pdf,jpg,jpeg,png'],
            'description' => ['nullable', 'string'],
            'hidden' => ['boolean'],
            'active' => ['boolean'],
        ];
    }
}
