import { DataTable } from '@/Components/UI/data-table';
import { DataTableColumnHeader } from '@/Components/UI/data-table-column-header';
import { PaginateMeta, PaginateResponse, ServiceFilterOptions } from '@/Support/Interfaces/Others';
import { PermissionResource } from '@/Support/Interfaces/Resources';
import { UseQueryResult } from '@tanstack/react-query';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { useMemo } from 'react';

interface PermissionsProps {
    response?: UseQueryResult<PaginateResponse<PermissionResource>, Error>;
    meta?: PaginateMeta;
    filters?: ServiceFilterOptions;
    setFilters?: (filters: ServiceFilterOptions) => void;
    baseRoute: string;
    baseKey: string;
}

const Permissions = ({ response, filters, setFilters, baseKey, baseRoute }: PermissionsProps) => {
    const columnHelper = createColumnHelper<PermissionResource>();

    const columns = [
        columnHelper.accessor('name', {
            meta: {
                title: 'Name',
            },
            header: ({ column }) => <DataTableColumnHeader title="Name" column={column} />,
        }),
        columnHelper.accessor('group', {
            header: ({ column }) => <DataTableColumnHeader title="Group" column={column} />,
        }),
    ] as Array<ColumnDef<PermissionResource, PermissionResource>>;

    const memoizedColumns = useMemo(() => columns, []);

    return (
        <DataTable
            setFilters={setFilters}
            meta={response?.data?.meta}
            filters={filters}
            data={response?.data?.data ?? []}
            columns={memoizedColumns}
            baseRoute={baseRoute}
            baseKey={baseKey}
        />
    );
};

export { Permissions };
