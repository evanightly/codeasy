<?php

namespace App\Support\Enums;

enum PermissionEnum: string {
    // Users Management
    case USER_CREATE = 'user-create';
    case USER_READ = 'user-read';
    case USER_UPDATE = 'user-update';
    case USER_DELETE = 'user-delete';

    // Permissions Management
    case PERMISSION_CREATE = 'permission-create';
    case PERMISSION_READ = 'permission-read';
    case PERMISSION_UPDATE = 'permission-update';
    case PERMISSION_DELETE = 'permission-delete';

    // Roles Management
    case ROLE_CREATE = 'role-create';
    case ROLE_READ = 'role-read';
    case ROLE_UPDATE = 'role-update';
    case ROLE_DELETE = 'role-delete';

    // Schools Management
    case SCHOOL_CREATE = 'school-create';
    case SCHOOL_READ = 'school-read';
    case SCHOOL_UPDATE = 'school-update';
    case SCHOOL_DELETE = 'school-delete';

    // Students Management
    case STUDENT_CREATE = 'student-create';
    case STUDENT_READ = 'student-read';
    case STUDENT_UPDATE = 'student-update';
    case STUDENT_DELETE = 'student-delete';

    // Teachers Management
    case TEACHER_CREATE = 'teacher-create';
    case TEACHER_READ = 'teacher-read';
    case TEACHER_UPDATE = 'teacher-update';
    case TEACHER_DELETE = 'teacher-delete';

    // Classes Management
    case CLASS_CREATE = 'class-create';
    case CLASS_READ = 'class-read';
    case CLASS_UPDATE = 'class-update';
    case CLASS_DELETE = 'class-delete';

    // Subjects Management
    case SUBJECT_CREATE = 'subject-create';
    case SUBJECT_READ = 'subject-read';
    case SUBJECT_UPDATE = 'subject-update';
    case SUBJECT_DELETE = 'subject-delete';

    // Exams Management
    case EXAM_CREATE = 'exam-create';
    case EXAM_READ = 'exam-read';
    case EXAM_UPDATE = 'exam-update';
    case EXAM_DELETE = 'exam-delete';

    // Results Management
    case RESULT_CREATE = 'result-create';
    case RESULT_READ = 'result-read';
    case RESULT_UPDATE = 'result-update';
    case RESULT_DELETE = 'result-delete';
}
