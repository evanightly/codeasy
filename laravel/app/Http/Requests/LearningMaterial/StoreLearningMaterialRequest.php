<?php

namespace App\Http\Requests\LearningMaterial;

use App\Support\Enums\LearningMaterialTypeEnum;
use Illuminate\Foundation\Http\FormRequest;

class StoreLearningMaterialRequest extends FormRequest {
    public function rules(): array {
        return [
            'course_id' => ['required', 'exists:courses,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'file' => ['required', 'file', 'mimes:pdf', 'max:10240'],
            // 'file_extension' => ['required', 'string'],
            'type' => ['required', 'string', 'in:' . implode(',', LearningMaterialTypeEnum::toArray())],
            // 'order_number' => ['required', 'integer'],
            'active' => ['nullable', 'boolean'],
        ];
    }
}
