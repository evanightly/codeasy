<?php

namespace App\Support\Enums;

use App\Traits\Enums\Arrayable;

enum RoleEnum: string {
    use Arrayable;

    case SUPER_ADMIN = 'super_admin'; // Was 'Super Admin'
    case SCHOOL_ADMIN = 'school_admin'; // Was 'School Admin'
    case TEACHER = 'teacher'; // Was 'Teacher'
    case STUDENT = 'student'; // Was 'Student'
}
