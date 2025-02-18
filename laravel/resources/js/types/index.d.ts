export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    image_url: string;
    image_path: string;
}

interface AuthenticatedUser extends User {
    role: string;
    initials: string;
    image: string;
    permissions: PERMISSION_ENUM[];
}

export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
    env: {
        appName: string;
        appEnv: string;
    };
    auth: {
        user: AuthenticatedUser;
    };
};
