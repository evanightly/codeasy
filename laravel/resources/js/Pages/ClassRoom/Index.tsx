import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { classRoomServiceHook } from '@/Services/classRoomServiceHook';
import { ROUTES } from '@/Support/Constants/routes';
import { TANSTACK_QUERY_KEYS } from '@/Support/Constants/tanstackQueryKeys';
import { RoleEnum } from '@/Support/Enums/roleEnum';
import { ServiceFilterOptions } from '@/Support/Interfaces/Others';
import { usePage } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { Suspense, useState } from 'react';
import { Classrooms } from './Partials/Classrooms';

export default function Index() {
    const { roles, teachedSchools, administeredSchools } = usePage().props.auth.user;
    const { t } = useLaravelReactI18n();

    const [filters, setFilters] = useState<ServiceFilterOptions>({
        page: 1,
        page_size: 10,
        sort_by: 'created_at',
        class_room_resource: 'id,name,description,grade,year,active,school',
        relations: 'school',
        column_filters: (() => {
            if (roles.includes(RoleEnum.SCHOOL_ADMIN)) {
                return {
                    school_id: administeredSchools.length > 0 ? administeredSchools : -1,
                };
            }

            // Single role logic
            if (roles.includes(RoleEnum.TEACHER)) {
                if (teachedSchools.length === 0) {
                    return {
                        school_id: -1,
                    };
                }
                return {
                    school_id: teachedSchools,
                    // , active: 1
                };
            }

            return {};
        })(),
        school_resource: 'name',
    });

    const classRoomResponse = classRoomServiceHook.useGetAll({ filters });

    return (
        <AuthenticatedLayout title={t('pages.classroom.index.title')}>
            <div className='flex flex-col gap-4'>
                <Suspense fallback={t('action.loading')}>
                    <Classrooms
                        setFilters={setFilters}
                        response={classRoomResponse}
                        filters={filters}
                        baseRoute={ROUTES.CLASS_ROOMS}
                        baseKey={TANSTACK_QUERY_KEYS.CLASS_ROOMS}
                    />
                </Suspense>
            </div>
        </AuthenticatedLayout>
    );
}
