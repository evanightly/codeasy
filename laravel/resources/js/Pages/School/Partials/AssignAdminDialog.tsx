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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/UI/select';
import { userServiceHook } from '@/Services/userServiceHook';
import { RoleEnum } from '@/Support/Enums/roleEnum';
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
    const [selectedUserId, setSelectedUserId] = useState<string>('');

    // Get potential admin users (excluding existing admins)
    const { data: users } = userServiceHook.useGetAll({
        filters: {
            column_filters: {
                roles: [RoleEnum.TEACHER, RoleEnum.SCHOOL_ADMIN],
            },
        },
    });

    useEffect(() => {
        if (!isOpen) {
            setSelectedUserId('');
        }
    }, [isOpen]);

    const handleAssign = () => {
        if (selectedUserId) {
            onAssign(parseInt(selectedUserId));
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

                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                    <SelectTrigger>
                        <SelectValue
                            placeholder={t('pages.school.common.placeholders.select_user')}
                        />
                    </SelectTrigger>
                    <SelectContent>
                        {users?.data?.map((user) => (
                            <SelectItem value={user.id.toString()} key={user.id}>
                                {user.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

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
