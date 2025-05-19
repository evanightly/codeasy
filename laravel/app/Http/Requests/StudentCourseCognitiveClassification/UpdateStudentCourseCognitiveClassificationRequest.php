<?php

namespace App\Http\Requests\StudentCourseCognitiveClassification;

use App\Support\Enums\IntentEnum;
use Illuminate\Foundation\Http\FormRequest;

class UpdateStudentCourseCognitiveClassificationRequest extends FormRequest {
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
            case IntentEnum::STUDENT_COURSE_COGNITIVE_CLASSIFICATION_SHOW_DETAILS->value:
                return [
                    'id' => ['required', 'integer', 'exists:student_course_cognitive_classifications,id'],
                ];

            case IntentEnum::CUSTOM_ACTION->value:
                // Add custom validation for specific actions
                break;
        }

        return $rules;
    }
}
