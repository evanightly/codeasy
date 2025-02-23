const intents = {
    TEACHER_UPDATE_APPROVE: 'teacher.update.approve',
    SCHOOL_UPDATE_ASSIGN_ADMIN: 'school.update.assign.admin',
    SCHOOL_UPDATE_ASSIGN_TEACHER: 'school.update.assign.teacher',
};

export const IntentEnum = intents;

export type IntentEnum = (typeof intents)[keyof typeof intents];
