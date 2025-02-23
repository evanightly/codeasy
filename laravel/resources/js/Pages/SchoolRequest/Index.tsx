import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { SchoolRequests } from '@/Pages/SchoolRequest/Partials/SchoolRequests';
import { schoolRequestServiceHook } from '@/Services/schoolRequestServiceHook';
import { ROUTES } from '@/Support/Constants/routes';
import { TANSTACK_QUERY_KEYS } from '@/Support/Constants/tanstackQueryKeys';
import { ServiceFilterOptions } from '@/Support/Interfaces/Others';
import { Suspense, useState } from 'react';

export default function Index() {
    const [filters, setFilters] = useState<ServiceFilterOptions>({
        page: 1,
        perPage: 10,
        sortBy: [['created_at', 'desc']],
        school_request_resource: 'id,user_id,school_id,status,message,user,school',
        relations: 'user,school',
    });

    const requestsResponse = schoolRequestServiceHook.useGetAll({ filters });

    return (
        <AuthenticatedLayout title='School Requests'>
            <div className='flex flex-col gap-4'>
                <Suspense fallback={'Loading...'}>
                    <SchoolRequests
                        setFilters={setFilters}
                        response={requestsResponse}
                        filters={filters}
                        baseRoute={ROUTES.SCHOOL_REQUESTS}
                        baseKey={TANSTACK_QUERY_KEYS.SCHOOL_REQUESTS}
                    />
                </Suspense>
            </div>
        </AuthenticatedLayout>
    );
}
