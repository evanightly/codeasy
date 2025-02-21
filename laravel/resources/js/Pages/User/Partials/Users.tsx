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
import { userServiceHook } from '@/Services/userServiceHook';
import { ROUTES } from '@/Support/Constants/routes';
import { PaginateMeta, PaginateResponse, ServiceFilterOptions } from '@/Support/Interfaces/Others';
import { UserResource } from '@/Support/Interfaces/Resources';
import { Link } from '@inertiajs/react';
import { UseQueryResult } from '@tanstack/react-query';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { useMemo } from 'react';
import { toast } from 'sonner';

interface UsersProps {
    response?: UseQueryResult<PaginateResponse<UserResource>, Error>;
    meta?: PaginateMeta;
    filters?: ServiceFilterOptions;
    setFilters?: (filters: ServiceFilterOptions) => void;
    baseRoute: string;
    baseKey: string;
}

const Users = ({ response, filters, setFilters, baseKey, baseRoute }: UsersProps) => {
    const confirmAction = useConfirmation();
    const columnHelper = createColumnHelper<UserResource>();

    const deleteMutation = userServiceHook.useDelete();

    const handleDeleteUser = async (user: UserResource) => {
        if (!user.id) return;
        confirmAction(async () => {
            toast.promise(deleteMutation.mutateAsync({ id: user.id }), {
                loading: 'Deleting user...',
                success: 'User has been deleted',
                error: 'An error occurred while deleting user',
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
        columnHelper.accessor('username', {
            header: ({ column }) => <DataTableColumnHeader title='Username' column={column} />,
        }),
        columnHelper.accessor('email', {
            header: ({ column }) => <DataTableColumnHeader title='Email' column={column} />,
        }),
        columnHelper.display({
            id: 'actions',
            cell: ({ row }) => {
                const user = row.original;

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
                                <Link href={route(`${ROUTES.USERS}.show`, user.id)}>Show</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href={route(`${ROUTES.USERS}.edit`, user.id)}>Edit</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteUser(user)}>
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        }),
    ] as Array<ColumnDef<UserResource, UserResource>>;

    const memoizedColumns = useMemo(() => columns, []);

    return (
        <DataTable
            setFilters={setFilters}
            meta={response?.data?.meta}
            filters={filters}
            filterComponents={(_) => {
                return (
                    <Link
                        href={route(`${ROUTES.USERS}.create`)}
                        className={buttonVariants({ variant: 'create' })}
                    >
                        Create User
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

export { Users };
