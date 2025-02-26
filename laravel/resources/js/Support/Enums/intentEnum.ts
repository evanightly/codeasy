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
};

export const IntentEnum = intents;

export type IntentEnum = (typeof intents)[keyof typeof intents];
