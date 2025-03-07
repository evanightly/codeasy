<?php

namespace App\Http\Requests\SchoolRequest;

use App\Rules\SchoolRequest\UniqueTeacherSchoolRequest;
use Illuminate\Foundation\Http\FormRequest;

class StoreSchoolRequestRequest extends FormRequest {
    public function rules(): array {
        return [
            'user_id' => 'required|exists:users,id',
            'school_id' => ['required',
                'exists:schools,id',
                new UniqueTeacherSchoolRequest,
            ],
            // 'status' => [Rule::enum(SchoolRequestStatusEnum::class)],
            'message' => 'required|string',
        ];
    }
}
