import { Avatar, AvatarFallback } from '@/Components/UI/avatar';
import { Button } from '@/Components/UI/button';
import { Checkbox } from '@/Components/UI/checkbox';
import { DataTable } from '@/Components/UI/data-table';
import { DataTableColumnHeader } from '@/Components/UI/data-table-column-header';
import { ScrollArea } from '@/Components/UI/scroll-area';
import { Separator } from '@/Components/UI/separator';
import { UserResource } from '@/Support/Interfaces/Resources';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { Trash2, UserMinus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface Props {
    users?: UserResource[];
    emptyMessage?: string;
    maxHeight?: string;
    canDelete?: boolean;
    onDelete?: (userId: number) => void;
    onBulkDelete?: (userIds: number[]) => void;
    useDataTable?: boolean;
}

export function UsersList({
    users,
    emptyMessage = 'No users found',
    maxHeight = '300px',
    canDelete = false,
    onDelete,
    onBulkDelete,
    useDataTable = false,
}: Props) {
    const { t } = useLaravelReactI18n();
    const [selectedUsers, setSelectedUsers] = useState<UserResource[]>([]);
    const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
    const columnHelper = createColumnHelper<UserResource>();

    const showDeleteButton = canDelete;

    if (!users?.length) {
        return <p className='text-sm text-muted-foreground'>{emptyMessage}</p>;
    }

    const handleBulkDelete = () => {
        if (selectedUsers.length === 0) return;

        const userIds = selectedUsers.map((user) => user.id);
        onBulkDelete?.(userIds);
        setSelectedUsers([]);
        setRowSelection({});
    };

    // Sync TanStack row selection with component state
    useEffect(() => {
        if (!users) return;

        const selectedRows = Object.keys(rowSelection)
            .filter((key) => rowSelection[key])
            .map((id) => users.find((user) => user.id.toString() === id))
            .filter(Boolean) as UserResource[];

        setSelectedUsers(selectedRows);
    }, [rowSelection, users]);

    const handleSingleDelete = (userId: number) => {
        onDelete?.(userId);
    };

    // DataTable columns for bulk operations
    const columns = [
        // Checkbox column for row selection
        columnHelper.display({
            id: 'select',
            header: ({ table }) => (
                <Checkbox
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && 'indeterminate')
                    }
                    aria-label='Select all'
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    checked={row.getIsSelected()}
                    aria-label='Select row'
                />
            ),
            enableSorting: false,
            enableHiding: false,
            size: 40,
        }),
        columnHelper.display({
            id: 'avatar',
            header: '',
            cell: ({ row }) => (
                <Avatar className='h-8 w-8'>
                    <AvatarFallback className='text-xs'>
                        {row.original.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
            ),
            enableSorting: false,
            size: 50,
        }),
        columnHelper.accessor('name', {
            header: ({ column }) => (
                <DataTableColumnHeader
                    title={t('pages.school.common.fields.name')}
                    column={column}
                />
            ),
            cell: ({ row }) => <div className='font-medium'>{row.original.name}</div>,
        }),
        columnHelper.accessor('email', {
            header: ({ column }) => (
                <DataTableColumnHeader
                    title={t('pages.school.common.fields.email')}
                    column={column}
                />
            ),
            cell: ({ row }) => <div className='text-muted-foreground'>{row.original.email}</div>,
        }),
        ...(showDeleteButton
            ? [
                  columnHelper.display({
                      id: 'actions',
                      header: () => t('action.actions'),
                      cell: ({ row }) => (
                          <Button
                              variant='ghost'
                              size='icon'
                              onClick={() => handleSingleDelete(row.original.id)}
                              className='text-destructive hover:text-destructive'
                          >
                              <Trash2 className='h-4 w-4' />
                          </Button>
                      ),
                      enableSorting: false,
                      size: 60,
                  }),
              ]
            : []),
    ] as Array<ColumnDef<UserResource, UserResource>>;

    const memoizedColumns = useMemo(() => columns, [showDeleteButton, t]);

    if (useDataTable && showDeleteButton && onBulkDelete) {
        return (
            <div className='space-y-4'>
                {selectedUsers.length > 0 && (
                    <div className='flex items-center justify-between rounded-lg border bg-muted/50 p-3'>
                        <span className='text-sm font-medium'>
                            {t('pages.school.common.bulk_actions.selected_count', {
                                count: selectedUsers.length,
                            })}
                        </span>
                        <Button
                            variant='destructive'
                            size='sm'
                            onClick={handleBulkDelete}
                            className='gap-2'
                        >
                            <UserMinus className='h-4 w-4' />
                            {t('pages.school.common.bulk_actions.unassign_selected')}
                        </Button>
                    </div>
                )}

                <DataTable
                    tableOptions={{
                        enableRowSelection: true,
                        state: {
                            rowSelection,
                        },
                        onRowSelectionChange: setRowSelection,
                        getRowId: (row) => row.id.toString(),
                    }}
                    data={users}
                    columns={memoizedColumns}
                />
            </div>
        );
    }

    // Original list view for backward compatibility
    return (
        <ScrollArea className={`h-[${maxHeight}]`}>
            <div className='space-y-4'>
                {users.map((user, index) => (
                    <div key={user.id}>
                        <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-4'>
                                <Avatar>
                                    <AvatarFallback>
                                        {user.name?.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className='space-y-1'>
                                    <p className='text-sm font-medium leading-none'>{user.name}</p>
                                    <p className='text-sm text-muted-foreground'>{user.email}</p>
                                </div>
                            </div>
                            {showDeleteButton && (
                                <Button
                                    variant='ghost'
                                    size='icon'
                                    onClick={() => handleSingleDelete(user.id)}
                                    className='text-destructive hover:text-destructive'
                                >
                                    <Trash2 className='h-4 w-4' />
                                </Button>
                            )}
                        </div>
                        {index < users.length - 1 && <Separator className='mt-4' />}
                    </div>
                ))}
            </div>
        </ScrollArea>
    );
}
