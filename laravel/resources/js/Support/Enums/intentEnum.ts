const intents = {
    TEACHER_UPDATE_APPROVE: 'teacher.update.approve',
};

export const IntentEnum = intents;

export type IntentEnum = (typeof intents)[keyof typeof intents];
