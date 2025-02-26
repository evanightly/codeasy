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
import { classRoomServiceHook } from '@/Services/classRoomServiceHook';
import { ROUTES } from '@/Support/Constants/routes';
import { PaginateMeta, PaginateResponse, ServiceFilterOptions } from '@/Support/Interfaces/Others';
import { ClassRoomResource } from '@/Support/Interfaces/Resources';
import { Link } from '@inertiajs/react';
import { UseQueryResult } from '@tanstack/react-query';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { MoreHorizontal } from 'lucide-react';
import { useMemo } from 'react';
import { toast } from 'sonner';

interface ClassroomsProps {
    response?: UseQueryResult<PaginateResponse<ClassRoomResource>, Error>;
    meta?: PaginateMeta;
    filters?: ServiceFilterOptions;
    setFilters?: (filters: ServiceFilterOptions) => void;
    baseRoute: string;
    baseKey: string;
}

const Classrooms = ({ response, filters, setFilters, baseKey, baseRoute }: ClassroomsProps) => {
    const { t } = useLaravelReactI18n();
    const confirmAction = useConfirmation();
    const columnHelper = createColumnHelper<ClassRoomResource>();
    const deleteMutation = classRoomServiceHook.useDelete();

    const handleDelete = async (classroom: ClassRoomResource) => {
        if (!classroom.id) return;
        confirmAction(async () => {
            toast.promise(deleteMutation.mutateAsync({ id: classroom.id }), {
                loading: t('pages.classroom.common.messages.pending.delete'),
                success: t('pages.classroom.common.messages.success.delete'),
                error: t('pages.classroom.common.messages.error.delete'),
            });
        });
    };

    const columns = [
        columnHelper.accessor('school.name', {
            header: ({ column }) => (
                <DataTableColumnHeader
                    title={t('pages.classroom.common.fields.school')}
                    column={column}
                />
            ),
        }),
        columnHelper.accessor('name', {
            header: ({ column }) => (
                <DataTableColumnHeader
                    title={t('pages.classroom.common.fields.name')}
                    column={column}
                />
            ),
        }),
        columnHelper.accessor('grade', {
            header: ({ column }) => (
                <DataTableColumnHeader
                    title={t('pages.classroom.common.fields.grade')}
                    column={column}
                />
            ),
        }),
        columnHelper.accessor('year', {
            header: ({ column }) => (
                <DataTableColumnHeader
                    title={t('pages.classroom.common.fields.year')}
                    column={column}
                />
            ),
        }),
        columnHelper.accessor('active', {
            header: ({ column }) => (
                <DataTableColumnHeader
                    title={t('pages.classroom.common.fields.status')}
                    column={column}
                />
            ),
            cell: ({ row }) => (
                <Badge variant={row.original.active ? 'success' : 'destructive'}>
                    {row.original.active
                        ? t('pages.classroom.common.status.active')
                        : t('pages.classroom.common.status.inactive')}
                </Badge>
            ),
        }),
        columnHelper.display({
            id: 'actions',
            cell: ({ row }) => {
                const classroom = row.original;
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
                                <Link href={route(`${ROUTES.CLASS_ROOMS}.show`, classroom.id)}>
                                    {t('action.show')}
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href={route(`${ROUTES.CLASS_ROOMS}.edit`, classroom.id)}>
                                    {t('action.edit')}
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(classroom)}>
                                {t('action.delete')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        }),
    ] as Array<ColumnDef<ClassRoomResource, ClassRoomResource>>;

    const memoizedColumns = useMemo(() => columns, []);

    return (
        <DataTable
            setFilters={setFilters}
            meta={response?.data?.meta}
            filters={filters}
            filterComponents={(_) => {
                return (
                    <Link
                        href={route(`${ROUTES.CLASS_ROOMS}.create`)}
                        className={buttonVariants({ variant: 'create' })}
                    >
                        {t('pages.classroom.index.buttons.create')}
                    </Link>
                );
            }}
            data={response?.data?.data ?? []}
            columns={memoizedColumns}
            baseRoute={baseRoute}
            baseKey={baseKey}
        />
    );
};

export { Classrooms };
