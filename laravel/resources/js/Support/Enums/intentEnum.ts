const intents = {
    TEACHER_UPDATE_APPROVE: 'teacher.update.approve',
    SCHOOL_UPDATE_ASSIGN_ADMIN: 'school.update.assign.admin',
    SCHOOL_UPDATE_UNASSIGN_ADMIN: 'school.update.unassign.admin',
    SCHOOL_UPDATE_ASSIGN_TEACHER: 'school.update.assign.teacher',
    SCHOOL_UPDATE_UNASSIGN_TEACHER: 'school.update.unassign.teacher',
};

export const IntentEnum = intents;

export type IntentEnum = (typeof intents)[keyof typeof intents];
