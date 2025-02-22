<?php

namespace App\Http\Requests\SchoolRequest;

use Illuminate\Foundation\Http\FormRequest;

class StoreSchoolRequestRequest extends FormRequest {
    public function rules(): array {
        return [
            'user_id' => 'required|exists:users,id',
            'school_id' => 'required|exists:schools,id',
            // 'status' => [Rule::enum(SchoolRequestStatusEnum::class)],
            'message' => 'required|string',
        ];
    }
}
