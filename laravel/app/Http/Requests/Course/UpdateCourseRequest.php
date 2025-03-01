<?php

namespace App\Http\Requests\Course;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCourseRequest extends FormRequest {
    public function rules(): array {
        return [
            'class_room_id' => 'nullable|exists:class_rooms,id',
            'teacher_id' => 'nullable|exists:users,id',
            'name' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'active' => 'nullable|boolean',
        ];
    }
}
