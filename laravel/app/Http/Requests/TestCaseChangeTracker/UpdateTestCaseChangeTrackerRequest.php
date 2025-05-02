<?php

namespace App\Http\Requests\TestCaseChangeTracker;

use Illuminate\Foundation\Http\FormRequest;
use App\Support\Enums\IntentEnum;

class UpdateTestCaseChangeTrackerRequest extends FormRequest
{
    public function rules(): array
    {
        $rules = [
            'test_case_id' => ['required', 'integer'],
            'learning_material_question_id' => ['required', 'integer'],
            'learning_material_id' => ['required', 'integer'],
            'course_id' => ['required', 'integer'],
            'change_type' => ['required', 'string'],
            'previous_data' => ['nullable', 'json'],
            'affected_student_ids' => ['required', 'json'],
            'status' => ['required', 'string'],
            'scheduled_at' => ['required', 'date_format:Y-m-d H:i:s'],
            'completed_at' => ['nullable', 'date_format:Y-m-d H:i:s'],
            'execution_details' => ['nullable', 'json'],
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
