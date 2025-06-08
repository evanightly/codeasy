import { Button } from '@/Components/UI/button';
import { Checkbox } from '@/Components/UI/checkbox';
import { DataTable } from '@/Components/UI/data-table';
import { DataTableColumnHeader } from '@/Components/UI/data-table-column-header';
import { useConfirmation } from '@/Contexts/ConfirmationDialogContext';
import { classRoomServiceHook } from '@/Services/classRoomServiceHook';
import { ClassRoomResource, UserResource } from '@/Support/Interfaces/Resources';
import { router } from '@inertiajs/react';
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { Trash2, UserMinus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { AssignStudentDialog } from './AssignStudentDialog';

interface Props {
    classroom: ClassRoomResource;
}

export function StudentsList({ classroom }: Props) {
    const { t } = useLaravelReactI18n();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedStudents, setSelectedStudents] = useState<UserResource[]>([]);
    const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
    const confirmAction = useConfirmation();
    const columnHelper = createColumnHelper<UserResource>();

    const assignStudentClassRoomMutation = classRoomServiceHook.useAssignStudent();
    const bulkAssignStudentMutation = classRoomServiceHook.useBulkAssignStudents();
    const unnasignStudentMutation = classRoomServiceHook.useUnassignStudent();
    const bulkUnassignStudentsMutation = classRoomServiceHook.useBulkUnassignStudents();

    // Sync TanStack row selection with component state
    useEffect(() => {
        const selectedRows = Object.keys(rowSelection)
            .filter((key) => rowSelection[key])
            .map((id) => (classroom.students || []).find((student) => student.id.toString() === id))
            .filter(Boolean) as UserResource[];

        setSelectedStudents(selectedRows);
    }, [rowSelection, classroom.students]);

    const handleAssignStudents = (studentIds: number[]) => {
        if (studentIds.length === 1) {
            // Use single assignment for backward compatibility
            toast.promise(
                assignStudentClassRoomMutation.mutateAsync({
                    id: classroom.id,
                    data: { user_id: studentIds[0] },
                }),
                {
                    loading: t('pages.classroom.common.messages.pending.assign_student'),
                    success: () => {
                        router.reload();
                        return t('pages.classroom.common.messages.success.assign_student');
                    },
                    error: t('pages.classroom.common.messages.error.assign_student'),
                },
            );
        } else {
            // Use bulk assignment for multiple students
            toast.promise(
                bulkAssignStudentMutation.mutateAsync({
                    id: classroom.id,
                    data: { user_ids: studentIds },
                }),
                {
                    loading: t('pages.classroom.common.messages.pending.assign_students'),
                    success: () => {
                        router.reload();
                        return t('pages.classroom.common.messages.success.assign_students', {
                            count: studentIds.length,
                        });
                    },
                    error: t('pages.classroom.common.messages.error.assign_students'),
                },
            );
        }
        setDialogOpen(false);
    };

    const handleRemoveStudent = (studentId: number) => {
        confirmAction(() => {
            toast.promise(
                unnasignStudentMutation.mutateAsync({
                    id: classroom.id,
                    data: { user_id: studentId },
                }),
                {
                    loading: t('pages.classroom.common.messages.pending.remove_student'),
                    success: () => {
                        router.reload();
                        // classroom.students = classroom.students?.filter((s) => s.id !== studentId);
                        return t('pages.classroom.common.messages.success.remove_student');
                    },
                    error: t('pages.classroom.common.messages.error.remove_student'),
                },
            );
        });
    };

    const handleBulkRemoveStudents = () => {
        if (selectedStudents.length === 0) return;

        confirmAction(() => {
            const studentIds = selectedStudents.map((student) => student.id);
            toast.promise(
                bulkUnassignStudentsMutation.mutateAsync({
                    id: classroom.id,
                    data: { user_ids: studentIds },
                }),
                {
                    loading: t('pages.classroom.common.messages.pending.unassign_students'),
                    success: () => {
                        router.reload();
                        setSelectedStudents([]);
                        setRowSelection({});
                        return t('pages.classroom.common.messages.success.unassign_students', {
                            count: studentIds.length,
                        });
                    },
                    error: t('pages.classroom.common.messages.error.unassign_students'),
                },
            );
        });
    };

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
        columnHelper.accessor('name', {
            header: ({ column }) => (
                <DataTableColumnHeader
                    title={t('pages.classroom.show.student_columns.name')}
                    column={column}
                />
            ),
            cell: ({ row }) => <div className='font-medium'>{row.original.name}</div>,
        }),
        columnHelper.accessor('email', {
            header: ({ column }) => (
                <DataTableColumnHeader
                    title={t('pages.classroom.show.student_columns.email')}
                    column={column}
                />
            ),
            cell: ({ row }) => <div className='text-muted-foreground'>{row.original.email}</div>,
        }),
        columnHelper.display({
            id: 'actions',
            header: () => t('action.actions'),
            cell: ({ row }) => (
                <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => handleRemoveStudent(row.original.id)}
                    className='text-destructive hover:text-destructive'
                >
                    <Trash2 className='h-4 w-4' />
                </Button>
            ),
            enableSorting: false,
            size: 60,
        }),
    ] as Array<ColumnDef<UserResource, UserResource>>;

    const memoizedColumns = useMemo(() => columns, [t]);

    return (
        <div className='space-y-4'>
            <div className='flex justify-end'>
                <Button onClick={() => setDialogOpen(true)}>
                    {t('pages.classroom.show.buttons.assign_student')}
                </Button>
            </div>

            {selectedStudents.length > 0 && (
                <div className='flex items-center justify-between rounded-lg border p-3'>
                    <span className='text-sm font-medium'>
                        {t('pages.classroom.common.bulk_actions.selected_count', {
                            count: selectedStudents.length,
                        })}
                    </span>
                    <Button
                        variant='destructive'
                        size='sm'
                        onClick={handleBulkRemoveStudents}
                        className='gap-2'
                    >
                        <UserMinus className='h-4 w-4' />
                        {t('pages.classroom.common.bulk_actions.unassign_selected')}
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
                data={classroom.students || []}
                columns={memoizedColumns}
            />

            <AssignStudentDialog
                onClose={() => setDialogOpen(false)}
                onAssign={handleAssignStudents}
                loading={
                    assignStudentClassRoomMutation.isPending || bulkAssignStudentMutation.isPending
                }
                isOpen={dialogOpen}
                classroom={classroom}
            />
        </div>
    );
}
