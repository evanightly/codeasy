import { Avatar, AvatarFallback } from '@/Components/UI/avatar';
import { Button } from '@/Components/UI/button';
import { ScrollArea } from '@/Components/UI/scroll-area';
import { Separator } from '@/Components/UI/separator';
import { RoleEnum } from '@/Support/Enums/roleEnum';
import { UserResource } from '@/Support/Interfaces/Resources';
import { usePage } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';

interface Props {
    users?: UserResource[];
    emptyMessage?: string;
    maxHeight?: string;
    canDelete?: boolean;
    onDelete?: (userId: number) => void;
}

export function UsersList({
    users,
    emptyMessage = 'No users found',
    maxHeight = '300px',
    canDelete = false,
    onDelete,
}: Props) {
    const { user } = usePage().props.auth;
    const showDeleteButton = canDelete && user.roles.includes(RoleEnum.SUPER_ADMIN);

    if (!users?.length) {
        return <p className='text-sm text-muted-foreground'>{emptyMessage}</p>;
    }

    return (
        <ScrollArea className={`h-[${maxHeight}]`}>
            <div className='space-y-4'>
                {users.map((user, index) => (
                    <div key={user.id}>
                        <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-4'>
                                <Avatar>
                                    <AvatarFallback>
                                        {user.name?.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className='space-y-1'>
                                    <p className='text-sm font-medium leading-none'>{user.name}</p>
                                    <p className='text-sm text-muted-foreground'>{user.email}</p>
                                </div>
                            </div>
                            {showDeleteButton && (
                                <Button
                                    variant='ghost'
                                    size='icon'
                                    onClick={() => onDelete?.(user.id)}
                                    className='text-destructive hover:text-destructive'
                                >
                                    <Trash2 className='h-4 w-4' />
                                </Button>
                            )}
                        </div>
                        {index < users.length - 1 && <Separator className='mt-4' />}
                    </div>
                ))}
            </div>
        </ScrollArea>
    );
}
