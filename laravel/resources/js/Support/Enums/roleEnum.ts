const roles = {
    SUPER_ADMIN: 'Super Admin',
};

export const RoleEnum = roles;

export type RoleEnum = (typeof roles)[keyof typeof roles];
