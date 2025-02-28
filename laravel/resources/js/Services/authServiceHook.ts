import { createMutation, mutationApi } from '@/Helpers';
import { ROUTES } from '@/Support/Constants/routes';
import { TANSTACK_QUERY_KEYS } from '@/Support/Constants/tanstackQueryKeys';
import { UserResource } from '@/Support/Interfaces/Resources';

const baseKey = TANSTACK_QUERY_KEYS.AUTH;

interface RegisterData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role: string;
    school_id: number | null;
}

interface LoginData {
    email: string; // Can contain either email or username
    password: string;
    remember?: boolean;
}

export const authServiceHook = {
    useRegister: () => {
        return createMutation({
            mutationFn: async (params: { data: RegisterData }) => {
                return mutationApi({
                    method: 'post',
                    url: route('register'),
                    data: params.data,
                });
            },
        });
    },

    useLogin: () => {
        return createMutation({
            mutationFn: async (params: { data: LoginData }) => {
                return mutationApi({
                    method: 'post',
                    url: route('login'),
                    data: params.data,
                });
            },
        });
    },

    useLogout: () => {
        return createMutation({
            mutationFn: async () => {
                return mutationApi({
                    method: 'post',
                    url: route('logout'),
                });
            },
        });
    },

    useForgotPassword: () => {
        return createMutation({
            mutationFn: async (params: { data: { email: string } }) => {
                return mutationApi({
                    method: 'post',
                    url: route('password.email'),
                    data: params.data,
                });
            },
        });
    },

    useResetPassword: () => {
        return createMutation({
            mutationFn: async (params: {
                data: {
                    email: string;
                    password: string;
                    password_confirmation: string;
                    token: string;
                };
            }) => {
                return mutationApi({
                    method: 'post',
                    url: route('password.update'),
                    data: params.data,
                });
            },
        });
    },

    useUpdateProfile: () => {
        return createMutation({
            mutationFn: async (params: { data: Partial<UserResource> }) => {
                return mutationApi({
                    method: 'patch',
                    url: route(`${ROUTES.PROFILE}.update`),
                    data: params.data,
                });
            },
            invalidateQueryKeys: [{ queryKey: [baseKey], exact: false }],
        });
    },
};
