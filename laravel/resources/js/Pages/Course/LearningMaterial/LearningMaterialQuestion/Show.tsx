import { PDFViewer } from '@/Components/PDFViewer';
import { Badge } from '@/Components/UI/badge';
import { Button } from '@/Components/UI/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/UI/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/UI/tabs';
import { useConfirmation } from '@/Contexts/ConfirmationDialogContext';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { learningMaterialQuestionTestCaseServiceHook } from '@/Services/learningMaterialQuestionTestCaseServiceHook';
import { ROUTES } from '@/Support/Constants/routes';
import { LearningMaterialTypeEnum } from '@/Support/Enums/learningMaterialTypeEnum';
import {
    CourseResource,
    LearningMaterialQuestionResource,
    LearningMaterialQuestionTestCaseResource,
    LearningMaterialResource,
} from '@/Support/Interfaces/Resources';
import { router } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import {
    CodeIcon,
    EditIcon,
    FileTextIcon,
    ListChecksIcon,
    PlusIcon,
    TrashIcon,
} from 'lucide-react';
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
    course: { data: CourseResource };
    learningMaterial: { data: LearningMaterialResource };
    learningMaterialQuestion: { data: LearningMaterialQuestionResource };
}

export default function Show({
    course: { data: courseData },
    learningMaterial: { data: learningMaterialData },
    learningMaterialQuestion: { data: questionData },
}: Props) {
    const confirmAction = useConfirmation();
    const { t } = useLaravelReactI18n();
    const testCasesQuery = learningMaterialQuestionTestCaseServiceHook.useGetAll({
        filters: {
            learning_material_question_id: questionData.id,
        },
    });
    const deleteTestCaseMutation = learningMaterialQuestionTestCaseServiceHook.useDelete();

    const isLiveCode = learningMaterialData.type === LearningMaterialTypeEnum.LIVE_CODE;
    const fileType = questionData.file_url?.endsWith('.pdf')
        ? 'application/pdf'
        : questionData.file_url?.match(/\.(txt|py|js|java|cpp|c|html|css)$/)
          ? 'text/plain'
          : null;

    const handleDeleteTestCase = async (testCaseId: number) => {
        confirmAction(async () => {
            await deleteTestCaseMutation.mutateAsync({ id: testCaseId });
            testCasesQuery.refetch();
        });
    };

    return (
        <AuthenticatedLayout title={t('pages.learning_material_question.show.title')}>
            <Card className='mb-6'>
                <CardHeader className='flex flex-row items-center justify-between'>
                    <div>
                        <CardTitle>{questionData.title}</CardTitle>
                        <div className='text-sm text-muted-foreground'>
                            {isLiveCode && (
                                <Badge variant='outline'>
                                    <CodeIcon className='mr-1 h-4 w-4' />
                                    {t('pages.learning_material_question.common.types.live_code')}
                                </Badge>
                            )}
                        </div>
                    </div>
                    <Button
                        variant='outline'
                        size='sm'
                        onClick={() =>
                            router.visit(
                                route(
                                    `${ROUTES.LEARNING_MATERIAL_QUESTIONS}.edit`,
                                    questionData.id,
                                ),
                            )
                        }
                    >
                        <EditIcon className='mr-1 h-4 w-4' />
                        {t('action.edit')}
                    </Button>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue='information'>
                        <TabsList>
                            <TabsTrigger value='information'>
                                <FileTextIcon className='mr-1 h-4 w-4' />
                                {t('pages.learning_material_question.show.sections.information')}
                            </TabsTrigger>
                            {isLiveCode && (
                                <TabsTrigger value='test_cases'>
                                    <ListChecksIcon className='mr-1 h-4 w-4' />
                                    {t('pages.learning_material_question.show.sections.test_cases')}
                                </TabsTrigger>
                            )}
                        </TabsList>

                        <TabsContent value='information' className='mt-4'>
                            <div className='space-y-4'>
                                <div>
                                    <h3 className='font-medium'>
                                        {t(
                                            'pages.learning_material_question.common.fields.description',
                                        )}
                                    </h3>
                                    <div className='mt-1 rounded-md bg-background-2 p-4'>
                                        {questionData?.description}
                                    </div>
                                </div>

                                {questionData.clue && (
                                    <div>
                                        <h3 className='font-medium'>
                                            {t(
                                                'pages.learning_material_question.common.fields.clue',
                                            )}
                                        </h3>
                                        <div className='mt-1 rounded-md bg-background-2 p-4 text-sm'>
                                            {questionData.clue}
                                        </div>
                                    </div>
                                )}

                                {questionData.file_url && (
                                    <div>
                                        <h3 className='font-medium'>
                                            {t(
                                                'pages.learning_material_question.common.fields.file',
                                            )}
                                        </h3>
                                        <div className='mt-2 rounded-md border'>
                                            {fileType === 'application/pdf' ? (
                                                <PDFViewer
                                                    withPagination={true}
                                                    fileUrl={questionData.file_url}
                                                    filename={
                                                        questionData.file ||
                                                        t('components.pdf_viewer.document')
                                                    }
                                                />
                                            ) : fileType?.startsWith('image/') ||
                                              questionData.file_url?.match(
                                                  /\.(jpg|jpeg|png|gif|webp)$/i,
                                              ) ? (
                                                <div className='mt-2 flex justify-center p-4'>
                                                    <img
                                                        src={questionData.file_url}
                                                        className='max-w-full rounded object-contain'
                                                        alt={t(
                                                            'pages.learning_material_question.show.question_file',
                                                        )}
                                                    />
                                                </div>
                                            ) : (
                                                <div className='p-4 text-center text-muted-foreground'>
                                                    <a
                                                        target='_blank'
                                                        rel='noopener noreferrer'
                                                        href={questionData.file_url}
                                                        className='inline-flex items-center text-blue-600 hover:underline'
                                                    >
                                                        {t('action.view_file')}: {questionData.file}
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <h3 className='font-medium'>
                                        {t('pages.learning_material_question.common.fields.active')}
                                    </h3>
                                    <div className='mt-1'>
                                        {questionData.active ? (
                                            <Badge variant='success'>
                                                {t(
                                                    'pages.learning_material_question.common.status.active',
                                                )}
                                            </Badge>
                                        ) : (
                                            <Badge variant='destructive'>
                                                {t(
                                                    'pages.learning_material_question.common.status.inactive',
                                                )}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {isLiveCode && (
                            <TabsContent value='test_cases' className='mt-4'>
                                <div className='space-y-4'>
                                    <div className='flex justify-end'>
                                        <Button
                                            size='sm'
                                            onClick={() =>
                                                router.visit(
                                                    route(
                                                        `${ROUTES.LEARNING_MATERIAL_QUESTIONS}.test-cases.create`,
                                                        questionData.id,
                                                    ),
                                                )
                                            }
                                        >
                                            <PlusIcon className='mr-1 h-4 w-4' />
                                            {t(
                                                'pages.learning_material_question_test_case.index.buttons.create',
                                            )}
                                        </Button>
                                    </div>

                                    {testCasesQuery.data?.data?.length ? (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>ID</TableHead>
                                                    <TableHead>
                                                        {t(
                                                            'pages.learning_material_question_test_case.common.fields.description',
                                                        )}
                                                    </TableHead>
                                                    <TableHead>
                                                        {t(
                                                            'pages.learning_material_question_test_case.common.fields.input',
                                                        )}
                                                    </TableHead>
                                                    <TableHead>
                                                        {t(
                                                            'pages.learning_material_question_test_case.common.fields.hidden',
                                                        )}
                                                    </TableHead>
                                                    <TableHead>
                                                        {t(
                                                            'pages.learning_material_question_test_case.common.fields.active',
                                                        )}
                                                    </TableHead>
                                                    <TableHead className='text-right'>
                                                        Actions
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {testCasesQuery.data.data.map(
                                                    (
                                                        testCase: LearningMaterialQuestionTestCaseResource,
                                                    ) => (
                                                        <TableRow key={testCase.id}>
                                                            <TableCell>{testCase.id}</TableCell>
                                                            <TableCell>
                                                                {testCase.description || '-'}
                                                            </TableCell>
                                                            <TableCell>
                                                                {testCase.input ? (
                                                                    <pre className='max-w-64 overflow-hidden text-ellipsis whitespace-nowrap text-xs'>
                                                                        {testCase.input}
                                                                    </pre>
                                                                ) : (
                                                                    '-'
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                {testCase.hidden ? (
                                                                    <Badge variant='secondary'>
                                                                        Yes
                                                                    </Badge>
                                                                ) : (
                                                                    <Badge variant='outline'>
                                                                        No
                                                                    </Badge>
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                {testCase.active ? (
                                                                    <Badge variant='success'>
                                                                        Active
                                                                    </Badge>
                                                                ) : (
                                                                    <Badge variant='destructive'>
                                                                        Inactive
                                                                    </Badge>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className='text-right'>
                                                                <Button
                                                                    variant='ghost'
                                                                    size='icon'
                                                                    onClick={() =>
                                                                        router.visit(
                                                                            route(
                                                                                `${ROUTES.LEARNING_MATERIAL_QUESTIONS}.test-cases.edit`,
                                                                                [
                                                                                    questionData.id,
                                                                                    testCase.id,
                                                                                ],
                                                                            ),
                                                                        )
                                                                    }
                                                                >
                                                                    <EditIcon className='h-4 w-4' />
                                                                </Button>
                                                                <Button
                                                                    variant='ghost'
                                                                    size='icon'
                                                                    onClick={() =>
                                                                        handleDeleteTestCase(
                                                                            testCase.id,
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        deleteTestCaseMutation.isPending
                                                                    }
                                                                >
                                                                    <TrashIcon className='h-4 w-4 text-red-500' />
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ),
                                                )}
                                            </TableBody>
                                        </Table>
                                    ) : (
                                        <div className='rounded-md border border-dashed p-8 text-center text-muted-foreground'>
                                            {t(
                                                'pages.learning_material_question_test_case.index.empty_state',
                                            )}
                                        </div>
                                    )}
                                </div>
                            </TabsContent>
                        )}
                    </Tabs>
                </CardContent>
            </Card>

            <div className='flex justify-between'>
                <Button
                    variant='outline'
                    type='button'
                    onClick={() =>
                        router.visit(
                            route(`${ROUTES.COURSE_LEARNING_MATERIALS}.show`, [
                                courseData.id,
                                learningMaterialData.id,
                            ]),
                        )
                    }
                >
                    {t('action.back')}
                </Button>
            </div>
        </AuthenticatedLayout>
    );
}
