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
import { IntentEnum } from '@/Support/Enums/intentEnum';
import { ServiceFilterOptions } from '@/Support/Interfaces/Others';
import { ClassRoomResource, UserResource } from '@/Support/Interfaces/Resources';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useEffect, useState } from 'react';

interface Props {
    classroom: ClassRoomResource;
    isOpen: boolean;
    onClose: () => void;
    onAssign: (userId: number) => void;
    loading?: boolean;
}

export function AssignStudentDialog({ classroom, isOpen, onClose, onAssign, loading }: Props) {
    const { t } = useLaravelReactI18n();
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const fetchStudents = async (filters: ServiceFilterOptions) => {
        const response = await userServiceHook.getAll({
            filters: {
                ...filters,
            },
            axiosRequestConfig: {
                params: {
                    intent: IntentEnum.USER_INDEX_CLASS_ROOM_STUDENTS,
                    school_id: classroom.school_id,
                    classroom_id: classroom.id,
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
                    <DialogTitle>
                        {t('pages.classroom.show.dialogs.assign_student.title')}
                    </DialogTitle>
                    <DialogDescription>
                        {t('pages.classroom.show.dialogs.assign_student.description')}
                    </DialogDescription>
                </DialogHeader>

                <GenericDataSelector<UserResource>
                    setSelectedData={(user) => setSelectedUserId(user)}
                    selectedDataId={selectedUserId}
                    renderItem={(user) => user?.name ?? ''}
                    placeholder={t('pages.classroom.common.placeholders.student')}
                    nullable
                    fetchData={fetchStudents}
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
                        {t('pages.classroom.show.dialogs.assign_student.buttons.assign')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
