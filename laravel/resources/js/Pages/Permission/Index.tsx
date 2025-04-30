import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Permissions } from '@/Pages/Permission/Partials/Permissions';
import { permissionServiceHook } from '@/Services/permissionServiceHook';
import { ROUTES } from '@/Support/Constants/routes';
import { TANSTACK_QUERY_KEYS } from '@/Support/Constants/tanstackQueryKeys';
import { ServiceFilterOptions } from '@/Support/Interfaces/Others';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { Suspense, useState } from 'react';

export default function Index() {
    const { t } = useLaravelReactI18n();
    const [filters, setFilters] = useState<ServiceFilterOptions>({
        page: 1,
        page_size: 10,
        sort_by: 'created_at',
    });

    const permissionsResponse = permissionServiceHook.useGetAll({ filters });

    return (
        <AuthenticatedLayout title={t('pages.permission.index.title')}>
            <div className='flex flex-col gap-4'>
                <Suspense fallback={t('action.loading')}>
                    <Permissions
                        setFilters={setFilters}
                        response={permissionsResponse}
                        filters={filters}
                        baseRoute={ROUTES.PERMISSIONS}
                        baseKey={TANSTACK_QUERY_KEYS.PERMISSIONS}
                    />
                </Suspense>
            </div>
        </AuthenticatedLayout>
    );
}
