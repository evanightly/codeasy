import { Badge } from '@/Components/UI/badge';
import { Button } from '@/Components/UI/button';
import { Checkbox } from '@/Components/UI/checkbox';
import { DataTable } from '@/Components/UI/data-table';
import { DataTableColumnHeader } from '@/Components/UI/data-table-column-header';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/UI/dialog';
import { userServiceHook } from '@/Services/userServiceHook';
import { RoleEnum } from '@/Support/Enums/roleEnum';
import { ServiceFilterOptions } from '@/Support/Interfaces/Others';
import { UserResource } from '@/Support/Interfaces/Resources';
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useEffect, useMemo, useState } from 'react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onAssign: (userIds: number[]) => void;
    loading?: boolean;
    title: string;
    description: string;
    buttonText: string;
    allowedRoles?: RoleEnum[];
    excludeSchoolIds?: number[];
    requiredSchoolId?: number;
    excludeClassroomIds?: number[];
    requiredClassroomId?: number;
    multiSelect?: boolean;
}

export function AssignUserDialog({
    isOpen,
    onClose,
    onAssign,
    loading,
    title,
    description,
    buttonText,
    allowedRoles = [RoleEnum.STUDENT],
    excludeSchoolIds = [],
    requiredSchoolId,
    excludeClassroomIds = [],
    requiredClassroomId,
    multiSelect = true,
}: Props) {
    const { t } = useLaravelReactI18n();
    const [selectedUsers, setSelectedUsers] = useState<UserResource[]>([]);
    const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
    const [availableUsers, setAvailableUsers] = useState<UserResource[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);

    const columnHelper = createColumnHelper<UserResource>();

    const fetchUsers = async () => {
        try {
            setIsLoadingUsers(true);

            const filters: ServiceFilterOptions = {
                page_size: 'all',
                relations: 'roles,schools,classrooms',
                relations_array_filters: {
                    roles: allowedRoles,
                },
            };

            // Add school filtering if specified
            if (requiredSchoolId) {
                filters.relations_array_filters!.schools = [requiredSchoolId];
            } else if (excludeSchoolIds.length > 0) {
                filters.relations_array_filters!.schools = excludeSchoolIds.map((id) => `!${id}`);
            }

            // Add classroom filtering if specified
            if (requiredClassroomId) {
                filters.relations_array_filters!.classrooms = [requiredClassroomId];
            } else if (excludeClassroomIds.length > 0) {
                filters.relations_array_filters!.classrooms = excludeClassroomIds.map(
                    (id) => `!${id}`,
                );
            }

            const response = await userServiceHook.getAll({ filters });
            console.log(response);

            setAvailableUsers(response.data || []);
        } catch (error) {
            console.error('Failed to fetch users:', error);
            setAvailableUsers([]);
        } finally {
            setIsLoadingUsers(false);
        }
    };

    // Sync TanStack row selection with component state
    useEffect(() => {
        const selectedRows = Object.keys(rowSelection)
            .filter((key) => rowSelection[key])
            .map((id) => availableUsers.find((user) => user.id.toString() === id))
            .filter(Boolean) as UserResource[];

        setSelectedUsers(selectedRows);
    }, [rowSelection, availableUsers]);

    useEffect(() => {
        if (isOpen) {
            fetchUsers();
        } else {
            setSelectedUsers([]);
            setRowSelection({});
        }
    }, [isOpen, requiredSchoolId, requiredClassroomId]);

    const handleAssign = () => {
        if (selectedUsers.length > 0) {
            const userIds = selectedUsers.map((user) => user.id);
            onAssign(userIds);
        }
    };

    const columns = [
        // Checkbox column for row selection (only if multiSelect is true)
        ...(multiSelect
            ? [
                  columnHelper.display({
                      id: 'select',
                      header: ({ table }) => (
                          <Checkbox
                              onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                              checked={
                                  table.getIsAllPageRowsSelected() ||
                                  (table.getIsSomePageRowsSelected() && 'indeterminate')
                              }
                              aria-label={t('components.assign_user_dialog.actions.select_all')}
                          />
                      ),
                      cell: ({ row }) => (
                          <Checkbox
                              onCheckedChange={(value) => row.toggleSelected(!!value)}
                              checked={row.getIsSelected()}
                              aria-label={t('components.assign_user_dialog.actions.select_row')}
                          />
                      ),
                      enableSorting: false,
                      enableHiding: false,
                      size: 40,
                  }),
              ]
            : []),
        columnHelper.accessor('name', {
            header: ({ column }) => (
                <DataTableColumnHeader
                    title={t('components.assign_user_dialog.columns.name')}
                    column={column}
                />
            ),
            cell: ({ row }) => <div className='font-medium'>{row.original.name}</div>,
        }),
        columnHelper.accessor('email', {
            header: ({ column }) => (
                <DataTableColumnHeader
                    title={t('components.assign_user_dialog.columns.email')}
                    column={column}
                />
            ),
            cell: ({ row }) => <div className='text-muted-foreground'>{row.original.email}</div>,
        }),
        columnHelper.accessor('username', {
            header: ({ column }) => (
                <DataTableColumnHeader
                    title={t('components.assign_user_dialog.columns.username')}
                    column={column}
                />
            ),
            cell: ({ row }) => (
                <div className='text-muted-foreground'>
                    {row.original.username ||
                        t('components.assign_user_dialog.empty_states.no_username')}
                </div>
            ),
        }),
        columnHelper.accessor('roles', {
            header: ({ column }) => (
                <DataTableColumnHeader
                    title={t('components.assign_user_dialog.columns.role')}
                    column={column}
                />
            ),
            cell: ({ row }) => {
                const roles = row.original.roles || [];
                return (
                    <div className='flex flex-wrap gap-1'>
                        {roles.length > 0 ? (
                            roles.map((role) => (
                                <Badge variant='secondary' key={role.id} className='text-xs'>
                                    {role.name}
                                </Badge>
                            ))
                        ) : (
                            <span className='text-xs text-muted-foreground'>
                                {t('components.assign_user_dialog.empty_states.no_roles')}
                            </span>
                        )}
                    </div>
                );
            },
            enableSorting: false,
        }),
        // Schools column - showing where user belongs
        columnHelper.display({
            id: 'schools',
            header: ({ column }) => (
                <DataTableColumnHeader
                    title={t('components.assign_user_dialog.columns.school')}
                    column={column}
                />
            ),
            cell: ({ row }) => {
                const schools = row.original.schools || [];
                return (
                    <div className='flex flex-wrap gap-1'>
                        {schools.length > 0 ? (
                            schools.map((school) => (
                                <Badge variant='outline' key={school.id} className='text-xs'>
                                    {school.name}
                                </Badge>
                            ))
                        ) : (
                            <span className='text-xs text-muted-foreground'>
                                {t('components.assign_user_dialog.empty_states.no_schools')}
                            </span>
                        )}
                    </div>
                );
            },
            enableSorting: false,
        }),
        // Classrooms column - showing where student belongs
        columnHelper.display({
            id: 'classrooms',
            header: ({ column }) => (
                <DataTableColumnHeader
                    title={t('components.assign_user_dialog.columns.classroom')}
                    column={column}
                />
            ),
            cell: ({ row }) => {
                const classrooms = row.original.classrooms || [];
                return (
                    <div className='flex flex-wrap gap-1'>
                        {classrooms.length > 0 ? (
                            classrooms.map((classroom) => (
                                <Badge variant='outline' key={classroom.id} className='text-xs'>
                                    {classroom.name}
                                </Badge>
                            ))
                        ) : (
                            <span className='text-xs text-muted-foreground'>
                                {t('components.assign_user_dialog.empty_states.no_classrooms')}
                            </span>
                        )}
                    </div>
                );
            },
            enableSorting: false,
        }),
    ] as Array<ColumnDef<UserResource, UserResource>>;

    const memoizedColumns = useMemo(() => columns, [t, multiSelect]);

    const selectedCount = selectedUsers.length;
    const isAssignDisabled = selectedCount === 0 || loading;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className='max-h-[90vh] max-w-5xl'>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <div className='flex-1 overflow-hidden'>
                    {isLoadingUsers ? (
                        <div className='flex h-64 items-center justify-center'>
                            <p className='text-muted-foreground'>{t('action.loading')}</p>
                        </div>
                    ) : (
                        <div className='h-[500px] overflow-auto'>
                            <DataTable
                                tableOptions={{
                                    enableRowSelection: multiSelect,
                                    getRowId: (row) => row.id.toString(),
                                    onRowSelectionChange: setRowSelection,
                                    state: {
                                        rowSelection,
                                    },
                                }}
                                showPagination={false}
                                data={availableUsers}
                                columns={memoizedColumns}
                            />
                        </div>
                    )}
                </div>

                {multiSelect && selectedCount > 0 && (
                    <div className='flex items-center justify-between rounded-lg border bg-muted/50 p-3'>
                        <span className='text-sm font-medium'>
                            {t('pages.common.bulk_actions.selected_count', {
                                count: selectedCount,
                            })}
                        </span>
                    </div>
                )}

                <DialogFooter>
                    <Button variant='outline' onClick={onClose}>
                        {t('action.cancel')}
                    </Button>
                    <Button
                        variant='default'
                        onClick={handleAssign}
                        loading={loading}
                        disabled={isAssignDisabled}
                    >
                        {buttonText}
                        {selectedCount > 0 && ` (${selectedCount})`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
