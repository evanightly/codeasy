<?php

namespace App\Http\Requests\Course;

use Illuminate\Foundation\Http\FormRequest;

class StoreCourseRequest extends FormRequest {
    public function rules(): array {
        return [
            'class_room_id' => 'required|exists:class_rooms,id',
            'teacher_id' => 'required|exists:users,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'active' => 'required|boolean',
        ];
    }
}
