const intents = {
    TEACHER_UPDATE_APPROVE: 'teacher.update.approve',
    SCHOOL_UPDATE_ASSIGN_ADMIN: 'school.update.assign.admin',
    SCHOOL_UPDATE_UNASSIGN_ADMIN: 'school.update.unassign.admin',
    SCHOOL_UPDATE_ASSIGN_TEACHER: 'school.update.assign.teacher',
    SCHOOL_UPDATE_UNASSIGN_TEACHER: 'school.update.unassign.teacher',
    SCHOOL_REQUEST_UPDATE_APPROVE_TEACHER: 'school.request.update.approve.teacher',
    SCHOOL_REQUEST_UPDATE_REJECT_TEACHER: 'school.request.update.reject.teacher',
};

export const IntentEnum = intents;

export type IntentEnum = (typeof intents)[keyof typeof intents];
