import { Button } from '@/Components/UI/button';
import { DataTable } from '@/Components/UI/data-table';
import { useConfirmation } from '@/Contexts/ConfirmationDialogContext';
import { classRoomServiceHook } from '@/Services/classRoomServiceHook';
import { ClassRoomResource } from '@/Support/Interfaces/Resources';
import { router } from '@inertiajs/react';
import { createColumnHelper } from '@tanstack/react-table';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useState } from 'react';
import { toast } from 'sonner';
import { AssignStudentDialog } from './AssignStudentDialog';

interface Props {
    classroom: ClassRoomResource;
}

export function StudentsList({ classroom }: Props) {
    const { t } = useLaravelReactI18n();
    const [dialogOpen, setDialogOpen] = useState(false);
    const confirmAction = useConfirmation();
    const columnHelper = createColumnHelper<any>();

    const assignStudentClassRoomMutation = classRoomServiceHook.useAssignStudent();
    const unnasignStudentMutation = classRoomServiceHook.useUnassignStudent();

    const handleAssignStudent = (studentId: number) => {
        toast.promise(
            assignStudentClassRoomMutation.mutateAsync({
                id: classroom.id,
                data: { user_id: studentId },
            }),
            {
                loading: t('pages.classroom.common.messages.pending.assign_student'),
                success: () => {
                    router.reload();
                    // classroom.students = [...(classroom.students || []), { id: studentId }];
                    return t('pages.classroom.common.messages.success.assign_student');
                },
                error: t('pages.classroom.common.messages.error.assign_student'),
            },
        );
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

    const columns = [
        columnHelper.accessor('name', {
            header: t('pages.classroom.show.student_columns.name'),
        }),
        columnHelper.accessor('email', {
            header: t('pages.classroom.show.student_columns.email'),
        }),
        columnHelper.display({
            id: 'actions',
            cell: ({ row }) => (
                <Button
                    variant='destructive'
                    size='sm'
                    onClick={() => handleRemoveStudent(row.original.id)}
                >
                    {t('action.delete')}
                </Button>
            ),
        }),
    ];

    return (
        <div className='space-y-4'>
            <div className='flex justify-end'>
                <Button onClick={() => setDialogOpen(true)}>
                    {t('pages.classroom.show.buttons.assign_student')}
                </Button>
            </div>

            <DataTable data={classroom.students || []} columns={columns} />

            <AssignStudentDialog
                onClose={() => setDialogOpen(false)}
                onAssign={handleAssignStudent}
                isOpen={dialogOpen}
                classroom={classroom}
            />
        </div>
    );
}
