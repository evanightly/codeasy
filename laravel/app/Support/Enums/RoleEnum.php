<?php

namespace App\Support\Enums;

use App\Traits\Enums\Arrayable;

enum RoleEnum: string {
    use Arrayable;

    case SUPER_ADMIN = 'Super Admin';
    case SCHOOL_ADMIN = 'School Admin';
    case TEACHER = 'Teacher';
    case STUDENT = 'Student';
}
