import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Users } from '@/Pages/User/Partials/Users';
import { userServiceHook } from '@/Services/userServiceHook';
import { ROUTES } from '@/Support/Constants/routes';
import { TANSTACK_QUERY_KEYS } from '@/Support/Constants/tanstackQueryKeys';
import { ServiceFilterOptions } from '@/Support/Interfaces/Others';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { Suspense, useState } from 'react';

export default function Index() {
    const { t } = useLaravelReactI18n();
    const [filters, setFilters] = useState<ServiceFilterOptions>({
        page: 1,
        perPage: 10,
        sortBy: [['created_at', 'desc']],
        user_resource: 'id,name,username,email',
    });

    const usersResponse = userServiceHook.useGetAll({ filters });

    return (
        <AuthenticatedLayout title='Users'>
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
