<?php

namespace App\Support\Enums;

enum IntentEnum: string {
    case USER_INDEX_STUDENTS = 'user.index.students';
    case TEACHER_UPDATE_APPROVE = 'teacher.update.approve';
    case SCHOOL_UPDATE_ASSIGN_ADMIN = 'school.update.assign.admin';
    case SCHOOL_UPDATE_UNASSIGN_ADMIN = 'school.update.unassign.admin';
    case SCHOOL_UPDATE_ASSIGN_TEACHER = 'school.update.assign.teacher';
    case SCHOOL_UPDATE_UNASSIGN_TEACHER = 'school.update.unassign.teacher';
    case SCHOOL_REQUEST_UPDATE_APPROVE_TEACHER = 'school.request.update.approve.teacher';
    case SCHOOL_REQUEST_UPDATE_REJECT_TEACHER = 'school.request.update.reject.teacher';
    case CLASS_ROOM_UPDATE_ASSIGN_STUDENT = 'classroom.update.assign.student';
    case CLASS_ROOM_UPDATE_UNASSIGN_STUDENT = 'classroom.update.unassign.student';
    case SCHOOL_UPDATE_ASSIGN_STUDENT = 'school.update.assign.student';
    case SCHOOL_UPDATE_UNASSIGN_STUDENT = 'school.update.unassign.student';
    case USER_INDEX_CLASS_ROOM_STUDENTS = 'user.index.classroom.students';
    case COURSE_STORE_IMPORT = 'course.store.import';
    case COURSE_INDEX_IMPORT_TEMPLATE = 'course.index.import.template';
}
