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
import { schoolRequestServiceHook } from '@/Services/schoolRequestServiceHook';
import { ROUTES } from '@/Support/Constants/routes';
import { RoleEnum } from '@/Support/Enums/roleEnum';
import { SchoolRequestStatusEnum } from '@/Support/Enums/schoolRequestStatusEnum';
import { PaginateMeta, PaginateResponse, ServiceFilterOptions } from '@/Support/Interfaces/Others';
import { SchoolRequestResource } from '@/Support/Interfaces/Resources';
import { Link, usePage } from '@inertiajs/react';
import { UseQueryResult } from '@tanstack/react-query';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { useMemo } from 'react';
import { toast } from 'sonner';

interface SchoolRequestsProps {
    response?: UseQueryResult<PaginateResponse<SchoolRequestResource>, Error>;
    meta?: PaginateMeta;
    filters?: ServiceFilterOptions;
    setFilters?: (filters: ServiceFilterOptions) => void;
    baseRoute: string;
    baseKey: string;
}

const SchoolRequests = ({
    response,
    filters,
    setFilters,
    baseKey,
    baseRoute,
}: SchoolRequestsProps) => {
    const { user } = usePage().props.auth;
    const confirmAction = useConfirmation();
    const columnHelper = createColumnHelper<SchoolRequestResource>();

    const deleteMutation = schoolRequestServiceHook.useDelete();
    const approveMutation = schoolRequestServiceHook.useApprove();
    const rejectMutation = schoolRequestServiceHook.useReject();

    const handleDelete = async (request: SchoolRequestResource) => {
        if (!request.id) return;
        confirmAction(async () => {
            toast.promise(deleteMutation.mutateAsync({ id: request.id }), {
                loading: 'Deleting request...',
                success: 'Request has been deleted',
                error: 'An error occurred while deleting request',
            });
        });
    };

    const handleApprove = async (request: SchoolRequestResource) => {
        confirmAction(async () => {
            toast.promise(
                approveMutation.mutateAsync({
                    id: request.id,
                }),
                {
                    loading: 'Approving request...',
                    success: 'Request approved successfully',
                    error: 'Failed to approve request',
                },
            );
        });
    };

    const handleReject = async (request: SchoolRequestResource) => {
        confirmAction(async () => {
            toast.promise(
                rejectMutation.mutateAsync({
                    id: request.id,
                }),
                {
                    loading: 'Rejecting request...',
                    success: 'Request rejected successfully',
                    error: 'Failed to reject request',
                },
            );
        });
    };

    const getStatusBadgeVariant = (status?: string) => {
        if (!status) return 'secondary';
        switch (status.toLowerCase()) {
            case SchoolRequestStatusEnum.APPROVED:
                return 'success';
            case SchoolRequestStatusEnum.PENDING:
                return 'warning';
            case SchoolRequestStatusEnum.REJECTED:
                return 'destructive';
            default:
                return 'secondary';
        }
    };

    const columns = [
        columnHelper.accessor('user.name', {
            header: ({ column }) => <DataTableColumnHeader title='User' column={column} />,
        }),
        columnHelper.accessor('school.name', {
            header: ({ column }) => <DataTableColumnHeader title='School' column={column} />,
        }),
        columnHelper.accessor('status', {
            header: ({ column }) => <DataTableColumnHeader title='Status' column={column} />,
            cell: ({ getValue }) => {
                const status = getValue();
                return <Badge variant={getStatusBadgeVariant(status)}>{status}</Badge>;
            },
        }),
        columnHelper.accessor('message', {
            header: ({ column }) => <DataTableColumnHeader title='Message' column={column} />,
        }),
        columnHelper.display({
            id: 'actions',
            cell: ({ row }) => {
                const request = row.original;
                const isAdmin =
                    user.roles.includes(RoleEnum.SUPER_ADMIN) ||
                    user.roles.includes(RoleEnum.SCHOOL_ADMIN);
                const isPending = request.status === SchoolRequestStatusEnum.PENDING;

                if (!isPending) return null;

                return isAdmin ? (
                    <div className='flex gap-2'>
                        <Button variant='success' size='sm' onClick={() => handleApprove(request)}>
                            Approve
                        </Button>
                        <Button
                            variant='destructive'
                            size='sm'
                            onClick={() => handleReject(request)}
                        >
                            Reject
                        </Button>
                    </div>
                ) : (
                    user.id === request.user_id && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant='ghost' className='h-8 w-8 p-0'>
                                    <span className='sr-only'>Open menu</span>
                                    <MoreHorizontal className='h-4 w-4' />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end'>
                                <DropdownMenuItem asChild>
                                    <Link
                                        href={route(`${ROUTES.SCHOOL_REQUESTS}.edit`, request.id)}
                                    >
                                        Edit
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDelete(request)}>
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )
                );
            },
        }),
    ] as Array<ColumnDef<SchoolRequestResource, SchoolRequestResource>>;

    const memoizedColumns = useMemo(() => columns, []);

    return (
        <DataTable
            setFilters={setFilters}
            meta={response?.data?.meta}
            filters={filters}
            filterComponents={(_) => {
                return (
                    user.roles.includes(RoleEnum.TEACHER) && (
                        <Link
                            href={route(`${ROUTES.SCHOOL_REQUESTS}.create`)}
                            className={buttonVariants({ variant: 'create' })}
                        >
                            Create Request
                        </Link>
                    )
                );
            }}
            data={response?.data?.data ?? []}
            columns={memoizedColumns}
            baseRoute={baseRoute}
            baseKey={baseKey}
        />
    );
};

export { SchoolRequests };
