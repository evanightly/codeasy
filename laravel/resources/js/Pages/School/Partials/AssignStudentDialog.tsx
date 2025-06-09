import { Button } from '@/Components/UI/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/UI/dialog';
import {
    MultiSelect,
    MultiSelectContent,
    MultiSelectEmpty,
    MultiSelectItem,
    MultiSelectList,
    MultiSelectSearch,
    MultiSelectTrigger,
    MultiSelectValue,
} from '@/Components/UI/multi-select';
import { userServiceHook } from '@/Services/userServiceHook';
import { RoleEnum } from '@/Support/Enums/roleEnum';
import { SchoolResource, UserResource } from '@/Support/Interfaces/Resources';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useEffect, useState } from 'react';

interface Props {
    school: SchoolResource;
    isOpen: boolean;
    onClose: () => void;
    onAssign: (userIds: number[]) => void;
    loading?: boolean;
}

export function AssignStudentDialog({ school, isOpen, onClose, onAssign, loading }: Props) {
    const { t } = useLaravelReactI18n();
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [availableStudents, setAvailableStudents] = useState<UserResource[]>([]);
    const [isLoadingStudents, setIsLoadingStudents] = useState(false);

    const fetchStudents = async () => {
        try {
            setIsLoadingStudents(true);
            const response = await userServiceHook.getAll({
                filters: {
                    page_size: 'all',
                    relations_array_filters: {
                        roles: [RoleEnum.STUDENT],
                    },
                },
                // axiosRequestConfig: {
                //     params: {
                //         intent: IntentEnum.USER_INDEX_STUDENTS,
                //         school_id: school.id,
                //     },
                // },
            });
            setAvailableStudents(response.data || []);
        } catch (error) {
            console.error('Failed to fetch students:', error);
            setAvailableStudents([]);
        } finally {
            setIsLoadingStudents(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchStudents();
        } else {
            setSelectedUserIds([]);
        }
    }, [isOpen, school.id]);

    const handleAssign = () => {
        if (selectedUserIds.length > 0) {
            const userIds = selectedUserIds.map((id) => parseInt(id, 10));
            onAssign(userIds);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('pages.school.show.dialogs.assign_student.title')}</DialogTitle>
                    <DialogDescription>
                        {t('pages.school.show.dialogs.assign_student.description')}
                    </DialogDescription>
                </DialogHeader>

                <div className='space-y-2'>
                    <label className='text-sm font-medium'>
                        {t('pages.school.common.placeholders.student')}
                    </label>
                    <MultiSelect
                        value={selectedUserIds}
                        onValueChange={setSelectedUserIds}
                        disabled={isLoadingStudents}
                    >
                        <MultiSelectTrigger>
                            <MultiSelectValue
                                placeholder={
                                    isLoadingStudents
                                        ? t('action.loading')
                                        : t('pages.school.common.placeholders.select_students')
                                }
                            />
                        </MultiSelectTrigger>
                        <MultiSelectContent>
                            <MultiSelectSearch placeholder={t('action.search')} />
                            <MultiSelectList>
                                <MultiSelectEmpty>
                                    {isLoadingStudents
                                        ? t('action.loading')
                                        : t('action.no_data_available')}
                                </MultiSelectEmpty>
                                {availableStudents.map((student) => (
                                    <MultiSelectItem value={student.id.toString()} key={student.id}>
                                        {student.name}
                                    </MultiSelectItem>
                                ))}
                            </MultiSelectList>
                        </MultiSelectContent>
                    </MultiSelect>
                </div>

                <DialogFooter className='mt-4'>
                    <Button variant='outline' onClick={onClose}>
                        {t('action.cancel')}
                    </Button>
                    <Button
                        variant='default'
                        onClick={handleAssign}
                        loading={loading}
                        disabled={selectedUserIds.length === 0 || loading}
                    >
                        {t('pages.school.show.dialogs.assign_student.buttons.assign')}
                        {selectedUserIds.length > 0 && ` (${selectedUserIds.length})`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
