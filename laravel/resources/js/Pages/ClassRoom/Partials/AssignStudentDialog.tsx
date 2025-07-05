import { AssignUserDialog } from '@/Components/AssignUserDialog';
import { RoleEnum } from '@/Support/Enums/roleEnum';
import { ClassRoomResource } from '@/Support/Interfaces/Resources';
import { useLaravelReactI18n } from 'laravel-react-i18n';

interface Props {
    classroom: ClassRoomResource;
    isOpen: boolean;
    onClose: () => void;
    onAssign: (userIds: number[]) => void;
    loading?: boolean;
}

export function AssignStudentDialog({ classroom, isOpen, onClose, onAssign, loading }: Props) {
    const { t } = useLaravelReactI18n();

    return (
        <AssignUserDialog
            title={t('pages.classroom.show.dialogs.assign_student.title')}
            requiredSchoolId={classroom.school_id || undefined} // Only show students from the same school
            onClose={onClose}
            onAssign={onAssign}
            multiSelect={true}
            loading={loading}
            isOpen={isOpen}
            excludeClassroomIds={[classroom.id]} // Exclude students already assigned to this classroom
            description={t('pages.classroom.show.dialogs.assign_student.description')}
            buttonText={t('pages.classroom.show.dialogs.assign_student.buttons.assign')}
            allowedRoles={[RoleEnum.STUDENT]}
        />
    );
}
