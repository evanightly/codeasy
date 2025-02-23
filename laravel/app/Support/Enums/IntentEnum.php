<?php

namespace App\Support\Enums;

enum IntentEnum: string {
    case TEACHER_UPDATE_APPROVE = 'teacher.update.approve';
    case SCHOOL_UPDATE_ASSIGN_ADMIN = 'school.update.assign.admin';
    case SCHOOL_UPDATE_ASSIGN_TEACHER = 'school.update.assign.teacher';
}
