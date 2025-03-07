<?php

namespace App\Rules\SchoolRequest;

use App\Models\SchoolRequest;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Support\Facades\Auth;

class UniqueTeacherSchoolRequest implements ValidationRule {
    /**
     * Run the validation rule.
     *
     * @param  \Closure(string, ?string=): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void {
        $user = Auth::user();
        // Check if there's an existing pending or approved request for this school by this user
        $existingRequest = SchoolRequest::whereUserId($user->id)
            ->whereSchoolId($value)
            ->exists();

        if ($existingRequest) {
            $fail(__('pages.school_request.common.messages.error.already_requested'));
        }
    }
}
