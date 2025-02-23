import { Avatar, AvatarFallback } from '@/Components/UI/avatar';
import { ScrollArea } from '@/Components/UI/scroll-area';
import { Separator } from '@/Components/UI/separator';
import { UserResource } from '@/Support/Interfaces/Resources';

interface Props {
    users?: UserResource[];
    emptyMessage?: string;
    maxHeight?: string;
}

export function UsersList({ users, emptyMessage = 'No users found', maxHeight = '300px' }: Props) {
    if (!users?.length) {
        return <p className='text-sm text-muted-foreground'>{emptyMessage}</p>;
    }

    return (
        <ScrollArea className={`h-[${maxHeight}]`}>
            <div className='space-y-4'>
                {users.map((user, index) => (
                    <div key={user.id}>
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
                        {index < users.length - 1 && <Separator className='mt-4' />}
                    </div>
                ))}
            </div>
        </ScrollArea>
    );
}
