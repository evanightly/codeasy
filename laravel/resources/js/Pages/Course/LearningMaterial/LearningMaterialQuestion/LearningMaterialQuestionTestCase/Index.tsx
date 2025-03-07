import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/card';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { learningMaterialQuestionTestCaseServiceHook } from '@/Services/learningMaterialQuestionTestCaseServiceHook';
import { ROUTES } from '@/Support/Constants/routes';
import { TANSTACK_QUERY_KEYS } from '@/Support/Constants/tanstackQueryKeys';
import { ServiceFilterOptions } from '@/Support/Interfaces/Others';
import {
    CourseResource,
    LearningMaterialQuestionResource,
    LearningMaterialResource,
} from '@/Support/Interfaces/Resources';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useState } from 'react';
import { TestCases } from './Partials/TestCases';

interface Props {
    question: {
        data: LearningMaterialQuestionResource;
    };
    course: {
        data: CourseResource;
    };
    learningMaterial: {
        data: LearningMaterialResource;
    };
}

export default function Index({
    question: { data: question },
    course: { data: course },
    learningMaterial: { data: learningMaterial },
}: Props) {
    const { t } = useLaravelReactI18n();

    const [filters, setFilters] = useState<ServiceFilterOptions>({
        page: 1,
        perPage: 10,
        sortBy: [['created_at', 'desc']],
        learning_material_question_test_case_resource: 'id,description,input,hidden,active',
        column_filters: {
            learning_material_question_id: question.id,
        },
    });

    const testCasesResponse = learningMaterialQuestionTestCaseServiceHook.useGetAll({ filters });

    if (!question) return null;
   
    return (
        <AuthenticatedLayout title={t('pages.learning_material_question_test_case.index.title')}>
            <Card>
                <CardHeader>
                    <CardTitle>
                        {t('pages.learning_material_question_test_case.index.title')} -{' '}
                        {question.title}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <TestCases
                        setFilters={setFilters}
                        response={testCasesResponse}
                        questionId={question.id}
                        learningMaterialId={learningMaterial.id}
                        filters={filters}
                        courseId={course.id}
                        baseRoute={ROUTES.COURSE_LEARNING_MATERIAL_QUESTION_TEST_CASES}
                        baseKey={TANSTACK_QUERY_KEYS.COURSE_LEARNING_MATERIAL_QUESTION_TEST_CASES}
                    />
                </CardContent>
            </Card>
        </AuthenticatedLayout>
    );
}
