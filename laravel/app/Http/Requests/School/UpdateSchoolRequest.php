<?php

namespace App\Http\Requests\School;

use App\Support\Enums\IntentEnum;
use Illuminate\Foundation\Http\FormRequest;

class UpdateSchoolRequest extends FormRequest {
    public function rules(): array {
        $intent = $this->get('intent');

        switch ($intent) {
            case IntentEnum::SCHOOL_UPDATE_ASSIGN_ADMIN->value:
                return [
                    'user_id' => ['required', 'exists:users,id'],
                ];
            case IntentEnum::SCHOOL_UPDATE_UNASSIGN_ADMIN->value:
                return [
                    'user_id' => ['required', 'exists:users,id'],
                ];
        }

        return [
            'name' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'state' => 'nullable|string|max:255',
            'zip' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:255',
            'email' => 'nullable|string|max:255',
            'website' => 'nullable|string|max:255',
            'logo' => 'nullable|string|max:255',
            'active' => 'nullable|boolean',
        ];
    }
}
