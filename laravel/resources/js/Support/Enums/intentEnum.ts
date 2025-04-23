const intents = {
    USER_INDEX_STUDENTS: 'user.index.students',
    TEACHER_UPDATE_APPROVE: 'teacher.update.approve',
    SCHOOL_UPDATE_ASSIGN_ADMIN: 'school.update.assign.admin',
    SCHOOL_UPDATE_UNASSIGN_ADMIN: 'school.update.unassign.admin',
    SCHOOL_UPDATE_ASSIGN_TEACHER: 'school.update.assign.teacher',
    SCHOOL_UPDATE_UNASSIGN_TEACHER: 'school.update.unassign.teacher',
    SCHOOL_REQUEST_UPDATE_APPROVE_TEACHER: 'school.request.update.approve.teacher',
    SCHOOL_REQUEST_UPDATE_REJECT_TEACHER: 'school.request.update.reject.teacher',
    CLASS_ROOM_UPDATE_ASSIGN_STUDENT: 'classroom.update.assign.student',
    CLASS_ROOM_UPDATE_UNASSIGN_STUDENT: 'classroom.update.unassign.student',
    SCHOOL_UPDATE_ASSIGN_STUDENT: 'school.update.assign.student',
    SCHOOL_UPDATE_UNASSIGN_STUDENT: 'school.update.unassign.student',
    USER_INDEX_CLASS_ROOM_STUDENTS: 'user.index.classroom.students',
    COURSE_STORE_IMPORT: 'course.store.import',
    COURSE_INDEX_IMPORT_TEMPLATE: 'course.index.import.template',
    COURSE_STORE_PREVIEW_IMPORT: 'course.store.preview.import',
    DASHBOARD_INDEX_GET_DATA: 'dashboard.index.get.data',
    DASHBOARD_INDEX_GET_STUDENT_COURSE_PROGRESS: 'dashboard.index.get.student.course.progress',
    DASHBOARD_INDEX_GET_STUDENT_MATERIAL_PROGRESS: 'dashboard.index.get.student.material.progress',
    DASHBOARD_INDEX_GET_STUDENT_PROGRESS: 'dashboard.index.get.student.progress',
    DASHBOARD_INDEX_GET_STUDENT_LATEST_WORK: 'dashboard.index.get.student.latest.work',
};

export const IntentEnum = intents;

export type IntentEnum = (typeof intents)[keyof typeof intents];
