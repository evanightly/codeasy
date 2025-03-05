import { PDFViewer } from '@/Components/PDFViewer';
import { Badge } from '@/Components/UI/badge';
import { Button, buttonVariants } from '@/Components/UI/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/card';
import { DataTable } from '@/Components/UI/data-table';
import { DataTableColumnHeader } from '@/Components/UI/data-table-column-header';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/Components/UI/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/UI/tabs';
import { useConfirmation } from '@/Contexts/ConfirmationDialogContext';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { learningMaterialQuestionTestCaseServiceHook } from '@/Services/learningMaterialQuestionTestCaseServiceHook';
import { ROUTES } from '@/Support/Constants/routes';
import { LearningMaterialTypeEnum } from '@/Support/Enums/learningMaterialTypeEnum';
import { ServiceFilterOptions } from '@/Support/Interfaces/Others';
import {
    CourseResource,
    LearningMaterialQuestionResource,
    LearningMaterialQuestionTestCaseResource,
    LearningMaterialResource,
} from '@/Support/Interfaces/Resources';
import { Link, router } from '@inertiajs/react';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import {
    CodeIcon,
    EditIcon,
    EyeIcon,
    EyeOffIcon,
    FileTextIcon,
    ListChecksIcon,
    MoreHorizontal,
    PlusIcon,
} from 'lucide-react';
import { useMemo, useState } from 'react';

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

    const [filters, setFilters] = useState<ServiceFilterOptions>({
        filters: {
            column_filters: {
                learning_material_question_id: questionData.id,
            },
        },
    });

    const testCasesQuery = learningMaterialQuestionTestCaseServiceHook.useGetAll({ filters });
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

    // Create column definitions for the DataTable
    const columnHelper = createColumnHelper<LearningMaterialQuestionTestCaseResource>();

    const columns = useMemo(
        () =>
            [
                columnHelper.accessor('id', {
                    header: ({ column }) => <DataTableColumnHeader title='ID' column={column} />,
                    cell: ({ row }) => <div>{row.original.id}</div>,
                }),
                columnHelper.accessor('description', {
                    header: ({ column }) => (
                        <DataTableColumnHeader
                            title={t(
                                'pages.learning_material_question_test_case.common.fields.description',
                            )}
                            column={column}
                        />
                    ),
                    cell: ({ row }) => (
                        <div className='max-w-[300px] truncate'>
                            {row.original.description || '-'}
                        </div>
                    ),
                }),
                columnHelper.accessor('input', {
                    header: ({ column }) => (
                        <DataTableColumnHeader
                            title={t(
                                'pages.learning_material_question_test_case.common.fields.input',
                            )}
                            column={column}
                        />
                    ),
                    cell: ({ row }) => (
                        <div className='max-w-[150px] truncate'>
                            {row.original.input ? (
                                <pre className='overflow-hidden text-ellipsis whitespace-nowrap text-xs'>
                                    {row.original.input}
                                </pre>
                            ) : (
                                '-'
                            )}
                        </div>
                    ),
                }),
                columnHelper.accessor('hidden', {
                    header: ({ column }) => (
                        <DataTableColumnHeader
                            title={t(
                                'pages.learning_material_question_test_case.common.fields.hidden',
                            )}
                            column={column}
                        />
                    ),
                    cell: ({ row }) => (
                        <div className='flex items-center'>
                            {row.original.hidden ? (
                                <div className='flex items-center'>
                                    <EyeOffIcon className='mr-2 h-4 w-4 text-muted-foreground' />
                                    <span>
                                        {t(
                                            'pages.learning_material_question_test_case.show.hidden',
                                        )}
                                    </span>
                                </div>
                            ) : (
                                <div className='flex items-center'>
                                    <EyeIcon className='mr-2 h-4 w-4 text-muted-foreground' />
                                    <span>
                                        {t(
                                            'pages.learning_material_question_test_case.show.visible',
                                        )}
                                    </span>
                                </div>
                            )}
                        </div>
                    ),
                }),
                columnHelper.accessor('active', {
                    header: ({ column }) => (
                        <DataTableColumnHeader
                            title={t(
                                'pages.learning_material_question_test_case.common.fields.active',
                            )}
                            column={column}
                        />
                    ),
                    cell: ({ row }) => (
                        <Badge variant={row.original.active ? 'success' : 'destructive'}>
                            {row.original.active
                                ? t(
                                      'pages.learning_material_question_test_case.common.status.active',
                                  )
                                : t(
                                      'pages.learning_material_question_test_case.common.status.inactive',
                                  )}
                        </Badge>
                    ),
                }),
                columnHelper.display({
                    id: 'actions',
                    header: () => <div className='text-right'>Actions</div>,
                    cell: ({ row }) => {
                        const testCase = row.original;
                        return (
                            <div className='text-right'>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant='ghost' className='h-8 w-8 p-0'>
                                            <span className='sr-only'>
                                                {t('components.dropdown_menu.sr_open_menu')}
                                            </span>
                                            <MoreHorizontal className='h-4 w-4' />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align='end'>
                                        <DropdownMenuItem asChild>
                                            <Link
                                                href={route(
                                                    `${ROUTES.COURSE_LEARNING_MATERIAL_QUESTION_TEST_CASES}.show`,
                                                    [
                                                        courseData.id,
                                                        learningMaterialData.id,
                                                        questionData.id,
                                                        testCase.id,
                                                    ],
                                                )}
                                            >
                                                {t('action.show')}
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link
                                                href={route(
                                                    `${ROUTES.COURSE_LEARNING_MATERIAL_QUESTION_TEST_CASES}.edit`,
                                                    [
                                                        courseData.id,
                                                        learningMaterialData.id,
                                                        questionData.id,
                                                        testCase.id,
                                                    ],
                                                )}
                                            >
                                                {t('action.edit')}
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => handleDeleteTestCase(testCase.id)}
                                        >
                                            {t('action.delete')}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        );
                    },
                }),
            ] as Array<
                ColumnDef<
                    LearningMaterialQuestionTestCaseResource,
                    LearningMaterialQuestionTestCaseResource
                >
            >,
        [],
    );

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
                    <Link
                        href={route(`${ROUTES.COURSE_LEARNING_MATERIAL_QUESTIONS}.edit`, [
                            courseData.id,
                            learningMaterialData.id,
                            questionData.id,
                        ])}
                        className={buttonVariants({ variant: 'outline', size: 'sm' })}
                    >
                        <EditIcon className='mr-1 h-4 w-4' />
                        {t('action.edit')}
                    </Link>
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
                                        <Link
                                            href={route(
                                                `${ROUTES.COURSE_LEARNING_MATERIAL_QUESTION_TEST_CASES}.create`,
                                                [
                                                    courseData.id,
                                                    learningMaterialData.id,
                                                    questionData.id,
                                                ],
                                            )}
                                            className={buttonVariants({ size: 'sm' })}
                                        >
                                            <>
                                                <PlusIcon className='mr-1 h-4 w-4' />
                                                {t(
                                                    'pages.learning_material_question_test_case.index.buttons.create',
                                                )}
                                            </>
                                        </Link>
                                    </div>

                                    <DataTable
                                        setFilters={setFilters}
                                        meta={testCasesQuery?.data?.meta}
                                        filters={filters}
                                        data={testCasesQuery?.data?.data ?? []}
                                        columns={columns}
                                        baseRoute={
                                            ROUTES.COURSE_LEARNING_MATERIAL_QUESTION_TEST_CASES
                                        }
                                        baseKey={
                                            ROUTES.COURSE_LEARNING_MATERIAL_QUESTION_TEST_CASES
                                        }
                                    />
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
