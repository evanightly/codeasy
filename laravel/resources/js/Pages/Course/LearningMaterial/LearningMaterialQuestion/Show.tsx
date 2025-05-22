import CodeEditor from '@/Components/CodeEditor';
import { PDFViewer } from '@/Components/PDFViewer';
import { Badge } from '@/Components/UI/badge';
import { Button } from '@/Components/UI/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/card';
import { DataTable } from '@/Components/UI/data-table';
import { DataTableColumnHeader } from '@/Components/UI/data-table-column-header';
import { useConfirmation } from '@/Contexts/ConfirmationDialogContext';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { learningMaterialQuestionTestCaseServiceHook } from '@/Services/learningMaterialQuestionTestCaseServiceHook';
import { ROUTES } from '@/Support/Constants/routes';
import { LearningMaterialTypeEnum } from '@/Support/Enums/learningMaterialTypeEnum';
import { ProgrammingLanguageEnum } from '@/Support/Enums/programmingLanguageEnum';
import { ServiceFilterOptions } from '@/Support/Interfaces/Others';
import {
    CourseResource,
    LearningMaterialQuestionResource,
    LearningMaterialQuestionTestCaseResource,
    LearningMaterialResource,
} from '@/Support/Interfaces/Resources';
import { router } from '@inertiajs/react';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { CodeIcon, EditIcon, Eye, EyeIcon, EyeOffIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

interface Props {
    course: CourseResource;
    learningMaterial: LearningMaterialResource;
    learningMaterialQuestion: LearningMaterialQuestionResource;
}

export default function Show({
    course: courseData,
    learningMaterial: learningMaterialData,
    learningMaterialQuestion: learningMaterialQuestionData,
}: Props) {
    const confirmAction = useConfirmation();
    const { t } = useLaravelReactI18n();

    const [filters, setFilters] = useState<ServiceFilterOptions>({
        column_filters: {
            learning_material_question_id: learningMaterialQuestionData.id,
        },
    });

    const testCasesQuery = learningMaterialQuestionTestCaseServiceHook.useGetAll({ filters });
    const deleteTestCaseMutation = learningMaterialQuestionTestCaseServiceHook.useDelete();
    const toggleHiddenMutation = learningMaterialQuestionTestCaseServiceHook.useUpdate();

    const [fileType, _setFileType] = useState<string | null>(
        learningMaterialQuestionData.file_url?.endsWith('.pdf')
            ? 'application/pdf'
            : learningMaterialQuestionData.file_url?.match(/\.(jpg|jpeg|png|gif|webp)$/i)
              ? 'image'
              : learningMaterialQuestionData.file_url?.match(/\.(txt|py|js|java|cpp|c|html|css)$/i)
                ? 'text'
                : null,
    );

    const handleDeleteTestCase = async (id: number | string) => {
        confirmAction(async () => {
            toast.promise(deleteTestCaseMutation.mutateAsync({ id: Number(id) }), {
                loading: t(
                    'pages.learning_material_question_test_case.common.messages.pending.delete',
                ),
                success: t(
                    'pages.learning_material_question_test_case.common.messages.success.delete',
                ),
                error: t('pages.learning_material_question_test_case.common.messages.error.delete'),
            });
        });
    };

    const handleToggleHidden = async (id: number | string, hidden: boolean) => {
        confirmAction(
            async () => {
                toast.promise(
                    toggleHiddenMutation.mutateAsync({
                        id: Number(id),
                        data: {
                            hidden: !hidden,
                            _method: 'PUT',
                        },
                    }),
                    {
                        loading: t(
                            'pages.learning_material_question_test_case.common.messages.pending.toggle',
                        ),
                        success: t(
                            'pages.learning_material_question_test_case.common.messages.success.toggle',
                        ),
                        error: t(
                            'pages.learning_material_question_test_case.common.messages.error.toggle',
                        ),
                    },
                );
            },
            {
                confirmationTitle: t(
                    'pages.learning_material_question_test_case.common.confirmations.toggle_visibility.title',
                ),
                confirmationMessage: t(
                    'pages.learning_material_question_test_case.common.confirmations.toggle_visibility.message',
                ),
            },
        );
    };

    const [testCases, setTestCases] = useState<LearningMaterialQuestionTestCaseResource[]>(
        learningMaterialQuestionData.learning_material_question_test_cases || [],
    );

    useEffect(() => {
        if (testCasesQuery.data?.data) {
            setTestCases(testCasesQuery.data.data);
        }
    }, [testCasesQuery.data]);

    const isLiveCode = learningMaterialQuestionData.type === LearningMaterialTypeEnum.LIVE_CODE;

    // Create column helper for DataTable
    const columnHelper = createColumnHelper<LearningMaterialQuestionTestCaseResource>();

    // Define columns for DataTable
    const columns = useMemo<ColumnDef<LearningMaterialQuestionTestCaseResource, any>[]>(
        () => [
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
                    <div className='max-w-[300px] truncate'>{row.original.description}</div>
                ),
            }),
            columnHelper.accessor('input', {
                header: ({ column }) => (
                    <DataTableColumnHeader
                        title={t('pages.learning_material_question_test_case.common.fields.input')}
                        column={column}
                    />
                ),
                cell: ({ row }) => (
                    <div className='max-w-[150px] truncate'>{row.original.input}</div>
                ),
            }),
            columnHelper.accessor('active', {
                header: ({ column }) => (
                    <DataTableColumnHeader
                        title={t('pages.learning_material_question_test_case.common.fields.status')}
                        column={column}
                    />
                ),
                cell: ({ row }) => (
                    <Badge variant={row.original.active ? 'success' : 'destructive'}>
                        {row.original.active
                            ? t('pages.learning_material_question_test_case.common.status.active')
                            : t(
                                  'pages.learning_material_question_test_case.common.status.inactive',
                              )}
                    </Badge>
                ),
            }),
            columnHelper.accessor('hidden', {
                header: ({ column }) => (
                    <DataTableColumnHeader
                        title={t(
                            'pages.learning_material_question_test_case.common.fields.visibility',
                        )}
                        column={column}
                    />
                ),
                cell: ({ row }) => (
                    <Badge
                        variant={row.original.hidden ? 'secondary' : 'default'}
                        title={t('action.toggle_visibility')}
                        onClick={() =>
                            handleToggleHidden(row.original.id, row.original.hidden as boolean)
                        }
                        className='cursor-pointer transition-colors hover:bg-muted'
                    >
                        {row.original.hidden ? (
                            <>
                                <EyeOffIcon className='mr-1 h-3 w-3' />
                                {t(
                                    'pages.learning_material_question_test_case.common.visibility.hidden',
                                )}
                            </>
                        ) : (
                            <>
                                <EyeIcon className='mr-1 h-3 w-3' />
                                {t(
                                    'pages.learning_material_question_test_case.common.visibility.visible',
                                )}
                            </>
                        )}
                    </Badge>
                ),
            }),
            columnHelper.display({
                id: 'actions',
                header: t('action.actions'),
                cell: ({ row }) => (
                    <div className='flex gap-1'>
                        <Button
                            variant='outline'
                            title={t('action.view')}
                            size='icon'
                            onClick={() =>
                                router.visit(
                                    route(
                                        `${ROUTES.COURSE_LEARNING_MATERIAL_QUESTION_TEST_CASES}.show`,
                                        [
                                            courseData.id,
                                            learningMaterialData.id,
                                            learningMaterialQuestionData.id,
                                            row.original.id,
                                        ],
                                    ),
                                )
                            }
                        >
                            <Eye />
                        </Button>
                        <Button
                            variant='outline'
                            title={t('action.edit')}
                            size='icon'
                            onClick={() =>
                                router.visit(
                                    route(
                                        `${ROUTES.COURSE_LEARNING_MATERIAL_QUESTION_TEST_CASES}.edit`,
                                        [
                                            courseData.id,
                                            learningMaterialData.id,
                                            learningMaterialQuestionData.id,
                                            row.original.id,
                                        ],
                                    ),
                                )
                            }
                        >
                            <EditIcon />
                        </Button>
                        <Button
                            variant='outline'
                            title={t('action.delete')}
                            size='icon'
                            onClick={() => handleDeleteTestCase(row.original.id)}
                            className='text-destructive hover:bg-destructive/10'
                        >
                            <TrashIcon />
                        </Button>
                    </div>
                ),
            }),
        ],
        [
            t,
            courseData.id,
            learningMaterialData.id,
            learningMaterialQuestionData.id,
            handleDeleteTestCase,
            handleToggleHidden,
        ],
    );

    return (
        <AuthenticatedLayout title={t('pages.learning_material_question.show.title')}>
            <div className='space-y-6'>
                <div className='flex items-center justify-between'>
                    <h2 className='text-3xl font-bold tracking-tight'>
                        {learningMaterialQuestionData.title}
                    </h2>
                    <div className='flex items-center gap-2'>
                        <Button
                            variant='outline'
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
                        <Button
                            onClick={() =>
                                router.visit(
                                    route(`${ROUTES.COURSE_LEARNING_MATERIAL_QUESTIONS}.edit`, [
                                        courseData.id,
                                        learningMaterialData.id,
                                        learningMaterialQuestionData.id,
                                    ]),
                                )
                            }
                        >
                            <EditIcon className='mr-2 h-4 w-4' />
                            {t('action.edit')}
                        </Button>
                    </div>
                </div>

                <div className='space-y-6'>
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                {t('pages.learning_material_question.show.title')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className='space-y-6'>
                                <div>
                                    <h3 className='font-medium'>
                                        {t('pages.learning_material_question.common.fields.type')}
                                    </h3>
                                    <div className='mt-1'>
                                        <Badge>
                                            {learningMaterialQuestionData.type === 'live_code'
                                                ? t(
                                                      'pages.learning_material_question.common.types.live_code',
                                                  )
                                                : t(
                                                      'pages.learning_material_question.common.types.quiz',
                                                  )}
                                        </Badge>
                                    </div>
                                </div>

                                <div className='flex items-center'>
                                    <h3 className='font-medium'>
                                        {t('pages.learning_material_question.common.fields.active')}
                                    </h3>
                                    <div className='ml-2'>
                                        <Badge
                                            variant={
                                                learningMaterialQuestionData.active
                                                    ? 'success'
                                                    : 'destructive'
                                            }
                                            className='w-fit cursor-pointer'
                                        >
                                            {learningMaterialQuestionData.active
                                                ? t(
                                                      'pages.learning_material_question.common.status.active',
                                                  )
                                                : t(
                                                      'pages.learning_material_question.common.status.inactive',
                                                  )}
                                        </Badge>
                                    </div>
                                </div>

                                <div>
                                    <h3 className='font-medium'>
                                        {t(
                                            'pages.learning_material_question.common.fields.description',
                                        )}
                                    </h3>
                                    <div className='mt-1 rounded-md bg-background-2 p-4'>
                                        {learningMaterialQuestionData?.description}
                                    </div>
                                </div>

                                {learningMaterialQuestionData.clue && (
                                    <div>
                                        <h3 className='font-medium'>
                                            {t(
                                                'pages.learning_material_question.common.fields.clue',
                                            )}
                                        </h3>
                                        <div className='mt-1 rounded-md bg-background-2 p-4 text-sm'>
                                            {learningMaterialQuestionData.clue}
                                        </div>
                                    </div>
                                )}

                                {learningMaterialQuestionData.pre_code && (
                                    <div>
                                        <h3 className='font-medium'>
                                            {t(
                                                'pages.learning_material_question.common.fields.pre_code',
                                            ) || 'Pre Code'}
                                        </h3>
                                        <div className='mt-1'>
                                            <CodeEditor
                                                value={learningMaterialQuestionData.pre_code}
                                                showThemePicker={true}
                                                readOnly={true}
                                                onChange={() => {}}
                                                language={ProgrammingLanguageEnum.PYTHON}
                                                height='200px'
                                            />
                                        </div>
                                    </div>
                                )}

                                {learningMaterialQuestionData.example_code && (
                                    <div>
                                        <h3 className='font-medium'>
                                            {t(
                                                'pages.learning_material_question.common.fields.example_code',
                                            ) || 'Example Code'}
                                        </h3>
                                        <div className='mt-1'>
                                            <CodeEditor
                                                value={learningMaterialQuestionData.example_code}
                                                showThemePicker={true}
                                                readOnly={true}
                                                onChange={() => {}}
                                                language={ProgrammingLanguageEnum.PYTHON}
                                                height='200px'
                                            />
                                        </div>
                                    </div>
                                )}

                                {learningMaterialQuestionData.file_url && (
                                    <div>
                                        <h3 className='font-medium'>
                                            {t(
                                                'pages.learning_material_question.common.fields.file',
                                            )}
                                        </h3>
                                        <div className='mt-2 rounded-md border'>
                                            {fileType === 'application/pdf' ? (
                                                <PDFViewer
                                                    fileUrl={learningMaterialQuestionData.file_url}
                                                    filename={
                                                        learningMaterialQuestionData.file ||
                                                        t('components.pdf_viewer.document')
                                                    }
                                                />
                                            ) : fileType === 'image' ||
                                              learningMaterialQuestionData.file_url?.match(
                                                  /\.(jpg|jpeg|png|gif|webp)$/i,
                                              ) ? (
                                                <div className='mt-2 flex justify-center p-4'>
                                                    <img
                                                        src={learningMaterialQuestionData.file_url}
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
                                                        href={learningMaterialQuestionData.file_url}
                                                        className='inline-flex items-center text-blue-600 hover:underline'
                                                    >
                                                        {t('action.view_file')}:{' '}
                                                        {learningMaterialQuestionData.file}
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {isLiveCode && (
                        <Card>
                            <CardHeader className='flex-row items-center justify-between'>
                                <CardTitle>
                                    {t('pages.learning_material_question.show.sections.test_cases')}
                                </CardTitle>
                                <Button
                                    size='sm'
                                    onClick={() =>
                                        router.visit(
                                            route(
                                                `${ROUTES.COURSE_LEARNING_MATERIAL_QUESTION_TEST_CASES}.create`,
                                                [
                                                    courseData.id,
                                                    learningMaterialData.id,
                                                    learningMaterialQuestionData.id,
                                                ],
                                            ),
                                        )
                                    }
                                >
                                    <PlusIcon className='mr-2 h-4 w-4' />
                                    {t('action.add')}
                                </Button>
                            </CardHeader>
                            <CardContent>
                                {testCases && testCases.length > 0 ? (
                                    <DataTable
                                        showPagination={false}
                                        setFilters={setFilters}
                                        filters={filters}
                                        data={testCases}
                                        columns={columns}
                                    />
                                ) : (
                                    <div className='rounded-lg border border-dashed p-8 text-center'>
                                        <CodeIcon className='mx-auto h-10 w-10 text-muted-foreground' />
                                        <h3 className='mt-2 text-lg font-semibold'>
                                            {t(
                                                'pages.learning_material_question_test_case.no_test_cases.title',
                                            )}
                                        </h3>
                                        <p className='mt-1 text-sm text-muted-foreground'>
                                            {t(
                                                'pages.learning_material_question_test_case.no_test_cases.message',
                                            )}
                                        </p>
                                        <Button
                                            variant='secondary'
                                            onClick={() =>
                                                router.visit(
                                                    route(
                                                        `${ROUTES.COURSE_LEARNING_MATERIAL_QUESTION_TEST_CASES}.create`,
                                                        [
                                                            courseData.id,
                                                            learningMaterialData.id,
                                                            learningMaterialQuestionData.id,
                                                        ],
                                                    ),
                                                )
                                            }
                                            className='mt-4'
                                        >
                                            <PlusIcon className='mr-2 h-4 w-4' />
                                            {t(
                                                'pages.learning_material_question_test_case.no_test_cases.add_button',
                                            )}
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
