<?php

namespace App\Support\Enums;

enum RoleEnum: string {
    case SUPER_ADMIN = 'Super Admin';
    case SCHOOL_ADMIN = 'School Admin';
    case TEACHER = 'Teacher';
    case STUDENT = 'Student';
}
