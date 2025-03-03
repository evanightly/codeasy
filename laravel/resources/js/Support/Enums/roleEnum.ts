const roles = {
    SUPER_ADMIN: 'super_admin',
    SCHOOL_ADMIN: 'school_admin',
    TEACHER: 'teacher',
    STUDENT: 'student',
};

export const RoleEnum = roles;

export type RoleEnum = (typeof roles)[keyof typeof roles];
