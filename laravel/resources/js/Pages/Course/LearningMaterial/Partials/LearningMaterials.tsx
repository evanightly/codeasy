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
import { learningMaterialServiceHook } from '@/Services/learningMaterialServiceHook';
import { LearningMaterialTypeEnum } from '@/Support/Enums/learningMaterialTypeEnum';
import { PaginateMeta, PaginateResponse, ServiceFilterOptions } from '@/Support/Interfaces/Others';
import { LearningMaterialResource } from '@/Support/Interfaces/Resources';
import { Link } from '@inertiajs/react';
import { UseQueryResult } from '@tanstack/react-query';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { Code, MoreHorizontal } from 'lucide-react';
import { useMemo } from 'react';
import { toast } from 'sonner';

interface LearningMaterialsProps {
    response?: UseQueryResult<PaginateResponse<LearningMaterialResource>, Error>;
    meta?: PaginateMeta;
    filters?: ServiceFilterOptions;
    setFilters?: (filters: ServiceFilterOptions) => void;
    baseRoute: string;
    baseKey: string;
    courseId: number;
}

export const LearningMaterials = ({
    response,
    filters,
    setFilters,
    baseRoute,
    baseKey,
    courseId,
}: LearningMaterialsProps) => {
    const { t } = useLaravelReactI18n();
    const confirmAction = useConfirmation();
    const columnHelper = createColumnHelper<LearningMaterialResource>();
    const deleteMutation = learningMaterialServiceHook.useDelete();

    const handleDelete = async (material: LearningMaterialResource) => {
        if (!material.id) return;
        confirmAction(async () => {
            toast.promise(deleteMutation.mutateAsync({ id: material.id }), {
                loading: t('pages.learning_material.common.messages.pending.delete'),
                success: t('pages.learning_material.common.messages.success.delete'),
                error: t('pages.learning_material.common.messages.error.delete'),
            });
        });
    };

    const renderTypeIcon = (type: string) => {
        switch (type) {
            case LearningMaterialTypeEnum.LIVE_CODE:
                return <Code className='mr-2 h-4 w-4' />;
            default:
                return null;
        }
    };

    const columns = [
        columnHelper.accessor('title', {
            header: ({ column }) => (
                <DataTableColumnHeader
                    title={t('pages.learning_material.common.fields.title')}
                    column={column}
                />
            ),
        }),
        columnHelper.accessor('type', {
            header: ({ column }) => (
                <DataTableColumnHeader
                    title={t('pages.learning_material.common.fields.type')}
                    column={column}
                />
            ),
            cell: ({ row }) => {
                const material = row.original;

                if (!material.type) return null;

                return (
                    <div className='flex items-center'>
                        {renderTypeIcon(material.type)}
                        <span>
                            {t(
                                `pages.learning_material.common.types.${material.type.toLowerCase()}`,
                            )}
                        </span>
                    </div>
                );
            },
        }),
        columnHelper.accessor('order_number', {
            header: ({ column }) => (
                <DataTableColumnHeader
                    title={t('pages.learning_material.common.fields.order')}
                    column={column}
                />
            ),
        }),
        columnHelper.accessor('active', {
            header: ({ column }) => (
                <DataTableColumnHeader
                    title={t('pages.learning_material.common.fields.status')}
                    column={column}
                />
            ),
            cell: ({ row }) => (
                <Badge variant={row.original.active ? 'success' : 'destructive'}>
                    {row.original.active
                        ? t('pages.learning_material.common.status.active')
                        : t('pages.learning_material.common.status.inactive')}
                </Badge>
            ),
        }),
        columnHelper.display({
            id: 'actions',
            cell: ({ row }) => {
                const material = row.original;
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
                                <Link href={route(`${baseRoute}.show`, [courseId, material.id])}>
                                    {t('action.show')}
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href={route(`${baseRoute}.edit`, [courseId, material.id])}>
                                    {t('action.edit')}
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(material)}>
                                {t('action.delete')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        }),
    ] as Array<ColumnDef<LearningMaterialResource, LearningMaterialResource>>;

    const memoizedColumns = useMemo(() => columns, []);

    return (
        <>
            <div className='mb-4 flex justify-end'>
                <Link
                    href={route(`${baseRoute}.create`, courseId)}
                    className={buttonVariants({ variant: 'create' })}
                >
                    {t('pages.learning_material.index.buttons.create')}
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
