import { Avatar, AvatarFallback, AvatarImage } from '@/Components/UI/avatar';
import { Badge } from '@/Components/UI/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/UI/card';
import { Separator } from '@/Components/UI/separator';
import { Skeleton } from '@/Components/UI/skeleton';
import { dashboardServiceHook } from '@/Services/dashboardServiceHook';
import { RoleEnum } from '@/Support/Enums/roleEnum';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { Clock, Users } from 'lucide-react';

interface ActiveUsersCardProps {
    className?: string;
    minutesThreshold?: number;
}

export function ActiveUsersCard({ className = '', minutesThreshold = 15 }: ActiveUsersCardProps) {
    const { t } = useLaravelReactI18n();
    const { data: activeUsersData, isLoading } =
        dashboardServiceHook.useGetActiveUsers(minutesThreshold);

    const getRoleBadgeVariant = (role: string) => {
        switch (role) {
            case RoleEnum.SUPER_ADMIN:
                return 'destructive';
            case RoleEnum.SCHOOL_ADMIN:
                return 'default';
            case RoleEnum.TEACHER:
                return 'secondary';
            case RoleEnum.STUDENT:
                return 'outline';
            default:
                return 'outline';
        }
    };

    const getRoleDisplayName = (role: string) => {
        switch (role) {
            case RoleEnum.SUPER_ADMIN:
                return t('components.roles.super_admin');
            case RoleEnum.SCHOOL_ADMIN:
                return t('components.roles.school_admin');
            case RoleEnum.TEACHER:
                return t('components.roles.teacher');
            case RoleEnum.STUDENT:
                return t('components.roles.student');
            default:
                // Fallback for any unmapped roles
                return role;
        }
    };

    if (isLoading) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                        <Users className='h-5 w-5' />
                        <Skeleton className='h-5 w-32' />
                    </CardTitle>
                    <CardDescription></CardDescription>
                    <Skeleton className='h-4 w-48' />
                </CardHeader>
                <CardContent>
                    <div className='space-y-4'>
                        {Array.from({ length: 3 }).map((_, index) => (
                            <div key={index} className='flex items-center space-x-4'>
                                <Skeleton className='h-8 w-8 rounded-full' />
                                <div className='space-y-2'>
                                    <Skeleton className='h-4 w-24' />
                                    <Skeleton className='h-3 w-32' />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!activeUsersData) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                        <Users className='h-5 w-5' />
                        {t('pages.dashboard.active_users.title')}
                    </CardTitle>
                    <CardDescription>
                        {t('pages.dashboard.active_users.error_loading')}
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                    <Users className='h-5 w-5' />
                    {t('pages.dashboard.active_users.title')}
                </CardTitle>
                <CardDescription className='flex items-center gap-2'>
                    <Clock className='h-4 w-4' />
                    {t('pages.dashboard.active_users.description')}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {activeUsersData.total_active === 0 ? (
                    <div className='py-8 text-center'>
                        <Users className='mx-auto h-16 w-16 text-muted-foreground' />
                        <h3 className='mt-4 text-lg font-medium text-muted-foreground'>
                            {t('pages.dashboard.active_users.no_active_users')}
                        </h3>
                    </div>
                ) : (
                    <div className='space-y-4'>
                        {/* Summary */}
                        <div className='flex items-center justify-between'>
                            <span className='text-2xl font-bold'>
                                {activeUsersData.total_active}
                            </span>
                            <Badge variant='outline' className='text-xs'>
                                {t('pages.dashboard.active_users.total_active')}
                            </Badge>
                        </div>

                        <Separator />

                        {/* Users by Role */}
                        <div className='space-y-4'>
                            {Object.entries(activeUsersData.users_by_role).map(([role, users]) => (
                                <div key={role} className='space-y-2'>
                                    <div className='flex items-center justify-between'>
                                        <Badge
                                            variant={getRoleBadgeVariant(role)}
                                            className='text-xs'
                                        >
                                            {getRoleDisplayName(role)}
                                        </Badge>
                                        <span className='text-sm text-muted-foreground'>
                                            {users.length}
                                            {t('pages.dashboard.active_users.users_count')}
                                        </span>
                                    </div>

                                    <div className='grid gap-2'>
                                        {users.slice(0, 5).map((user) => (
                                            <div
                                                key={user.id}
                                                className='flex items-center space-x-3'
                                            >
                                                <Avatar className='h-6 w-6'>
                                                    <AvatarImage
                                                        src={user.profile_image_url || ''}
                                                        alt={user.name}
                                                    />
                                                    <AvatarFallback className='text-xs'>
                                                        {user.name?.charAt(0).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className='min-w-0 flex-1'>
                                                    <p className='truncate text-sm font-medium text-foreground'>
                                                        {user.name}
                                                    </p>
                                                    <p className='truncate text-xs text-muted-foreground'>
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                        {users.length > 5 && (
                                            <p className='text-center text-xs text-muted-foreground'>
                                                {t('pages.dashboard.active_users.and_more', {
                                                    count: users.length - 5,
                                                })}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Last Updated */}
                        <div className='text-center'>
                            <p className='text-xs text-muted-foreground'>
                                {t('pages.dashboard.active_users.last_updated')}:{' '}
                                {new Date(activeUsersData.last_updated).toLocaleTimeString()}
                            </p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
