import { Tabs, TabsList, TabsTrigger } from '@/Components/UI/tabs';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { SchoolRequests } from '@/Pages/SchoolRequest/Partials/SchoolRequests';
import { schoolRequestServiceHook } from '@/Services/schoolRequestServiceHook';
import { ROUTES } from '@/Support/Constants/routes';
import { TANSTACK_QUERY_KEYS } from '@/Support/Constants/tanstackQueryKeys';
import { RoleEnum } from '@/Support/Enums/roleEnum';
import { SchoolRequestStatusEnum } from '@/Support/Enums/schoolRequestStatusEnum';
import { ServiceFilterOptions } from '@/Support/Interfaces/Others';
import { usePage } from '@inertiajs/react';
import { Suspense, useState } from 'react';

export default function Index() {
    const { user } = usePage().props.auth;
    const hasMultipleRoles =
        user.roles.includes(RoleEnum.TEACHER) && user.roles.includes(RoleEnum.SCHOOL_ADMIN);

    const [activeTab, setActiveTab] = useState(
        user.roles.includes(RoleEnum.TEACHER) ? RoleEnum.TEACHER : RoleEnum.SCHOOL_ADMIN,
    );

    const [filters, setFilters] = useState<ServiceFilterOptions>({
        page: 1,
        page_size: 10,
        sort_by: 'created_at',
        school_request_resource: 'id,user_id,school_id,status,message,user,school',
        relations: 'user,school',
        column_filters: (() => {
            if (user.roles.includes(RoleEnum.SUPER_ADMIN)) {
                return undefined;
            }

            // If user has both roles, use activeTab to determine filters
            if (hasMultipleRoles) {
                if (activeTab === RoleEnum.TEACHER) {
                    return { user_id: user.id };
                } else {
                    return !user.administeredSchools?.length
                        ? { id: -1 }
                        : {
                              status: SchoolRequestStatusEnum.PENDING,
                              school_id: user.administeredSchools,
                          };
                }
            }

            // Single role logic
            if (user.roles.includes(RoleEnum.TEACHER)) {
                return { user_id: user.id };
            }

            if (user.roles.includes(RoleEnum.SCHOOL_ADMIN)) {
                return !user.administeredSchools?.length
                    ? { id: -1 }
                    : {
                          status: SchoolRequestStatusEnum.PENDING,
                          school_id: user.administeredSchools,
                      };
            }

            return {};
        })(),
    });

    // Update filters when tab changes
    const handleTabChange = (value: string) => {
        setActiveTab(value);
        setFilters((prev) => ({
            ...prev,
            column_filters:
                value === RoleEnum.TEACHER
                    ? { user_id: user.id }
                    : !user.administeredSchools?.length
                      ? { id: -1 }
                      : {
                            status: SchoolRequestStatusEnum.PENDING,
                            school_id: user.administeredSchools,
                        },
        }));
    };

    const requestsResponse = schoolRequestServiceHook.useGetAll({ filters });

    return (
        <AuthenticatedLayout title='School Requests'>
            <div className='flex flex-col gap-4'>
                {!user.roles.includes(RoleEnum.SUPER_ADMIN) && hasMultipleRoles && (
                    <Tabs
                        onValueChange={handleTabChange}
                        defaultValue={activeTab}
                        className='w-[400px]'
                    >
                        <TabsList>
                            <TabsTrigger value={RoleEnum.TEACHER}>My Requests</TabsTrigger>
                            <TabsTrigger value={RoleEnum.SCHOOL_ADMIN}>School Requests</TabsTrigger>
                        </TabsList>
                    </Tabs>
                )}
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
