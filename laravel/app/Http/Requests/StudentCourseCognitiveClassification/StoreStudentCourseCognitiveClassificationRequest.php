<?php

namespace App\Http\Requests\StudentCourseCognitiveClassification;

use App\Support\Enums\IntentEnum;
use Illuminate\Foundation\Http\FormRequest;

class StoreStudentCourseCognitiveClassificationRequest extends FormRequest {
    public function rules(): array {
        $rules = [
            'course_id' => ['required', 'integer'],
            'user_id' => ['required', 'integer'],
            'classification_type' => ['required', 'string'],
            'classification_level' => ['required', 'string'],
            'classification_score' => ['required', 'numeric'],
            'raw_data' => ['required', 'array'],
            'classified_at' => ['required', 'date_format:Y-m-d H:i:s'],
        ];

        // Handle custom intents if needed
        switch ($this->get('intent')) {
            case IntentEnum::STUDENT_COURSE_COGNITIVE_CLASSIFICATION_INDEX_GET_BY_USER_AND_COURSE->value:
                return [
                    'user_id' => ['required', 'integer'],
                    'course_id' => ['required', 'integer'],
                    'classification_type' => ['sometimes', 'string'],
                ];

            case IntentEnum::STUDENT_COURSE_COGNITIVE_CLASSIFICATION_INDEX_GET_COURSE_REPORT->value:
                return [
                    'course_id' => ['required', 'integer'],
                    'classification_type' => ['sometimes', 'string'],
                ];

            case IntentEnum::CUSTOM_ACTION->value:
                // Add custom validation for specific actions
                break;
        }

        return $rules;
    }
}
