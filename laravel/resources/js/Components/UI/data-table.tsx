'use client';

import GenericFilters from '@/Components/GenericFilters';
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
import { HTMLAttributes, useCallback, useEffect, useMemo, useRef, useState } from 'react';

// Keys to exclude from auto-detection (typically non-sortable fields or complex objects)
const EXCLUDED_KEYS = ['metadata', 'pivot', 'permissions'];

// Common sortable fields to include even if not explicitly defined
const COMMON_SORTABLE_FIELDS = [
    { key: 'id', label: 'ID' },
    { key: 'created_at', label: 'Created At' },
    { key: 'updated_at', label: 'Updated At' },
];

// Row height options for density control
const ROW_HEIGHT_OPTIONS = {
    compact: 35,
    default: 48,
    relaxed: 56,
};

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
    /**
     * Additional columns to make available for sorting beyond auto-detected ones
     */
    additionalSortColumns?: Array<{ key: string; label: string }>;
    /**
     * Relations available for relation count sorting beyond auto-detected ones
     */
    availableSortRelations?: Array<{ key: string; label: string }>;
    /**
     * Estimated row height for virtualization
     */
    estimatedRowHeight?: number;
    /**
     * Number of rows to render beyond the visible area (improves scrolling experience)
     */
    overscan?: number;
}

const tableVariants = cva('w-full text-sm', {
    variants: {
        variant: {
            compact: 'group table-compact [&_th]:h-8 [&_td]:py-2 [&_td]:px-2',
            default: '[&_tr]:h-12',
            relaxed: '[&_tr]:h-14 [&_td]:py-4',
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
    variant = 'default',
    header,
    showPagination = true,
    filters,
    setFilters,
    filterComponents,
    tableOptions,
    additionalSortColumns = [],
    availableSortRelations = [],
    estimatedRowHeight = 60,
    overscan = 10,
}: DataTableProps<TData, TValue, R> &
    VariantProps<typeof tableVariants> &
    HTMLAttributes<HTMLTableSectionElement> & {
        tableOptions?: Partial<TableOptions<TData>>;
    }) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState({});
    const [density, setDensity] = useState<'compact' | 'default' | 'relaxed'>('default');

    // Get the appropriate row height based on the selected density
    const rowHeight = ROW_HEIGHT_OPTIONS[density];

    // Container ref to measure available width/height
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

    // Update container size on mount and when window resizes
    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                setContainerSize({
                    width: rect.width,
                    height: window.innerHeight - rect.top - 100, // Leave some space at the bottom
                });
            }
        };

        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    // Detect columns from table data
    const detectedSortColumns = useMemo(() => {
        if (!data || data.length === 0) return [];

        const firstItem = data[0];
        const columns: Array<{ key: string; label: string }> = [];

        if (firstItem) {
            // Get column names from the first data item
            Object.keys(firstItem).forEach((key) => {
                // Skip if it's in excluded keys list
                if (EXCLUDED_KEYS.some((excluded) => key.includes(excluded))) return;

                // Skip if it's an array or object (likely a relation)
                const value = firstItem[key as keyof typeof firstItem];
                if (Array.isArray(value) || (typeof value === 'object' && value !== null)) return;

                // Skip if it's already in common sortable fields
                if (COMMON_SORTABLE_FIELDS.some((field) => field.key === key)) return;

                // Add to auto-detected columns with translated label if available
                columns.push({
                    key,
                    label: key,
                });
            });
        }

        return columns;
    }, [data]);

    // Detect relations from table data
    const detectedSortRelations = useMemo(() => {
        if (!data || data.length === 0) return [];

        const firstItem = data[0];
        const relations: Array<{ key: string; label: string }> = [];

        if (firstItem) {
            // Look for potential relation keys
            Object.keys(firstItem).forEach((key) => {
                // Check for relation count fields
                if (key.endsWith('_count')) {
                    const relationName = key.replace('_count', '');

                    // Skip if already in available relations
                    if (availableSortRelations.some((rel) => rel.key === relationName)) return;

                    relations.push({
                        key: relationName,
                        label: relationName,
                    });
                }

                // Check for actual relation objects
                const value = firstItem[key as keyof typeof firstItem];
                if (
                    Array.isArray(value) ||
                    (typeof value === 'object' &&
                        value !== null &&
                        key !== 'pivot' &&
                        !key.includes('metadata'))
                ) {
                    // Skip if already in available relations
                    if (availableSortRelations.some((rel) => rel.key === key)) return;

                    relations.push({
                        key,
                        label: key,
                    });
                }
            });
        }

        return relations;
    }, [data, availableSortRelations]);

    // Combine detected columns with manually specified ones
    const combinedSortColumns = useMemo(() => {
        return [...COMMON_SORTABLE_FIELDS, ...detectedSortColumns, ...additionalSortColumns].filter(
            (column, index, self) =>
                // Remove duplicates
                index === self.findIndex((c) => c.key === column.key),
        );
    }, [detectedSortColumns, additionalSortColumns]);

    // Combine detected relations with manually specified ones
    const combinedSortRelations = useMemo(() => {
        return [...detectedSortRelations, ...availableSortRelations].filter(
            (relation, index, self) =>
                // Remove duplicates
                index === self.findIndex((r) => r.key === relation.key),
        );
    }, [detectedSortRelations, availableSortRelations]);

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

    const { rows } = table.getRowModel();

    // Create a virtualized list of rows
    const rowVirtualizer = useVirtualizer({
        count: rows.length,
        getScrollElement: () => containerRef.current,
        estimateSize: useCallback(() => rowHeight, [rowHeight]),
        overscan,
        scrollMargin: 0,
    });

    const virtualRows = rowVirtualizer.getVirtualItems();
    const totalHeight = rowVirtualizer.getTotalSize();
    const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0;
    const paddingBottom =
        virtualRows.length > 0 ? totalHeight - virtualRows[virtualRows.length - 1].end : 0;

    const handlePageChange = (page: number) => {
        if (!setFilters) return;
        setFilters({ ...filters, page });

        // Scroll back to top when changing pages
        if (containerRef.current) {
            containerRef.current.scrollTop = 0;
        }
    };

    // const toggleDensity = () => {
    //     setDensity((prev) => {
    //         if (prev === 'compact') return 'default';
    //         if (prev === 'default') return 'relaxed';
    //         return 'compact';
    //     });
    // };

    // const densityIcon =
    //     density === 'compact' ? (
    //         <ZoomIn className='h-4 w-4' />
    //     ) : density === 'relaxed' ? (
    //         <ZoomOut className='h-4 w-4' />
    //     ) : (
    //         <ZoomIn className='h-4 w-4 opacity-50' />
    //     );

    return (
        <>
            {filters && setFilters && (
                <GenericFilters
                    setFilters={setFilters}
                    filters={filters}
                    data={data as unknown as R[]}
                    availableSortRelations={combinedSortRelations}
                    additionalSortColumns={combinedSortColumns}
                >
                    {typeof filterComponents === 'function' &&
                        filterComponents(filters, setFilters)}

                    <div className='ml-auto flex items-center gap-2'>
                        {/* <Button onClick={toggleDensity} size='icon' title={`Current density: ${density}`} variant='outline'>
                            {densityIcon}
                        </Button> */}

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant='outline'>
                                    Columns <Eye className='ml-2 h-4 w-4 opacity-50' />
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
                    </div>
                </GenericFilters>
            )}

            <div
                style={{
                    height: containerSize.height > 0 ? `${containerSize.height}px` : '600px',
                    width: '100%',
                    overflow: 'auto',
                }}
                ref={containerRef}
                className={ny(tableVariants({ variant, header }), className)}
            >
                <Table>
                    <TableHeader
                        className={header === 'fixed' ? 'sticky top-0 z-10 bg-background' : ''}
                    >
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} colSpan={header.colSpan}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef.header,
                                                  header.getContext(),
                                              )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {paddingTop > 0 && (
                            <tr>
                                <td
                                    style={{ height: `${paddingTop}px` }}
                                    colSpan={columns.length}
                                />
                            </tr>
                        )}
                        {virtualRows.map((virtualRow) => {
                            const row = rows[virtualRow.index];
                            return (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && 'selected'}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            style={{ height: `${rowHeight}px` }}
                                            key={cell.id}
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            );
                        })}
                        {paddingBottom > 0 && (
                            <tr>
                                <td
                                    style={{ height: `${paddingBottom}px` }}
                                    colSpan={columns.length}
                                />
                            </tr>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className='flex flex-1 items-center justify-end space-x-2 py-4'>
                {tableOptions?.enableRowSelection && (
                    <div className='flex-1 text-sm text-muted-foreground'>
                        {table.getFilteredSelectedRowModel().rows.length} of{' '}
                        {table.getFilteredRowModel().rows.length} row(s) selected.
                    </div>
                )}

                {showPagination && meta && setFilters && baseKey && baseRoute && (
                    <GenericQueryPagination
                        meta={meta}
                        handleChangePage={handlePageChange}
                        filters={filters}
                        className='w-fit justify-end'
                        baseRoute={baseRoute}
                        baseKey={baseKey}
                    />
                )}
            </div>
        </>
    );
}
