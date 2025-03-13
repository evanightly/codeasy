<?php

namespace App\Http\Requests\Course;

use App\Support\Enums\IntentEnum;
use Illuminate\Foundation\Http\FormRequest;

class StoreCourseRequest extends FormRequest {
    public function rules(): array {
        $intent = $this->get('intent');

        switch ($intent) {
            case IntentEnum::COURSE_STORE_IMPORT->value:
                return [
                    'import_file' => 'required|file|mimes:xlsx,xls,zip|max:51200', // Increased max size to 50MB to accommodate ZIP files
                ];
        }

        return [
            'class_room_id' => 'required|exists:class_rooms,id',
            'teacher_id' => 'required|exists:users,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'active' => 'required|boolean',
        ];
    }
}
