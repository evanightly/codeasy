import GenericDataSelector from '@/Components/GenericDataSelector';
import { Button } from '@/Components/UI/button';
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
import { UserResource } from '@/Support/Interfaces/Resources/UserResource';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useEffect, useState } from 'react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onAssign: (userId: number) => void;
    loading?: boolean;
}

export function AssignAdminDialog({ isOpen, onClose, onAssign, loading }: Props) {
    const { t } = useLaravelReactI18n();
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

    const fetchUsers = async (filters: ServiceFilterOptions) => {
        const response = await userServiceHook.getAll({
            filters: {
                ...filters,
                column_filters: {
                    roles: [RoleEnum.TEACHER, RoleEnum.SCHOOL_ADMIN].map((role) => role.toString()),
                },
            },
        });
        return response.data;
    };

    useEffect(() => {
        if (!isOpen) {
            setSelectedUserId(null);
        }
    }, [isOpen]);

    const handleAssign = () => {
        if (selectedUserId) {
            onAssign(selectedUserId);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('pages.school.assign_admin.title')}</DialogTitle>
                    <DialogDescription>
                        {t('pages.school.assign_admin.description')}
                    </DialogDescription>
                </DialogHeader>

                <GenericDataSelector<UserResource>
                    setSelectedData={setSelectedUserId}
                    selectedDataId={selectedUserId}
                    renderItem={(user) => {
                        const hasRole = user?.roles?.length;
                        const roles = hasRole
                            ? user?.roles?.map((role) => role.name).join(', ')
                            : '';
                        return user.name + (hasRole ? ` (${roles})` : '');
                    }}
                    placeholder={t('pages.school.common.placeholders.select_user')}
                    nullable
                    fetchData={fetchUsers}
                />

                <DialogFooter>
                    <Button variant='outline' onClick={onClose}>
                        {t('pages.school.assign_admin.buttons.cancel')}
                    </Button>
                    <Button
                        variant='default'
                        onClick={handleAssign}
                        loading={loading}
                        disabled={!selectedUserId || loading}
                    >
                        {t('pages.school.assign_admin.buttons.assign')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
