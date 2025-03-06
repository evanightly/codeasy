<?php

namespace App\Http\Requests\SchoolRequest;

use App\Rules\SchoolRequest\UniqueTeacherSchoolRequest;
use App\Support\Enums\SchoolRequestStatusEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSchoolRequestRequest extends FormRequest {
    public function rules(): array {
        return [
            'user_id' => 'nullable|exists:users,id',
            'school_id' => ['nullable',
                'exists:schools,id',
                new UniqueTeacherSchoolRequest,
            ],
            'status' => [Rule::enum(SchoolRequestStatusEnum::class)],
            'message' => 'nullable|string',
        ];
    }
}
