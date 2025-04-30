import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/UI/tabs';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { learningMaterialServiceHook } from '@/Services/learningMaterialServiceHook';
import { ROUTES } from '@/Support/Constants/routes';
import { TANSTACK_QUERY_KEYS } from '@/Support/Constants/tanstackQueryKeys';
import { ServiceFilterOptions } from '@/Support/Interfaces/Others';
import { CourseResource } from '@/Support/Interfaces/Resources';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useState } from 'react';
import { LearningMaterials } from './LearningMaterial/Partials/LearningMaterials';
import { CourseDetails } from './Partials/CourseDetails';

interface Props {
    data: {
        data: CourseResource;
    };
}

export default function Show({ data: { data } }: Props) {
    const { t } = useLaravelReactI18n();

    const [filters, setFilters] = useState<ServiceFilterOptions>({
        page: 1,
        page_size: 10,
        sort_by: 'order_number',
        sort_dir: 'desc',
        learning_material_resource:
            'id,title,description,type,order_number,active,file,file_extension,file_url',
        column_filters: {
            course_id: data.id,
        },
    });

    const learningMaterialsResponse = learningMaterialServiceHook.useGetAll({ filters });

    if (!data) return null;

    return (
        <AuthenticatedLayout title={t('pages.course.show.title')}>
            <Card>
                <CardHeader>
                    <CardTitle>{data.name}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue='details'>
                        <TabsList>
                            <TabsTrigger value='details'>
                                {t('pages.course.show.sections.information')}
                            </TabsTrigger>
                            <TabsTrigger value='materials'>
                                {t('pages.course.show.sections.learning_materials')}
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value='details'>
                            <CourseDetails course={data} />
                        </TabsContent>
                        <TabsContent value='materials'>
                            <LearningMaterials
                                setFilters={setFilters}
                                response={learningMaterialsResponse}
                                filters={filters}
                                courseId={data.id}
                                baseRoute={ROUTES.COURSE_LEARNING_MATERIALS}
                                baseKey={TANSTACK_QUERY_KEYS.COURSE_LEARNING_MATERIALS}
                            />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </AuthenticatedLayout>
    );
}
