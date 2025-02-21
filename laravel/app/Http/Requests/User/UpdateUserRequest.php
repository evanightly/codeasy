<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest {
    public function rules(): array {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $this->user->id,
            'username' => 'required|string|max:255|unique:users,username,' . $this->user->id,
            'password' => 'nullable|string|min:8|confirmed',
        ];
    }
}
