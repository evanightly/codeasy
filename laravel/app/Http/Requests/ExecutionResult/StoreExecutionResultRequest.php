<?php

namespace App\Http\Requests\ExecutionResult;

use Illuminate\Foundation\Http\FormRequest;

class StoreExecutionResultRequest extends FormRequest {
    public function rules(): array {
        return [
            'student_score_id' => ['required', 'exists:student_scores,id'],
            'code' => ['required', 'string'],
            'compile_count' => ['nullable', 'integer', 'min:1'],
            'compile_status' => ['nullable', 'boolean'],
            'output_image' => ['nullable', 'string'],
        ];
    }
}
