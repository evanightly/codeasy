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
import { roleServiceHook } from '@/Services/roleServiceHook';
import { ROUTES } from '@/Support/Constants/routes';
import { PaginateMeta, PaginateResponse, ServiceFilterOptions } from '@/Support/Interfaces/Others';
import { RoleResource } from '@/Support/Interfaces/Resources';
import { Link } from '@inertiajs/react';
import { UseQueryResult } from '@tanstack/react-query';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { useMemo } from 'react';
import { toast } from 'sonner';
import { useLaravelReactI18n } from 'laravel-react-i18n';

interface RolesProps {
    response?: UseQueryResult<PaginateResponse<RoleResource>, Error>;
    meta?: PaginateMeta;
    filters?: ServiceFilterOptions;
    setFilters?: (filters: ServiceFilterOptions) => void;
    baseRoute: string;
    baseKey: string;
}

const Roles = ({ response, filters, setFilters, baseKey, baseRoute }: RolesProps) => {
    const { t } = useLaravelReactI18n();
    const confirmAction = useConfirmation();
    const columnHelper = createColumnHelper<RoleResource>();

    const deleteMutation = roleServiceHook.useDelete();

    const handleDeleteRole = async (role: RoleResource) => {
        if (!role.id) return;
        confirmAction(async () => {
            toast.promise(deleteMutation.mutateAsync({ id: role.id }), {
                loading: t('pages.role.common.messages.pending.delete'),
                success: t('pages.role.common.messages.success.delete'),
                error: t('pages.role.common.messages.error.delete'),
            });
        });
    };

    const columns = [
        columnHelper.accessor('name', {
            header: ({ column }) => (
                <DataTableColumnHeader title={t('pages.role.index.columns.name')} column={column} />
            ),
        }),
        columnHelper.accessor('guard_name', {
            header: ({ column }) => (
                <DataTableColumnHeader title={t('pages.role.index.columns.guard_name')} column={column} />
            ),
        }),
        columnHelper.accessor('users_count', {
            id: 'users',
            header: ({ column }) => (
                <DataTableColumnHeader title={t('pages.role.index.columns.users')} column={column} />
            ),
        }),
        columnHelper.display({
            id: 'actions',
            cell: ({ row }) => {
                const role = row.original;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant='ghost' className='h-8 w-8 p-0'>
                                <span className='sr-only'>{t('components.dropdown_menu.sr_open_menu')}</span>
                                <MoreHorizontal className='h-4 w-4' />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                            <DropdownMenuItem asChild>
                                <Link href={route(`${ROUTES.ROLES}.show`, role.id)}>{t('action.show')}</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href={route(`${ROUTES.ROLES}.edit`, role.id)}>{t('action.edit')}</Link>
                            </DropdownMenuItem>
                            {role?.deletable && (
                                <DropdownMenuItem onClick={handleDeleteRole.bind(null, role)}>
                                    {t('action.delete')}
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        }),
    ] as Array<ColumnDef<RoleResource, RoleResource>>;

    const memoizedColumns = useMemo(() => columns, []);

    return (
        <DataTable
            setFilters={setFilters}
            meta={response?.data?.meta}
            filters={filters}
            filterComponents={(_) => {
                return (
                    <Link
                        href={route(`${ROUTES.ROLES}.create`)}
                        className={buttonVariants({ variant: 'create' })}
                    >
                        {t('pages.role.index.actions.create')}
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

export { Roles };
