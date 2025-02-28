<?php

namespace App\Http\Requests\LearningMaterialQuestion;

use App\Support\Enums\LearningMaterialType;
use Illuminate\Foundation\Http\FormRequest;

class UpdateLearningMaterialQuestionRequest extends FormRequest {
    public function rules(): array {
        return [
            'learning_material_id' => ['nullable', 'exists:learning_materials,id'],
            'title' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'file' => ['nullable', 'file'],
            'type' => ['nullable', 'string', 'in:' . implode(',', LearningMaterialType::toArray())],
            'order_number' => ['nullable', 'integer'],
            'clue' => ['nullable', 'string'],
            'active' => ['boolean'],
        ];
    }
}
