<?php

namespace App\Http\Requests\LearningMaterial;

use App\Support\Enums\LearningMaterialTypeEnum;
use Illuminate\Foundation\Http\FormRequest;

class UpdateLearningMaterialRequest extends FormRequest {
    public function rules(): array {
        return [
            'course_id' => ['nullable', 'exists:courses,id'],
            'title' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'file' => ['nullable', 'file'],
            // 'file_extension' => ['nullable', 'string'],
            'type' => ['nullable', 'string', 'in:' . implode(',', LearningMaterialTypeEnum::toArray())],
            // 'order_number' => ['nullable', 'integer'],
            'active' => ['boolean'],
        ];
    }
}
