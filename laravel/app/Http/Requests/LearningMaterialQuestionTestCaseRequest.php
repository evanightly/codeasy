<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class LearningMaterialQuestionTestCaseRequest extends FormRequest {
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool {
        return true; // Add proper authorization check based on your app's requirements
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array {
        return [
            'input' => 'nullable|string',
            'expected_output_file' => 'nullable|file|max:2048',
            'description' => 'nullable|string',
            'hidden' => 'boolean',
            'active' => 'boolean',
        ];
    }
}
