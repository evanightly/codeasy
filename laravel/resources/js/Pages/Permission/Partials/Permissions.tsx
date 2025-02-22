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
import { PaginateMeta, PaginateResponse, ServiceFilterOptions } from '@/Support/Interfaces/Others';
import { PermissionResource } from '@/Support/Interfaces/Resources';
import { Link } from '@inertiajs/react';
import { UseQueryResult } from '@tanstack/react-query';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
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
    const confirmAction = useConfirmation();
    const columnHelper = createColumnHelper<PermissionResource>();

    const deleteMutation = permissionServiceHook.useDelete();

    const handleDeletePermission = async (permission: PermissionResource) => {
        if (!permission.id) return;
        confirmAction(async () => {
            toast.promise(deleteMutation.mutateAsync({ id: permission.id }), {
                loading: 'Deleting permission...',
                success: 'Permission has been deleted',
                error: 'An error occurred while deleting permission',
            });
        });
    };

    const columns = [
        columnHelper.accessor('name', {
            meta: {
                title: 'Name',
            },
            header: ({ column }) => <DataTableColumnHeader title='Name' column={column} />,
        }),
        columnHelper.accessor('group', {
            header: ({ column }) => <DataTableColumnHeader title='Group' column={column} />,
        }),
        columnHelper.accessor('users_count', {
            id: 'users count',
            header: ({ column }) => <DataTableColumnHeader title='Users Count' column={column} />,
        }),
        columnHelper.accessor('roles_count', {
            id: 'roles count',
            header: ({ column }) => <DataTableColumnHeader title='Roles Count' column={column} />,
        }),
        columnHelper.display({
            id: 'actions',
            cell: ({ row }) => {
                const permission = row.original;

                const canBeDeleted = permission.roles_count === 0 && permission.users_count === 0;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant='ghost' className='h-8 w-8 p-0'>
                                <span className='sr-only'>Open menu</span>
                                <MoreHorizontal className='h-4 w-4' />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                            <DropdownMenuItem asChild>
                                <Link href={route(`${ROUTES.PERMISSIONS}.show`, permission.id)}>
                                    Show
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem disabled asChild>
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeletePermission(permission)}>
                                Delete
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
                        Create Permission
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
