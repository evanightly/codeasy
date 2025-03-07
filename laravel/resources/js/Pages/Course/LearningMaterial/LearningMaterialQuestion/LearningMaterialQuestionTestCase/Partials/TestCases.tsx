import { Badge } from '@/Components/UI/badge';
import { Button, buttonVariants } from '@/Components/UI/button';
import { DataTable } from '@/Components/UI/data-table';
import { DataTableColumnHeader } from '@/Components/UI/data-table-column-header';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/Components/UI/dropdown-menu';
import { useConfirmation } from '@/Contexts/ConfirmationDialogContext';
import { learningMaterialQuestionTestCaseServiceHook } from '@/Services/learningMaterialQuestionTestCaseServiceHook';
import { PaginateMeta, PaginateResponse, ServiceFilterOptions } from '@/Support/Interfaces/Others';
import { LearningMaterialQuestionTestCaseResource } from '@/Support/Interfaces/Resources';
import { Link } from '@inertiajs/react';
import { UseQueryResult } from '@tanstack/react-query';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { EyeIcon, EyeOffIcon, MoreHorizontal } from 'lucide-react';
import { useMemo } from 'react';
import { toast } from 'sonner';

interface TestCasesProps {
    response?: UseQueryResult<PaginateResponse<LearningMaterialQuestionTestCaseResource>, Error>;
    meta?: PaginateMeta;
    filters?: ServiceFilterOptions;
    setFilters?: (filters: ServiceFilterOptions) => void;
    baseRoute: string;
    baseKey: string;
    courseId: number; // Added courseId for nested routes
    learningMaterialId: number;
    questionId: number;
}

export const TestCases = ({
    response,
    filters,
    setFilters,
    baseRoute,
    baseKey,
    courseId,
    learningMaterialId,
    questionId,
}: TestCasesProps) => {
    const { t } = useLaravelReactI18n();
    const confirmAction = useConfirmation();
    const columnHelper = createColumnHelper<LearningMaterialQuestionTestCaseResource>();
    const deleteMutation = learningMaterialQuestionTestCaseServiceHook.useDelete();

    const handleDelete = async (testCase: LearningMaterialQuestionTestCaseResource) => {
        if (!testCase.id) return;
        confirmAction(async () => {
            toast.promise(deleteMutation.mutateAsync({ id: testCase.id }), {
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

    const columns = [
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
            cell: ({ row }) => <div className='max-w-[150px] truncate'>{row.original.input}</div>,
        }),
        columnHelper.accessor('hidden', {
            header: ({ column }) => (
                <DataTableColumnHeader
                    title={t('pages.learning_material_question_test_case.common.fields.hidden')}
                    column={column}
                />
            ),
            cell: ({ row }) => (
                <div className='flex items-center'>
                    {row.original.hidden ? (
                        <div className='flex items-center'>
                            <EyeOffIcon className='mr-2 h-4 w-4 text-muted-foreground' />
                            <span>
                                {t('pages.learning_material_question_test_case.show.hidden')}
                            </span>
                        </div>
                    ) : (
                        <div className='flex items-center'>
                            <EyeIcon className='mr-2 h-4 w-4 text-muted-foreground' />
                            <span>
                                {t('pages.learning_material_question_test_case.show.visible')}
                            </span>
                        </div>
                    )}
                </div>
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
                        : t('pages.learning_material_question_test_case.common.status.inactive')}
                </Badge>
            ),
        }),
        columnHelper.display({
            id: 'actions',
            cell: ({ row }) => {
                const testCase = row.original;
                return (
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
                                    href={route(`${baseRoute}.show`, [
                                        courseId,
                                        learningMaterialId,
                                        questionId,
                                        testCase.id,
                                    ])}
                                >
                                    {t('action.show')}
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link
                                    href={route(`${baseRoute}.edit`, [
                                        courseId,
                                        learningMaterialId,
                                        questionId,
                                        testCase.id,
                                    ])}
                                >
                                    {t('action.edit')}
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(testCase)}>
                                {t('action.delete')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        }),
    ] as Array<
        ColumnDef<
            LearningMaterialQuestionTestCaseResource,
            LearningMaterialQuestionTestCaseResource
        >
    >;

    const memoizedColumns = useMemo(() => columns, []);

    return (
        <>
            <div className='mb-4 flex justify-end'>
                <Link
                    href={route(`${baseRoute}.create`, {
                        course: courseId,
                        learningMaterial: learningMaterialId,
                        question: questionId,
                    })}
                    className={buttonVariants({ variant: 'create' })}
                >
                    {t('pages.learning_material_question_test_case.index.buttons.create')}
                </Link>
            </div>
            <DataTable
                setFilters={setFilters}
                meta={response?.data?.meta}
                filters={filters}
                data={response?.data?.data ?? []}
                columns={memoizedColumns}
                baseRoute={baseRoute}
                baseKey={baseKey}
            />
        </>
    );
};
