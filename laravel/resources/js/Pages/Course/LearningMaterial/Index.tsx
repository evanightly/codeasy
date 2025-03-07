import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/card';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { learningMaterialServiceHook } from '@/Services/learningMaterialServiceHook';
import { ROUTES } from '@/Support/Constants/routes';
import { TANSTACK_QUERY_KEYS } from '@/Support/Constants/tanstackQueryKeys';
import { ServiceFilterOptions } from '@/Support/Interfaces/Others';
import { CourseResource } from '@/Support/Interfaces/Resources';
import { Head } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useState } from 'react';
import { LearningMaterials } from './Partials/LearningMaterials';

interface Props {
    course: CourseResource;
}

export default function Index({ course }: Props) {
    const { t } = useLaravelReactI18n();
    const [filters, setFilters] = useState<ServiceFilterOptions>({
        page: 1,
        perPage: 10,
        sortBy: [['order_number', 'asc']],
        learning_material_resource: 'id,title,description,type,order_number,active',
        column_filters: {
            course_id: course.id,
        },
    });

    // Use the service hook instead of mock data
    const learningMaterialsResponse = learningMaterialServiceHook.useGetAll({ filters });

    return (
        <AuthenticatedLayout title={`${course.name} - ${t('pages.learning_material.index.title')}`}>
            <Head title={`${course.name} - ${t('pages.learning_material.index.title')}`} />

            <Card>
                <CardHeader className='flex flex-col items-start justify-between sm:flex-row sm:items-center'>
                    <CardTitle>
                        {t('pages.learning_material.index.title')} - {course.name}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <LearningMaterials
                        setFilters={setFilters}
                        response={learningMaterialsResponse}
                        filters={filters}
                        courseId={course.id}
                        baseRoute={`${ROUTES.COURSE_LEARNING_MATERIALS}`}
                        baseKey={TANSTACK_QUERY_KEYS.COURSE_LEARNING_MATERIALS}
                    />
                </CardContent>
            </Card>
        </AuthenticatedLayout>
    );
}
