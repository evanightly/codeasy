import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { courseServiceHook } from '@/Services/courseServiceHook';
import { ROUTES } from '@/Support/Constants/routes';
import { TANSTACK_QUERY_KEYS } from '@/Support/Constants/tanstackQueryKeys';
import { RoleEnum } from '@/Support/Enums/roleEnum';
import { ServiceFilterOptions } from '@/Support/Interfaces/Others';
import { usePage } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { Suspense, useState } from 'react';
import { Courses } from './Partials/Courses';

export default function Index() {
    const { roles, id } = usePage().props.auth.user;
    const { t } = useLaravelReactI18n();

    const [filters, setFilters] = useState<ServiceFilterOptions>({
        page: 1,
        perPage: 10,
        sortBy: [['created_at', 'desc']],
        course_resource: 'id,name,description,active,class_room_id,teacher_id,classroom,teacher',
        relations: 'classroom,teacher',
        column_filters: (() => {
            if (roles.includes(RoleEnum.SUPER_ADMIN)) {
                return undefined;
            }

            if (roles.includes(RoleEnum.TEACHER)) {
                return {
                    teacher_id: id,
                };
            }

            return {};
        })(),
        class_room_resource: 'name',
        user_resource: 'name',
    });

    const courseResponse = courseServiceHook.useGetAll({ filters });

    return (
        <AuthenticatedLayout title={t('pages.course.index.title')}>
            <div className='flex flex-col gap-4'>
                <Suspense fallback={t('action.loading')}>
                    <Courses
                        setFilters={setFilters}
                        response={courseResponse}
                        filters={filters}
                        baseRoute={ROUTES.COURSES}
                        baseKey={TANSTACK_QUERY_KEYS.COURSES}
                    />
                </Suspense>
            </div>
        </AuthenticatedLayout>
    );
}
