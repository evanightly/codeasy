import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Permissions } from '@/Pages/Permission/Partials/Permissions';
import { permissionServiceHook } from '@/Services/permissionServiceHook';
import { ROUTES } from '@/Support/Constants/routes';
import { TANSTACK_QUERY_KEYS } from '@/Support/Constants/tanstackQueryKeys';
import { ServiceFilterOptions } from '@/Support/Interfaces/Others';
import { Suspense, useState } from 'react';

export default function Index() {
    const [filters, setFilters] = useState<ServiceFilterOptions>({
        page: 1,
        perPage: 10,
        sortBy: [['created_at', 'desc']],
        permission_resource: 'name,group'
    });

    const permissionResponse = permissionServiceHook.useGetAll({ filters });

    return (
        <AuthenticatedLayout title="Permission">
            <div className="flex flex-col gap-4">
                <Suspense fallback={'Loading...'}>
                    <Permissions
                        setFilters={setFilters}
                        response={permissionResponse}
                        filters={filters}
                        baseRoute={ROUTES.PERMISSIONS}
                        baseKey={TANSTACK_QUERY_KEYS.PERMISSIONS}
                    />
                </Suspense>
            </div>
        </AuthenticatedLayout>
    );
}
