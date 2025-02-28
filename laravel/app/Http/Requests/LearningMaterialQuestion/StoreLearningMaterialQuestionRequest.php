<?php

namespace App\Http\Requests\LearningMaterialQuestion;

use App\Support\Enums\LearningMaterialType;
use Illuminate\Foundation\Http\FormRequest;

class StoreLearningMaterialQuestionRequest extends FormRequest {
    public function rules(): array {
        return [
            'learning_material_id' => ['required', 'exists:learning_materials,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'file' => ['required', 'file'],
            'type' => ['required', 'string', 'in:' . implode(',', LearningMaterialType::toArray())],
            'order_number' => ['required', 'integer'],
            'clue' => ['nullable', 'string'],
            'active' => ['boolean'],
        ];
    }
}
