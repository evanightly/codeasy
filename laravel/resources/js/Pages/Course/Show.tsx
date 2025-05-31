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
import { LockedStudents } from './Partials/LockedStudents';

interface Props {
    data: CourseResource;
}

export default function Show({ data: course }: Props) {
    const { t } = useLaravelReactI18n();

    const [filters, setFilters] = useState<ServiceFilterOptions>({
        page: 1,
        page_size: 10,
        sort_by: 'order_number',
        sort_dir: 'desc',
        learning_material_resource:
            'id,title,description,type,order_number,active,file,file_extension,file_url,full_file_url',
        column_filters: {
            course_id: course.id,
        },
    });

    const learningMaterialsResponse = learningMaterialServiceHook.useGetAll({ filters });

    if (!course) return null;

    return (
        <AuthenticatedLayout title={t('pages.course.show.title')}>
            <Card>
                <CardHeader>
                    <CardTitle>{course.name}</CardTitle>
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
                            <TabsTrigger value='locked_students'>
                                {t('pages.course.show.sections.locked_students')}
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value='details'>
                            <CourseDetails course={course} />
                        </TabsContent>
                        <TabsContent value='materials'>
                            <LearningMaterials
                                setFilters={setFilters}
                                response={learningMaterialsResponse}
                                filters={filters}
                                courseId={course.id}
                                baseRoute={ROUTES.COURSE_LEARNING_MATERIALS}
                                baseKey={TANSTACK_QUERY_KEYS.COURSE_LEARNING_MATERIALS}
                            />
                        </TabsContent>
                        <TabsContent value='locked_students'>
                            <LockedStudents courseId={course.id} />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </AuthenticatedLayout>
    );
}
