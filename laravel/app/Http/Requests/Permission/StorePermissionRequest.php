<?php

namespace App\Http\Requests\Permission;

use Illuminate\Foundation\Http\FormRequest;

class StorePermissionRequest extends FormRequest {
    public function rules(): array {
        return [
            'name' => 'required|string|max:255',
            'group' => 'required|string|max:255',
        ];
    }
}
