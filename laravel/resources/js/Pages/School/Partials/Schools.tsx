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
import { schoolServiceHook } from '@/Services/schoolServiceHook';
import { ROUTES } from '@/Support/Constants/routes';
import { PaginateMeta, PaginateResponse, ServiceFilterOptions } from '@/Support/Interfaces/Others';
import { SchoolResource } from '@/Support/Interfaces/Resources';
import { Link } from '@inertiajs/react';
import { UseQueryResult } from '@tanstack/react-query';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { useMemo } from 'react';
import { toast } from 'sonner';

interface SchoolsProps {
    response?: UseQueryResult<PaginateResponse<SchoolResource>, Error>;
    meta?: PaginateMeta;
    filters?: ServiceFilterOptions;
    setFilters?: (filters: ServiceFilterOptions) => void;
    baseRoute: string;
    baseKey: string;
}

const Schools = ({ response, filters, setFilters, baseKey, baseRoute }: SchoolsProps) => {
    const confirmAction = useConfirmation();
    const columnHelper = createColumnHelper<SchoolResource>();

    const deleteMutation = schoolServiceHook.useDelete();

    const handleDeleteSchool = async (school: SchoolResource) => {
        if (!school.id) return;
        confirmAction(async () => {
            toast.promise(deleteMutation.mutateAsync({ id: school.id }), {
                loading: 'Deleting school...',
                success: 'School has been deleted',
                error: 'An error occurred while deleting school',
            });
        });
    };

    const columns = [
        columnHelper.accessor('name', {
            header: ({ column }) => <DataTableColumnHeader title='Name' column={column} />,
        }),
        columnHelper.accessor('address', {
            header: ({ column }) => <DataTableColumnHeader title='Address' column={column} />,
        }),
        columnHelper.accessor('city', {
            header: ({ column }) => <DataTableColumnHeader title='City' column={column} />,
        }),
        columnHelper.accessor('phone', {
            header: ({ column }) => <DataTableColumnHeader title='Phone' column={column} />,
        }),
        columnHelper.accessor('email', {
            header: ({ column }) => <DataTableColumnHeader title='Email' column={column} />,
        }),
        columnHelper.display({
            id: 'actions',
            cell: ({ row }) => {
                const school = row.original;

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
                                <Link href={route(`${ROUTES.SCHOOLS}.edit`, school.id)}>Edit</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteSchool(school)}>
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        }),
    ] as Array<ColumnDef<SchoolResource, SchoolResource>>;

    const memoizedColumns = useMemo(() => columns, []);

    return (
        <DataTable
            setFilters={setFilters}
            meta={response?.data?.meta}
            filters={filters}
            filterComponents={(_) => {
                return (
                    <Link
                        href={route(`${ROUTES.SCHOOLS}.create`)}
                        className={buttonVariants({ variant: 'create' })}
                    >
                        Create School
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

export { Schools };
