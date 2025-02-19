'use client';

import GenericFilters from '@/Components/GenericFilters';
import GenericPagination from '@/Components/GenericPagination';
import GenericQueryPagination from '@/Components/GenericQueryPagination';
import { Button } from '@/Components/UI/button';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/Components/UI/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/UI/table';
import { ny } from '@/Lib/Utils';
import { PaginateMeta, ServiceFilterOptions } from '@/Support/Interfaces/Others';
import { Resource } from '@/Support/Interfaces/Resources';
import {
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { TableOptions } from '@tanstack/table-core';
import { cva, type VariantProps } from 'class-variance-authority';
import { Eye } from 'lucide-react';
import * as React from 'react';
import { HTMLAttributes } from 'react';

interface DataTableProps<TData, TValue, R extends Resource = Resource> {
    baseRoute?: string;
    baseKey?: string;
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    meta?: PaginateMeta;
    showPagination?: boolean;
    filters?: ServiceFilterOptions<R>;
    setFilters?: (filters: ServiceFilterOptions<R>) => void;
    filterComponents?: (
        filters: ServiceFilterOptions<R>,
        setFilters: (filters: ServiceFilterOptions<R>) => void,
    ) => React.ReactNode;
}

const tableVariants = cva('w-full text-sm min-h-[400px]', {
    variants: {
        variant: {
            compact: 'group table-compact [&_th]:h-8 [&_td]:p-0 [&_td]:px-2',
            default: '[&_tr]:h-10',
        },
        header: {
            fixed: 'sticky top-0 z-10',
            default: '',
        },
    },
    defaultVariants: {
        variant: 'default',
        header: 'default',
    },
});

export function DataTable<TData, TValue, R extends Resource = Resource>({
    baseRoute,
    baseKey,
    columns,
    data,
    meta,
    className,
    variant,
    header,
    showPagination = true,
    filters,
    setFilters,
    filterComponents,
    tableOptions,
}: DataTableProps<TData, TValue, R> &
    VariantProps<typeof tableVariants> &
    HTMLAttributes<HTMLTableSectionElement> & {
        tableOptions?: Partial<TableOptions<TData>>;
    }) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState({});

    const table = useReactTable({
        ...tableOptions,
        data,
        columns,
        state: {
            ...tableOptions?.state,
            sorting,
            columnFilters,
            columnVisibility,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        manualPagination: !!meta,
        pageCount: meta?.last_page,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    const parentRef = React.useRef<HTMLDivElement>(null);
    const { rows } = table.getRowModel();

    const virtualizer = useVirtualizer({
        count: rows.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 35,
        overscan: 20,
    });

    const handlePageChange = (page: number) => {
        if (!setFilters) return;
        setFilters({ ...filters, page });
    };

    return (
        <>
            {filters && setFilters && (
                <GenericFilters setFilters={setFilters} filters={filters}>
                    {typeof filterComponents === 'function' &&
                        filterComponents(filters, setFilters)}

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant='outline' className='ml-auto'>
                                Columns Visibility <Eye opacity={0.5} />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column: any) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            onSelect={(e) => e.preventDefault()}
                                            onCheckedChange={(value) =>
                                                column.toggleVisibility(value)
                                            }
                                            key={column.id}
                                            className='capitalize'
                                            checked={column.getIsVisible()}
                                        >
                                            {column.columnDef.meta?.title ?? column.id}
                                        </DropdownMenuCheckboxItem>
                                    );
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </GenericFilters>
            )}

            <div className={ny(tableVariants({ variant, header }), className)}>
                <div ref={parentRef}>
                    <Table style={{ height: `${virtualizer.getTotalSize()}px` }}>
                        <TableHeader className={header === 'fixed' ? 'bg-background' : ''}>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <TableHead key={header.id} colSpan={header.colSpan}>
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                          header.column.columnDef.header,
                                                          header.getContext(),
                                                      )}
                                            </TableHead>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody className='relative h-full'>
                            {virtualizer.getVirtualItems().map((virtualRow, index) => {
                                const row = rows[virtualRow.index];
                                return (
                                    <TableRow
                                        style={{
                                            height: `${virtualRow.size}px`,
                                            transform: `translateY(${
                                                virtualRow.start - index * virtualRow.size
                                            }px)`,
                                        }}
                                        key={row.id}
                                        data-state={row.getIsSelected() && 'selected'}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext(),
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <div className='flex flex-1 items-center justify-end space-x-2 py-4'>
                {tableOptions?.enableRowSelection && (
                    <div className='flex-1 text-sm text-muted-foreground'>
                        {table.getFilteredSelectedRowModel().rows.length} of{' '}
                        {table.getFilteredRowModel().rows.length} row(s) selected.
                    </div>
                )}

                {showPagination && meta && setFilters && baseKey && baseRoute ? (
                    <GenericQueryPagination
                        meta={meta}
                        handleChangePage={handlePageChange}
                        filters={filters}
                        className='w-fit justify-end'
                        baseRoute={baseRoute}
                        baseKey={baseKey}
                    />
                ) : (
                    <GenericPagination meta={meta} handleChangePage={handlePageChange} />
                )}
            </div>
        </>
    );
}
