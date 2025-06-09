import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { schoolServiceHook } from '@/Services/schoolServiceHook';
import { ROUTES } from '@/Support/Constants/routes';
import { TANSTACK_QUERY_KEYS } from '@/Support/Constants/tanstackQueryKeys';
import { RoleEnum } from '@/Support/Enums/roleEnum';
import { ServiceFilterOptions } from '@/Support/Interfaces/Others';
import { usePage } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { Suspense, useState } from 'react';
import { Schools } from './Partials/Schools';

export default function Index() {
    const { t } = useLaravelReactI18n();
    const { auth } = usePage().props;
    const [filters, setFilters] = useState<ServiceFilterOptions>({
        page: 1,
        page_size: 10,
        sort_by: 'created_at',
        school_resource: 'id,name,address,city,state,phone,email',
        column_filters: (() => {
            if (auth.user.roles.includes(RoleEnum.SCHOOL_ADMIN)) {
                return {
                    'id': auth.user.administeredSchools,
                };
            }
            return {};
        })()
    });

    const schoolsResponse = schoolServiceHook.useGetAll({ filters });

    return (
        <AuthenticatedLayout title={t('pages.school.index.title')}>
            <div className='flex flex-col gap-4'>
                <Suspense fallback={t('action.loading')}>
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
