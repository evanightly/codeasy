import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Users } from '@/Pages/User/Partials/Users';
import { userServiceHook } from '@/Services/userServiceHook';
import { ROUTES } from '@/Support/Constants/routes';
import { TANSTACK_QUERY_KEYS } from '@/Support/Constants/tanstackQueryKeys';
import { RoleEnum } from '@/Support/Enums/roleEnum';
import { ServiceFilterOptions } from '@/Support/Interfaces/Others';
import { usePage } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { Suspense, useState } from 'react';

export default function Index() {
    const { t } = useLaravelReactI18n();
    const { user } = usePage().props.auth;
    const [filters, setFilters] = useState<ServiceFilterOptions>({
        page: 1,
        page_size: 10,
        sort_by: 'created_at',
        user_resource: 'id,name,username,email',
        relations_array_filters: (() => {
            if (user.roles.includes(RoleEnum.SCHOOL_ADMIN)) {
                return {
                    schools: user.administeredSchools,
                };
            }

            return undefined;
        })(),
    });

    const usersResponse = userServiceHook.useGetAll({ filters });

    return (
        <AuthenticatedLayout title={t('pages.user.index.title')}>
            <div className='flex flex-col gap-4'>
                <Suspense fallback={t('action.loading')}>
                    <Users
                        setFilters={setFilters}
                        response={usersResponse}
                        filters={filters}
                        baseRoute={ROUTES.USERS}
                        baseKey={TANSTACK_QUERY_KEYS.USERS}
                    />
                </Suspense>
            </div>
        </AuthenticatedLayout>
    );
}
