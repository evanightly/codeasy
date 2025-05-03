import { Badge } from '@/Components/UI/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/UI/tabs';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { RoleResource } from '@/Support/Interfaces/Resources';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { CalendarIcon, KeyRoundIcon, LockIcon, UserIcon } from 'lucide-react';

interface Props {
    data: RoleResource;
}

export default function Show({ data: role }: Props) {
    const { t } = useLaravelReactI18n();

    if (!role) return null;

    return (
        <AuthenticatedLayout title={t('pages.role.show.title', { name: role?.name ?? '' })}>
            <Card>
                <CardHeader>
                    <CardTitle>{role.name}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue='details'>
                        <TabsList>
                            <TabsTrigger value='details'>
                                {t('pages.role.show.sections.information')}
                            </TabsTrigger>
                            <TabsTrigger value='permissions'>
                                {t('pages.role.show.sections.permissions')}
                            </TabsTrigger>
                            {role.users && (
                                <TabsTrigger value='users'>
                                    {t('pages.role.show.sections.users')}
                                </TabsTrigger>
                            )}
                        </TabsList>

                        <TabsContent value='details'>
                            <div className='space-y-6'>
                                <div className='space-y-4'>
                                    <div className='grid gap-4'>
                                        <div className='flex items-center gap-2'>
                                            <KeyRoundIcon className='h-5 w-5 text-muted-foreground' />
                                            <span className='font-medium'>
                                                {t('pages.role.common.fields.name')}:
                                            </span>
                                            <span>{role.name}</span>
                                        </div>

                                        <div className='flex items-center gap-2'>
                                            <LockIcon className='h-5 w-5 text-muted-foreground' />
                                            <span className='font-medium'>
                                                {t('pages.role.common.fields.guard_name')}:
                                            </span>
                                            <span>{role.guard_name}</span>
                                        </div>
                                    </div>
                                </div>

                                {(role.created_at || role.updated_at) && (
                                    <div className='space-y-4 border-t pt-4'>
                                        <h3 className='text-lg font-medium'>
                                            {t('pages.role.show.sections.timestamps')}
                                        </h3>
                                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                                            {role.created_at && (
                                                <div className='flex items-center gap-2'>
                                                    <CalendarIcon className='h-5 w-5 text-muted-foreground' />
                                                    <span className='font-medium'>
                                                        {t('pages.common.columns.created_at')}:
                                                    </span>
                                                    <span>
                                                        {new Date(role.created_at).toLocaleString()}
                                                    </span>
                                                </div>
                                            )}
                                            {role.updated_at && (
                                                <div className='flex items-center gap-2'>
                                                    <CalendarIcon className='h-5 w-5 text-muted-foreground' />
                                                    <span className='font-medium'>
                                                        {t('pages.common.columns.updated_at')}:
                                                    </span>
                                                    <span>
                                                        {new Date(role.updated_at).toLocaleString()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value='permissions'>
                            <div className='space-y-6'>
                                <h3 className='text-lg font-medium'>
                                    {t('pages.role.show.sections.permissions')}
                                </h3>

                                {role.permissions && role.permissions.length > 0 ? (
                                    <div className='flex flex-wrap gap-2'>
                                        {role.permissions.map((permission, index) => (
                                            <Badge
                                                variant='outline'
                                                key={index}
                                                className='text-sm'
                                            >
                                                <>
                                                    <LockIcon className='mr-1 h-3 w-3' />
                                                    {typeof permission === 'number'
                                                        ? permission
                                                        : permission.name}
                                                </>
                                            </Badge>
                                        ))}
                                    </div>
                                ) : (
                                    <p className='text-muted-foreground'>
                                        {t('pages.role.show.no_permissions')}
                                    </p>
                                )}
                            </div>
                        </TabsContent>

                        {role.users && (
                            <TabsContent value='users'>
                                <div className='space-y-6'>
                                    <h3 className='text-lg font-medium'>
                                        {t('pages.role.show.sections.users')}
                                    </h3>

                                    {role.users && role.users.length > 0 ? (
                                        <div className='flex flex-wrap gap-2'>
                                            {role.users.map((user, index) => (
                                                <Badge
                                                    variant='outline'
                                                    key={index}
                                                    className='text-sm'
                                                >
                                                    <>
                                                        <UserIcon className='mr-1 h-3 w-3' />
                                                        {user.name}
                                                    </>
                                                </Badge>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className='text-muted-foreground'>
                                            {t('pages.role.show.no_users')}
                                        </p>
                                    )}
                                </div>
                            </TabsContent>
                        )}
                    </Tabs>
                </CardContent>
            </Card>
        </AuthenticatedLayout>
    );
}
