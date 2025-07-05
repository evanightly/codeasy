import { AssignUserDialog } from '@/Components/AssignUserDialog';
import { RoleEnum } from '@/Support/Enums/roleEnum';
import { SchoolResource } from '@/Support/Interfaces/Resources';
import { useLaravelReactI18n } from 'laravel-react-i18n';

interface Props {
    school: SchoolResource;
    isOpen: boolean;
    onClose: () => void;
    onAssign: (userIds: number[]) => void;
    loading?: boolean;
}

export function AssignStudentDialog({ school, isOpen, onClose, onAssign, loading }: Props) {
    const { t } = useLaravelReactI18n();

    return (
        <AssignUserDialog
            title={t('pages.school.show.dialogs.assign_student.title')}
            onClose={onClose}
            onAssign={onAssign}
            multiSelect={true}
            loading={loading}
            isOpen={isOpen}
            excludeSchoolIds={[school.id]} // Exclude students already assigned to this school
            description={t('pages.school.show.dialogs.assign_student.description')}
            buttonText={t('pages.school.show.dialogs.assign_student.buttons.assign')}
            allowedRoles={[RoleEnum.STUDENT]}
        />
    );
}
