<?php

namespace App\Http\Requests\ExecutionResult;

use Illuminate\Foundation\Http\FormRequest;

class StoreExecutionResultRequest extends FormRequest {
    public function rules(): array {
        return [
            'student_score_id' => 'required|exists:student_scores,id',
            'code' => 'required',
            'compile_count' => 'required|integer',
            'compile_status' => 'required|boolean',
            // 'output_image' => 'nullable', // handled in fastapi server
        ];
    }
}
