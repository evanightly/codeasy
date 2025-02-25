import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Roles } from '@/Pages/Role/Partials/Roles';
import { roleServiceHook } from '@/Services/roleServiceHook';
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
        role_resource: 'id,name,guard_name,users_count,deletable',
        relations_count: 'users',
    });

    const rolesResponse = roleServiceHook.useGetAll({ filters });

    return (
        <AuthenticatedLayout title={t('pages.role.index.title')}>
            <div className='flex flex-col gap-4'>
                <Suspense fallback={t('action.loading')}>
                    <Roles
                        setFilters={setFilters}
                        response={rolesResponse}
                        filters={filters}
                        baseRoute={ROUTES.ROLES}
                        baseKey={TANSTACK_QUERY_KEYS.ROLES}
                    />
                </Suspense>
            </div>
        </AuthenticatedLayout>
    );
}
