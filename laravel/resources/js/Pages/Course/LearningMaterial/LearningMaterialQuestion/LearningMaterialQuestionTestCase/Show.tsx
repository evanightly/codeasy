import { Badge } from '@/Components/UI/badge';
import { Button } from '@/Components/UI/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/card';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ROUTES } from '@/Support/Constants/routes';
import {
    CourseResource,
    LearningMaterialQuestionResource,
    LearningMaterialQuestionTestCaseResource,
    LearningMaterialResource,
} from '@/Support/Interfaces/Resources';
import { Link } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { CalendarIcon, EyeIcon, EyeOffIcon, FileTextIcon } from 'lucide-react';

interface Props {
    testCase: {
        data: LearningMaterialQuestionTestCaseResource;
    };
    course: {
        data: CourseResource;
    };
    learningMaterial: {
        data: LearningMaterialResource;
    };
    question: {
        data: LearningMaterialQuestionResource;
    };
}

export default function Show({
    testCase: { data: testCase },
    course: { data: course },
    learningMaterial: { data: learningMaterial },
    question: { data: question },
}: Props) {
    const { t } = useLaravelReactI18n();

    if (!testCase) return null;

    return (
        <AuthenticatedLayout title={t('pages.learning_material_question_test_case.show.title')}>
            <Card>
                <CardHeader className='flex flex-row items-center justify-between'>
                    <CardTitle>
                        {t('pages.learning_material_question_test_case.show.title')}
                    </CardTitle>
                    <div className='flex space-x-2'>
                        <Link
                            href={route(
                                `${ROUTES.COURSE_LEARNING_MATERIAL_QUESTION_TEST_CASES}.edit`,
                                [course.id, learningMaterial.id, question.id, testCase.id],
                            )}
                        >
                            <Button variant='outline'>{t('action.edit')}</Button>
                        </Link>
                        <Link
                            href={route(
                                `${ROUTES.COURSE_LEARNING_MATERIAL_QUESTION_TEST_CASES}.index`,
                                [course.id, learningMaterial.id, question.id, testCase.id],
                            )}
                        >
                            <Button variant='outline'>{t('action.back')}</Button>
                        </Link>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className='space-y-6'>
                        <div className='flex flex-col gap-4 md:flex-row md:justify-between'>
                            <div className='flex items-center gap-2'>
                                <Badge variant={testCase.active ? 'success' : 'destructive'}>
                                    {testCase.active
                                        ? t(
                                              'pages.learning_material_question_test_case.common.status.active',
                                          )
                                        : t(
                                              'pages.learning_material_question_test_case.common.status.inactive',
                                          )}
                                </Badge>
                                <Badge variant={testCase.hidden ? 'secondary' : 'outline'}>
                                    {testCase.hidden ? (
                                        <div className='flex items-center gap-1'>
                                            <EyeOffIcon className='h-3 w-3' />
                                            <span>
                                                {t(
                                                    'pages.learning_material_question_test_case.show.hidden',
                                                )}
                                            </span>
                                        </div>
                                    ) : (
                                        <div className='flex items-center gap-1'>
                                            <EyeIcon className='h-3 w-3' />
                                            <span>
                                                {t(
                                                    'pages.learning_material_question_test_case.show.visible',
                                                )}
                                            </span>
                                        </div>
                                    )}
                                </Badge>
                            </div>
                        </div>

                        <div className='space-y-4'>
                            <h3 className='text-lg font-medium'>
                                {t(
                                    'pages.learning_material_question_test_case.show.sections.details',
                                )}
                            </h3>

                            <div className='flex items-start gap-2'>
                                <FileTextIcon className='mt-1 h-5 w-5 text-muted-foreground' />
                                <div>
                                    <span className='block font-semibold'>
                                        {t(
                                            'pages.learning_material_question_test_case.common.fields.description',
                                        )}
                                        :
                                    </span>
                                    <p className='mt-1 whitespace-pre-line'>
                                        {testCase.description}
                                    </p>
                                </div>
                            </div>

                            {testCase.input && (
                                <div className='mt-4'>
                                    <div className='flex items-start gap-2'>
                                        <FileTextIcon className='mt-1 h-5 w-5 text-muted-foreground' />
                                        <div>
                                            <span className='block font-semibold'>
                                                {t(
                                                    'pages.learning_material_question_test_case.common.fields.input',
                                                )}
                                                :
                                            </span>
                                            <pre className='mt-1 overflow-x-auto rounded bg-muted p-2 text-sm'>
                                                {testCase.input}
                                            </pre>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {testCase.expected_output_file && (
                                <div className='mt-4'>
                                    <div className='flex items-start gap-2'>
                                        <FileTextIcon className='mt-1 h-5 w-5 text-muted-foreground' />
                                        <div>
                                            <span className='block font-semibold'>
                                                {t(
                                                    'pages.learning_material_question_test_case.common.fields.expected_output',
                                                )}
                                                :
                                            </span>
                                            <div className='mt-1'>
                                                <a
                                                    target='_blank'
                                                    rel='noreferrer'
                                                    href={testCase.expected_output_file_url}
                                                    className='text-primary hover:underline'
                                                >
                                                    {t('action.view_file')}
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {(testCase.created_at || testCase.updated_at) && (
                            <div className='space-y-4 border-t pt-4'>
                                <h3 className='text-lg font-medium'>
                                    {t('pages.common.columns.timestamps')}
                                </h3>
                                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                                    {testCase.created_at && (
                                        <div className='flex items-center gap-2'>
                                            <CalendarIcon className='h-5 w-5 text-muted-foreground' />
                                            <span className='font-semibold'>
                                                {t('pages.common.columns.created_at')}:
                                            </span>
                                            <span>
                                                {new Date(testCase.created_at).toLocaleString()}
                                            </span>
                                        </div>
                                    )}
                                    {testCase.updated_at && (
                                        <div className='flex items-center gap-2'>
                                            <CalendarIcon className='h-5 w-5 text-muted-foreground' />
                                            <span className='font-semibold'>
                                                {t('pages.common.columns.updated_at')}:
                                            </span>
                                            <span>
                                                {new Date(testCase.updated_at).toLocaleString()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </AuthenticatedLayout>
    );
}
