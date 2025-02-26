<?php

namespace App\Http\Requests\ClassRoom;

use Illuminate\Foundation\Http\FormRequest;

class StoreClassRoomRequest extends FormRequest {
    public function rules(): array {
        return [
            'school_id' => ['required', 'exists:schools,id'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'grade' => ['required', 'integer', 'min:1', 'max:12'],
            'year' => ['required', 'integer', 'min:2000'],
            'active' => ['boolean'],
            'student_ids' => ['nullable', 'array'],
            'student_ids.*' => ['exists:users,id'],
        ];
    }
}
