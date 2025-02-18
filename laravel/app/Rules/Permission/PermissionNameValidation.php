<?php

namespace App\Rules\Permission;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class PermissionNameValidation implements ValidationRule {
    /**
     * Run the validation rule.
     *
     * @param  \Closure(string, ?string=): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void {
        $pattern = '/^[a-z]+(?:-[a-z]+)*(?:\s[a-z]+(?:-[a-z]+)*)*$/';

        if (!preg_match($pattern, $value)) {
            $fail(__('validation.regex', ['attribute' => $attribute]));
        }
    }
}
