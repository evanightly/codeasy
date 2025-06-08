<?php

namespace App\Http\Requests\User;

use App\Support\Enums\IntentEnum;
use Illuminate\Foundation\Http\FormRequest;

class StoreUserRequest extends FormRequest {
    public function rules(): array {
        $intent = $this->get('intent');

        switch ($intent) {
            case IntentEnum::USER_STORE_IMPORT_STUDENTS->value:
                return [
                    'file' => 'required|file|mimes:xlsx,xls,csv|max:10240', // 10MB max, supports both Excel and CSV
                ];
                break;
            case IntentEnum::USER_STORE_PREVIEW_IMPORT_STUDENTS->value:
                return [
                    'file' => 'required|file|mimes:xlsx,xls,csv|max:10240', // 10MB max, supports both Excel and CSV
                ];
                break;
        }

        // Default user creation validation
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'username' => 'required|string|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role_ids' => 'array',
            'role_ids.*' => 'exists:roles,id',
        ];
    }
}
