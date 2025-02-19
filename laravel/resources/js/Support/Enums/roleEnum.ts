const roles = {
    SUPER_ADMIN: 'Super Admin',
    SCHOOL_ADMIN: 'School Admin',
    TEACHER: 'Teacher',
    STUDENT: 'Student',
};

export const RoleEnum = roles;

export type RoleEnum = (typeof roles)[keyof typeof roles];
