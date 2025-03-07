import { PDFViewer } from '@/Components/PDFViewer';
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
import { useEffect, useState } from 'react';

function TextFilePreview({ fileUrl }: { fileUrl: string }) {
    const [content, setContent] = useState<string>('Loading...');

    useEffect(() => {
        fetch(fileUrl)
            .then((response) => response.text())
            .then((text) => {
                setContent(text);
            })
            .catch((error) => {
                console.error('Error loading text file:', error);
                setContent('Error loading file content');
            });
    }, [fileUrl]);

    return <>{content}</>;
}

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

    const fileType = testCase.expected_output_file_url?.endsWith('.pdf')
        ? 'application/pdf'
        : testCase.expected_output_file_url?.match(/\.(txt|py|js|java|cpp|c|html|css)$/)
          ? 'text/plain'
          : null;

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
                                [course.id, learningMaterial.id, question.id],
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
                                        <div className='w-full'>
                                            <span className='block font-semibold'>
                                                {t(
                                                    'pages.learning_material_question_test_case.common.fields.expected_output',
                                                )}
                                                :
                                            </span>

                                            <div className='mt-2 rounded-md border'>
                                                {fileType === 'application/pdf' ? (
                                                    <PDFViewer
                                                        fileUrl={
                                                            testCase?.expected_output_file_url || ''
                                                        }
                                                        filename={
                                                            testCase.expected_output_file ||
                                                            t('components.pdf_viewer.document')
                                                        }
                                                    />
                                                ) : fileType === 'text/plain' ? (
                                                    <div className='mt-2 overflow-auto rounded border bg-gray-50 p-4'>
                                                        <pre className='whitespace-pre-wrap text-sm text-gray-800'>
                                                            <TextFilePreview
                                                                fileUrl={
                                                                    testCase?.expected_output_file_url ||
                                                                    ''
                                                                }
                                                            />
                                                        </pre>
                                                    </div>
                                                ) : testCase.expected_output_file_url?.match(
                                                      /\.(jpg|jpeg|png|gif|webp)$/i,
                                                  ) ? (
                                                    <div className='mt-2 flex justify-center p-4'>
                                                        <img
                                                            src={testCase.expected_output_file_url}
                                                            className='max-w-full rounded object-contain'
                                                            alt={t(
                                                                'pages.learning_material_question_test_case.show.expected_output_file',
                                                            )}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className='p-4 text-center text-muted-foreground'>
                                                        <a
                                                            target='_blank'
                                                            rel='noopener noreferrer'
                                                            href={testCase.expected_output_file_url}
                                                            className='inline-flex items-center text-blue-600 hover:underline'
                                                        >
                                                            {t('action.view_file')}:{' '}
                                                            {testCase.expected_output_file}
                                                        </a>
                                                    </div>
                                                )}
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
