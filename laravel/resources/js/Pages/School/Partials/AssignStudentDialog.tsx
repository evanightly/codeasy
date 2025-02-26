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
import { ServiceFilterOptions } from '@/Support/Interfaces/Others';
import { SchoolResource, UserResource } from '@/Support/Interfaces/Resources';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useEffect, useState } from 'react';

interface Props {
    school: SchoolResource;
    isOpen: boolean;
    onClose: () => void;
    onAssign: (userId: number) => void;
    loading?: boolean;
}

export function AssignStudentDialog({ school, isOpen, onClose, onAssign, loading }: Props) {
    const { t } = useLaravelReactI18n();
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

    const fetchUsers = async (filters: ServiceFilterOptions) => {
        const response = await userServiceHook.getAll({
            filters: {
                ...filters,
                column_filters: {
                    exclude_school_id: school.id,
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
                    <DialogTitle>{t('pages.school.assign_student.title')}</DialogTitle>
                    <DialogDescription>
                        {t('pages.school.assign_student.description')}
                    </DialogDescription>
                </DialogHeader>

                <GenericDataSelector<UserResource>
                    setSelectedData={(user) => setSelectedUserId(user)}
                    selectedDataId={selectedUserId}
                    renderItem={(user) => user?.name ?? ''}
                    placeholder={t('pages.school.common.placeholders.select_user')}
                    nullable
                    fetchData={fetchUsers}
                />

                <DialogFooter>
                    <Button variant='outline' onClick={onClose}>
                        {t('action.cancel')}
                    </Button>
                    <Button
                        variant='default'
                        onClick={handleAssign}
                        loading={loading}
                        disabled={!selectedUserId || loading}
                    >
                        {t('pages.school.assign_student.buttons.assign')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
