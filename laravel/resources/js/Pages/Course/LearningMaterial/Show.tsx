import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/UI/tabs';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { learningMaterialQuestionServiceHook } from '@/Services/learningMaterialQuestionServiceHook';
import { ROUTES } from '@/Support/Constants/routes';
import { TANSTACK_QUERY_KEYS } from '@/Support/Constants/tanstackQueryKeys';
import { LearningMaterialTypeEnum } from '@/Support/Enums/learningMaterialTypeEnum';
import { ServiceFilterOptions } from '@/Support/Interfaces/Others';
import { CourseResource, LearningMaterialResource } from '@/Support/Interfaces/Resources';
import { Head } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useState } from 'react';
import { Questions } from './LearningMaterialQuestion/Partials/Questions';
import { LearningMaterialDetails } from './Partials/LearningMaterialDetails';

interface Props {
    course: { data: CourseResource };
    learningMaterial: { data: LearningMaterialResource };
}

export default function Show({
    course: { data: course },
    learningMaterial: { data: learningMaterial },
}: Props) {
    const { t } = useLaravelReactI18n();

    const [filters, setFilters] = useState<ServiceFilterOptions>({
        page: 1,
        perPage: 10,
        sortBy: [['order_number', 'asc']],
        learning_material_question_resource: 'id,title,description,type,order_number,active',
        column_filters: {
            learning_material_id: learningMaterial.id,
        },
    });

    // Use the service hook instead of mock data
    const questionsResponse = learningMaterialQuestionServiceHook.useGetAll({ filters });

    if (!learningMaterial) return null;

    const showQuestionsTab = [LearningMaterialTypeEnum.LIVE_CODE].includes(
        learningMaterial.type as LearningMaterialTypeEnum,
    );

    return (
        <AuthenticatedLayout title={learningMaterial.title}>
            <Head title={`${course.name} - ${learningMaterial.title}`} />

            <Card>
                <CardHeader>
                    <CardTitle>{learningMaterial.title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue='details'>
                        <TabsList>
                            <TabsTrigger value='details'>
                                {t('pages.learning_material.show.sections.information')}
                            </TabsTrigger>
                            {showQuestionsTab && (
                                <TabsTrigger value='questions'>
                                    {t('pages.learning_material.show.sections.questions')}
                                </TabsTrigger>
                            )}
                        </TabsList>
                        <TabsContent value='details'>
                            <LearningMaterialDetails material={learningMaterial} course={course} />
                        </TabsContent>
                        {showQuestionsTab && (
                            <TabsContent value='questions'>
                                <Questions
                                    setFilters={setFilters}
                                    response={questionsResponse}
                                    materialType={learningMaterial.type as LearningMaterialTypeEnum}
                                    materialId={learningMaterial.id}
                                    filters={filters}
                                    courseId={course.id}
                                    baseRoute={`${ROUTES.COURSE_LEARNING_MATERIAL_QUESTIONS}`}
                                    baseKey={TANSTACK_QUERY_KEYS.COURSE_LEARNING_MATERIAL_QUESTIONS}
                                />
                            </TabsContent>
                        )}
                    </Tabs>
                </CardContent>
            </Card>
        </AuthenticatedLayout>
    );
}
