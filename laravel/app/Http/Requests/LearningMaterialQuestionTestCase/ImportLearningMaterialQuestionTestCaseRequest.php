<?php

namespace App\Http\Requests\LearningMaterialQuestionTestCase;

use App\Support\Enums\IntentEnum;
use Illuminate\Foundation\Http\FormRequest;

class ImportLearningMaterialQuestionTestCaseRequest extends FormRequest {
    public function rules(): array {
        $intent = $this->get('intent');

        $rules = [];

        if ($intent === IntentEnum::LEARNING_MATERIAL_QUESTION_TEST_CASE_STORE_IMPORT->value) {
            $rules = [
                'file' => 'required|file|mimes:csv,xlsx,xls|max:2048',
                'learning_material_question_id' => 'required|exists:learning_material_questions,id',
            ];
        }

        if ($intent === IntentEnum::LEARNING_MATERIAL_QUESTION_TEST_CASE_STORE_PREVIEW_IMPORT->value) {
            $rules = [
                'file' => 'required|file|mimes:csv,xlsx,xls|max:2048',
            ];
        }

        return $rules;
    }

    // TODO: add localization for validation messages
    public function messages(): array {
        return [
            'file.required' => 'Please select a file to import.',
            'file.mimes' => 'The file must be a CSV or Excel file.',
            'file.max' => 'The file size must not exceed 2MB.',
            'learning_material_question_id.required' => 'Question ID is required.',
            'learning_material_question_id.exists' => 'The selected question does not exist.',
        ];
    }
}
