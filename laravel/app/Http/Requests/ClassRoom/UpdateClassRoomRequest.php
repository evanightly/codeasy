<?php

namespace App\Http\Requests\ClassRoom;

use App\Support\Enums\IntentEnum;
use Illuminate\Foundation\Http\FormRequest;

class UpdateClassRoomRequest extends FormRequest {
    public function rules(): array {
        $intent = $this->get('intent');

        switch ($intent) {
            case IntentEnum::CLASS_ROOM_UPDATE_ASSIGN_STUDENT->value:
                return [
                    'user_id' => ['required', 'exists:users,id'],
                ];
            case IntentEnum::CLASS_ROOM_UPDATE_UNASSIGN_STUDENT->value:
                return [
                    'user_id' => ['required', 'exists:users,id'],
                ];
            case IntentEnum::CLASS_ROOM_UPDATE_BULK_ASSIGN_STUDENTS->value:
                return [
                    'user_ids' => ['required', 'array', 'min:1'],
                    'user_ids.*' => ['required', 'exists:users,id'],
                ];
            case IntentEnum::CLASS_ROOM_UPDATE_BULK_UNASSIGN_STUDENTS->value:
                return [
                    'user_ids' => ['required', 'array', 'min:1'],
                    'user_ids.*' => ['required', 'exists:users,id'],
                ];
        }

        return [
            'school_id' => ['nullable', 'exists:schools,id'],
            'name' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'grade' => ['nullable', 'integer', 'min:1', 'max:12'],
            'year' => ['nullable', 'integer', 'min:2000'],
            'active' => ['boolean'],
            'student_ids' => ['nullable', 'array'],
            'student_ids.*' => ['exists:users,id'], ];
    }
}
