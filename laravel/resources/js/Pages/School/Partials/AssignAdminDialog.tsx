import { AssignUserDialog } from '@/Components/AssignUserDialog';
import { RoleEnum } from '@/Support/Enums/roleEnum';
import { useLaravelReactI18n } from 'laravel-react-i18n';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onAssign: (userIds: number[]) => void; // Changed to accept array for bulk assignment
    loading?: boolean;
}

export function AssignAdminDialog({ isOpen, onClose, onAssign, loading }: Props) {
    const { t } = useLaravelReactI18n();

    return (
        <AssignUserDialog
            title={t('pages.school.assign_admin.title')}
            onClose={onClose}
            onAssign={onAssign} // Directly pass the array handler
            multiSelect={true} // Changed to true for bulk assignment
            loading={loading}
            isOpen={isOpen}
            description={t('pages.school.assign_admin.description')}
            buttonText={t('pages.school.assign_admin.buttons.assign')}
            allowedRoles={[RoleEnum.TEACHER, RoleEnum.SCHOOL_ADMIN]}
        />
    );
}
