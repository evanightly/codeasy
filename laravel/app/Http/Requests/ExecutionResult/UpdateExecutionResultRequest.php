<?php

namespace App\Http\Requests\ExecutionResult;

use Illuminate\Foundation\Http\FormRequest;

class UpdateExecutionResultRequest extends FormRequest {
    public function rules(): array {
        return [
            // 'student_score_id' => 'nullable|exists:student_scores,id',
            'code' => ['nullable', 'string'],
            'compile_count' => ['nullable', 'integer', 'min:1'],
            'compile_status' => ['nullable', 'boolean'],
            'output_image' => ['nullable', 'string'],
        ];
    }
}
