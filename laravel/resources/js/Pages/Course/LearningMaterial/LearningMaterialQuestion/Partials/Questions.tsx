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
import { learningMaterialQuestionServiceHook } from '@/Services/learningMaterialQuestionServiceHook';
import { ROUTES } from '@/Support/Constants/routes';
import { LearningMaterialTypeEnum } from '@/Support/Enums/learningMaterialTypeEnum';
import { PaginateMeta, PaginateResponse, ServiceFilterOptions } from '@/Support/Interfaces/Others';
import { LearningMaterialQuestionResource } from '@/Support/Interfaces/Resources';
import { Link } from '@inertiajs/react';
import { UseQueryResult } from '@tanstack/react-query';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { CodeIcon, MoreHorizontal } from 'lucide-react';
import { useMemo } from 'react';
import { toast } from 'sonner';

interface QuestionsProps {
    response?: UseQueryResult<PaginateResponse<LearningMaterialQuestionResource>, Error>;
    meta?: PaginateMeta;
    filters?: ServiceFilterOptions;
    setFilters?: (filters: ServiceFilterOptions) => void;
    baseRoute: string;
    baseKey: string;
    materialId: number;
    courseId: number; // Added courseId for nested routes
    materialType: LearningMaterialTypeEnum;
}

export const Questions = ({
    response,
    filters,
    setFilters,
    baseRoute,
    baseKey,
    materialId,
    courseId,
    materialType,
}: QuestionsProps) => {
    const { t } = useLaravelReactI18n();
    const confirmAction = useConfirmation();
    const columnHelper = createColumnHelper<LearningMaterialQuestionResource>();
    const deleteMutation = learningMaterialQuestionServiceHook.useDelete();

    const handleDelete = async (question: LearningMaterialQuestionResource) => {
        if (!question.id) return;
        confirmAction(async () => {
            toast.promise(deleteMutation.mutateAsync({ id: question.id }), {
                loading: t('pages.learning_material_question.common.messages.pending.delete'),
                success: t('pages.learning_material_question.common.messages.success.delete'),
                error: t('pages.learning_material_question.common.messages.error.delete'),
            });
        });
    };

    const renderTypeIcon = (type: string) => {
        switch (type) {
            case LearningMaterialTypeEnum.LIVE_CODE:
                return <CodeIcon className='mr-2 h-4 w-4' />;
            default:
                return null;
        }
    };

    const columns = [
        columnHelper.accessor('title', {
            header: ({ column }) => (
                <DataTableColumnHeader
                    title={t('pages.learning_material_question.common.fields.title')}
                    column={column}
                />
            ),
        }),
        columnHelper.accessor('type', {
            header: ({ column }) => (
                <DataTableColumnHeader
                    title={t('pages.learning_material_question.common.fields.type')}
                    column={column}
                />
            ),
            cell: ({ row }) => {
                const question = row.original;

                if (!question.type) return null;

                return (
                    <div className='flex items-center'>
                        {renderTypeIcon(question.type)}
                        <span>
                            {t(
                                `pages.learning_material_question.common.types.${question.type.toLowerCase()}`,
                            )}
                        </span>
                    </div>
                );
            },
        }),
        columnHelper.accessor('order_number', {
            header: ({ column }) => (
                <DataTableColumnHeader
                    title={t('pages.learning_material_question.common.fields.order')}
                    column={column}
                />
            ),
        }),
        columnHelper.accessor('active', {
            header: ({ column }) => (
                <DataTableColumnHeader
                    title={t('pages.learning_material_question.common.fields.status')}
                    column={column}
                />
            ),
            cell: ({ row }) => (
                <Badge variant={row.original.active ? 'success' : 'destructive'}>
                    {row.original.active
                        ? t('pages.learning_material_question.common.status.active')
                        : t('pages.learning_material_question.common.status.inactive')}
                </Badge>
            ),
        }),
        columnHelper.display({
            id: 'actions',
            cell: ({ row }) => {
                const question = row.original;
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
                                        materialId,
                                        question.id,
                                    ])}
                                >
                                    {t('action.show')}
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link
                                    href={route(`${baseRoute}.edit`, [
                                        courseId,
                                        materialId,
                                        question.id,
                                    ])}
                                >
                                    {t('action.edit')}
                                </Link>
                            </DropdownMenuItem>
                            {question.type === LearningMaterialTypeEnum.LIVE_CODE && (
                                <DropdownMenuItem asChild>
                                    <Link
                                        href={route(
                                            `${ROUTES.COURSE_LEARNING_MATERIAL_QUESTION_TEST_CASES}.index`,
                                            [courseId, materialId, question.id],
                                        )}
                                    >
                                        {t(
                                            'pages.learning_material_question.common.actions.manage_test_cases',
                                        )}
                                    </Link>
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleDelete(question)}>
                                {t('action.delete')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        }),
    ] as Array<ColumnDef<LearningMaterialQuestionResource, LearningMaterialQuestionResource>>;

    const memoizedColumns = useMemo(() => columns, []);

    return (
        <>
            <div className='mb-4 flex justify-end'>
                <Link
                    href={route(`${baseRoute}.create`, [courseId, materialId])}
                    className={buttonVariants({ variant: 'create' })}
                >
                    {t('pages.learning_material_question.index.buttons.create')}
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
