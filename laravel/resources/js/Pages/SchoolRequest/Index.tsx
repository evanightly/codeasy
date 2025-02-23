import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { SchoolRequests } from '@/Pages/SchoolRequest/Partials/SchoolRequests';
import { schoolRequestServiceHook } from '@/Services/schoolRequestServiceHook';
import { ROUTES } from '@/Support/Constants/routes';
import { TANSTACK_QUERY_KEYS } from '@/Support/Constants/tanstackQueryKeys';
import { ServiceFilterOptions } from '@/Support/Interfaces/Others';
import { usePage } from '@inertiajs/react';
import { Suspense, useState } from 'react';

export default function Index() {
    const { user } = usePage().props.auth;

    const [filters, setFilters] = useState<ServiceFilterOptions>({
        page: 1,
        perPage: 10,
        sortBy: [['created_at', 'desc']],
        school_request_resource: 'id,user_id,school_id,status,message,user,school',
        relations: 'user,school',
        column_filters: {
            user_id: user.id,
        },
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
