<?php

namespace App\Http\Requests\StudentCognitiveClassification;

use App\Support\Enums\IntentEnum;
use Illuminate\Foundation\Http\FormRequest;

class StoreStudentCognitiveClassificationRequest extends FormRequest {
    public function rules(): array {
        $rules = [
            'user_id' => ['required', 'integer'],
            'course_id' => ['required', 'integer'],
            'classification_level' => ['required', 'string'],
            'classification_score' => ['required', 'numeric'],
            'raw_data' => ['required', 'json'],
            'classified_at' => ['required', 'date_format:Y-m-d H:i:s'],
        ];

        // Handle custom intents if needed
        switch ($this->get('intent')) {
            case IntentEnum::STUDENT_COGNITIVE_CLASSIFICATION_STORE_RUN_CLASSIFICATION->value:
                $rules = [
                    'course_id' => ['required', 'integer', 'exists:courses,id'],
                    'classification_type' => ['sometimes', 'string', 'in:topsis,fuzzy,neural,cognitive_levels'],
                ];
                break;
        }

        return $rules;
    }
}
