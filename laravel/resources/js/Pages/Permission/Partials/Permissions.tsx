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
import { permissionServiceHook } from '@/Services/permissionServiceHook';
import { ROUTES } from '@/Support/Constants/routes';
import { PermissionEnum } from '@/Support/Enums/permissionEnum';
import { PaginateMeta, PaginateResponse, ServiceFilterOptions } from '@/Support/Interfaces/Others';
import { PermissionResource } from '@/Support/Interfaces/Resources';
import { Link } from '@inertiajs/react';
import { UseQueryResult } from '@tanstack/react-query';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { MoreHorizontal } from 'lucide-react';
import { useMemo } from 'react';
import { toast } from 'sonner';

interface PermissionsProps {
    response?: UseQueryResult<PaginateResponse<PermissionResource>, Error>;
    meta?: PaginateMeta;
    filters?: ServiceFilterOptions;
    setFilters?: (filters: ServiceFilterOptions) => void;
    baseRoute: string;
    baseKey: string;
}

const Permissions = ({ response, filters, setFilters, baseKey, baseRoute }: PermissionsProps) => {
    const { t } = useLaravelReactI18n();
    const confirmAction = useConfirmation();
    const columnHelper = createColumnHelper<PermissionResource>();

    const deleteMutation = permissionServiceHook.useDelete();

    const handleDeletePermission = async (permission: PermissionResource) => {
        if (!permission.id || Object.values(PermissionEnum).includes(permission?.name ?? ''))
            return;
        confirmAction(async () => {
            toast.promise(deleteMutation.mutateAsync({ id: permission.id }), {
                loading: t('pages.permission.common.messages.pending.delete'),
                success: t('pages.permission.common.messages.success.delete'),
                error: t('pages.permission.common.messages.error.delete'),
            });
        });
    };

    const columns = [
        columnHelper.accessor('name', {
            id: t('pages.permission.index.columns.name'),
            header: ({ column }) => (
                <DataTableColumnHeader
                    title={t('pages.permission.index.columns.name')}
                    column={column}
                />
            ),
        }),
        columnHelper.accessor('group', {
            id: t('pages.permission.index.columns.group'),
            header: ({ column }) => (
                <DataTableColumnHeader
                    title={t('pages.permission.index.columns.group')}
                    column={column}
                />
            ),
        }),
        columnHelper.display({
            id: 'actions',
            cell: ({ row }) => {
                const permission = row.original;
                const isPredefined = Object.values(PermissionEnum).includes(permission?.name ?? '');

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
                                <Link href={route(`${ROUTES.PERMISSIONS}.show`, permission.id)}>
                                    {t('action.show')}
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem disabled={isPredefined} asChild>
                                <Link href={route(`${ROUTES.PERMISSIONS}.edit`, permission.id)}>
                                    {t('action.edit')}
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => handleDeletePermission(permission)}
                                disabled={isPredefined}
                            >
                                {t('action.delete')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        }),
    ] as Array<ColumnDef<PermissionResource, PermissionResource>>;

    const memoizedColumns = useMemo(() => columns, []);

    return (
        <DataTable
            setFilters={setFilters}
            meta={response?.data?.meta}
            filters={filters}
            filterComponents={(_) => {
                return (
                    <Link
                        href={route(`${ROUTES.PERMISSIONS}.create`)}
                        className={buttonVariants({ variant: 'create' })}
                    >
                        {t('pages.permission.index.actions.create')}
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

export { Permissions };
