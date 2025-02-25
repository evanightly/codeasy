<?php

namespace App\Support\Enums;

enum IntentEnum: string {
    case TEACHER_UPDATE_APPROVE = 'teacher.update.approve';
    case SCHOOL_UPDATE_ASSIGN_ADMIN = 'school.update.assign.admin';
    case SCHOOL_UPDATE_UNASSIGN_ADMIN = 'school.update.unassign.admin';
    case SCHOOL_UPDATE_ASSIGN_TEACHER = 'school.update.assign.teacher';
    case SCHOOL_UPDATE_UNASSIGN_TEACHER = 'school.update.unassign.teacher';
    case SCHOOL_REQUEST_UPDATE_APPROVE_TEACHER = 'school.request.update.approve.teacher';
    case SCHOOL_REQUEST_UPDATE_REJECT_TEACHER = 'school.request.update.reject.teacher';
}
