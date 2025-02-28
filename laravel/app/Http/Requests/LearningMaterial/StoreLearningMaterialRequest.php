<?php

namespace App\Http\Requests\LearningMaterial;

use App\Support\Enums\FileTypeEnum;
use App\Support\Enums\LearningMaterialType;
use Illuminate\Foundation\Http\FormRequest;

class StoreLearningMaterialRequest extends FormRequest {
    public function rules(): array {
        return [
            'course_id' => ['required', 'exists:courses,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'file' => ['required', 'file'],
            // 'file_type' => ['required', 'string', 'in:' . implode(',', FileTypeEnum::toArray())],
            'type' => ['required', 'string', 'in:' . implode(',', LearningMaterialType::toArray())],
            'order_number' => ['required', 'integer'],
            'active' => ['boolean'],
        ];
    }
}
