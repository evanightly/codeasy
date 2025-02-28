<?php

namespace App\Http\Requests\LearningMaterial;

use App\Support\Enums\LearningMaterialType;
use Illuminate\Foundation\Http\FormRequest;

class UpdateLearningMaterialRequest extends FormRequest {
    public function rules(): array {
        return [
            'course_id' => ['nullable', 'exists:courses,id'],
            'title' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'file' => ['nullable', 'file'],
            // 'file_type' => ['nullable', 'string', 'in:' . implode(',', FileTypeEnum::toArray())],
            'type' => ['nullable', 'string', 'in:' . implode(',', LearningMaterialType::toArray())],
            'order_number' => ['nullable', 'integer'],
            'active' => ['boolean'],
        ];
    }
}
