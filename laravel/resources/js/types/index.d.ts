import { RoleEnum } from '@/Support/Enums/roleEnum';
import { UserResource } from '@/Support/Interfaces/Resources';

interface AuthenticatedUser extends UserResource {
    roles: RoleEnum[];
    initials: string;
    image: string;
    permissions: PERMISSION_ENUM[];
    administeredSchools: number[];
    teachedSchools: number[];
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
