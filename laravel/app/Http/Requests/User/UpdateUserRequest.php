<?php

namespace App\Http\Requests\User;

use App\Support\Enums\IntentEnum;
use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest {
    public function rules(): array {
        $intent = $this->get('intent');

        // Base validation rules for preferences update
        if ($intent === IntentEnum::USER_UPDATE_PREFERENCES->value) {
            return [
                'locale' => 'required|string|in:en,id,de', // Add more locales as needed
            ];
        }

        // Default validation rules for user update
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $this->user->id,
            'username' => 'required|string|max:255|unique:users,username,' . $this->user->id,
            'password' => 'nullable|string|min:8|confirmed',
            'role_ids' => 'array',
            'role_ids.*' => 'exists:roles,id',
        ];
    }
}
