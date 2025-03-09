<?php

namespace App\Http\Requests\ExecutionResult;

use Illuminate\Foundation\Http\FormRequest;

class UpdateExecutionResultRequest extends FormRequest {
    public function rules(): array {
        return [
            'student_score_id' => 'nullable|exists:student_scores,id',
            'code' => 'nullable',
            'compile_count' => 'nullable|integer',
            'compile_status' => 'nullable|boolean',
            // 'output_image' => 'nullable', // handled in fastapi server
        ];
    }
}
