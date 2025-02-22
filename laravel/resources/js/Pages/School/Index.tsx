import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { schoolServiceHook } from '@/Services/schoolServiceHook';
import { ROUTES } from '@/Support/Constants/routes';
import { TANSTACK_QUERY_KEYS } from '@/Support/Constants/tanstackQueryKeys';
import { ServiceFilterOptions } from '@/Support/Interfaces/Others';
import { Suspense, useState } from 'react';
import { Schools } from './Partials/Schools';

export default function Index() {
    const [filters, setFilters] = useState<ServiceFilterOptions>({
        page: 1,
        perPage: 10,
        sortBy: [['created_at', 'desc']],
        school_resource: 'id,name,address,city,state,phone,email',
    });

    const schoolsResponse = schoolServiceHook.useGetAll({ filters });

    return (
        <AuthenticatedLayout title='Schools'>
            <div className='flex flex-col gap-4'>
                <Suspense fallback={'Loading...'}>
                    <Schools
                        setFilters={setFilters}
                        response={schoolsResponse}
                        filters={filters}
                        baseRoute={ROUTES.SCHOOLS}
                        baseKey={TANSTACK_QUERY_KEYS.SCHOOLS}
                    />
                </Suspense>
            </div>
        </AuthenticatedLayout>
    );
}
