<?php

namespace App\Http\Requests\StudentCognitiveClassification;

use App\Support\Enums\IntentEnum;
use Illuminate\Foundation\Http\FormRequest;

class UpdateStudentCognitiveClassificationRequest extends FormRequest {
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
            case IntentEnum::CUSTOM_ACTION->value:
                // Add custom validation for specific actions
                break;
        }

        return $rules;
    }
}
