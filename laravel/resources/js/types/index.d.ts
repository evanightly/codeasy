import { RoleEnum } from '@/Support/Enums/roleEnum';
import { User } from '@/Support/Interfaces/Models';

interface AuthenticatedUser extends User {
    roles: RoleEnum[];
    initials: string;
    image: string;
    permissions: PERMISSION_ENUM[];
    administeredSchools: number[];
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
