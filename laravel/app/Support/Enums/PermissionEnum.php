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

    // School Requests Management
    case SCHOOL_REQUEST_CREATE = 'school-request-create';
    case SCHOOL_REQUEST_READ = 'school-request-read';
    case SCHOOL_REQUEST_UPDATE = 'school-request-update';
    case SCHOOL_REQUEST_DELETE = 'school-request-delete';

    // Class Room Management
    case CLASS_ROOM_CREATE = 'classroom-create';
    case CLASS_ROOM_READ = 'classroom-read';
    case CLASS_ROOM_UPDATE = 'classroom-update';
    case CLASS_ROOM_DELETE = 'classroom-delete';

    // Class Room Student Management
    case CLASS_ROOM_STUDENT_CREATE = 'classroom-student-create';
    case CLASS_ROOM_STUDENT_READ = 'classroom-student-read';
    case CLASS_ROOM_STUDENT_UPDATE = 'classroom-student-update';
    case CLASS_ROOM_STUDENT_DELETE = 'classroom-student-delete';

    // Course Management
    case COURSE_CREATE = 'course-create';
    case COURSE_READ = 'course-read';
    case COURSE_UPDATE = 'course-update';
    case COURSE_DELETE = 'course-delete';

    case LEARNING_MATERIAL_CREATE = 'learning-material-create';
    case LEARNING_MATERIAL_READ = 'learning-material-read';
    case LEARNING_MATERIAL_UPDATE = 'learning-material-update';
    case LEARNING_MATERIAL_DELETE = 'learning-material-delete';

    case LEARNING_MATERIAL_QUESTION_CREATE = 'learning-material-question-create';
    case LEARNING_MATERIAL_QUESTION_READ = 'learning-material-question-read';
    case LEARNING_MATERIAL_QUESTION_UPDATE = 'learning-material-question-update';
    case LEARNING_MATERIAL_QUESTION_DELETE = 'learning-material-question-delete';

    case LEARNING_MATERIAL_QUESTION_TEST_CASE_CREATE = 'learning-material-question-test-case-create';
    case LEARNING_MATERIAL_QUESTION_TEST_CASE_READ = 'learning-material-question-test-case-read';
    case LEARNING_MATERIAL_QUESTION_TEST_CASE_UPDATE = 'learning-material-question-test-case-update';
    case LEARNING_MATERIAL_QUESTION_TEST_CASE_DELETE = 'learning-material-question-test-case-delete';

    case STUDENT_SCORE_CREATE = 'student-score-create';
    case STUDENT_SCORE_READ = 'student-score-read';
    case STUDENT_SCORE_UPDATE = 'student-score-update';
    case STUDENT_SCORE_DELETE = 'student-score-delete';

    case EXECUTION_RESULT_CREATE = 'execution-result-create';
    case EXECUTION_RESULT_READ = 'execution-result-read';
    case EXECUTION_RESULT_UPDATE = 'execution-result-update';
    case EXECUTION_RESULT_DELETE = 'execution-result-delete';
}
