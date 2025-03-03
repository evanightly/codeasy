import { Avatar, AvatarFallback, AvatarImage } from '@/Components/UI/avatar';
import { Badge } from '@/Components/UI/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/UI/tabs';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ROUTES } from '@/Support/Constants/routes';
import { RoleResource, UserResource } from '@/Support/Interfaces/Resources';
import { router } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { CalendarIcon, KeyRoundIcon, MailIcon, UserIcon } from 'lucide-react';

interface Props {
    data: {
        data: UserResource;
    };
}

export default function Show({ data: { data: user } }: Props) {
    const { t } = useLaravelReactI18n();

    if (!user) return null;

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((part) => part[0])
            .join('')
            .toUpperCase();
    };

    const handleRoleClick = (role: RoleResource) => {
        router.visit(route(`${ROUTES.ROLES}.show`, role.id));
    };

    return (
        <AuthenticatedLayout title={t('pages.user.show.title', { name: user?.name ?? '' })}>
            <Card>
                <CardHeader>
                    <CardTitle>{user.name}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue='details'>
                        <TabsList>
                            <TabsTrigger value='details'>
                                {t('pages.user.show.sections.information')}
                            </TabsTrigger>
                            <TabsTrigger value='roles'>
                                {t('pages.user.show.sections.roles')}
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value='details'>
                            <div className='space-y-6'>
                                <div className='flex flex-col items-center gap-4 sm:flex-row'>
                                    <Avatar className='h-24 w-24'>
                                        {user.image_url ? (
                                            <AvatarImage src={user.image_url} alt={user.name} />
                                        ) : (
                                            <AvatarFallback>
                                                {getInitials(user?.name ?? '')}
                                            </AvatarFallback>
                                        )}
                                    </Avatar>
                                    <div className='space-y-1 text-center sm:text-left'>
                                        <h2 className='text-2xl font-semibold'>{user.name}</h2>
                                        <p className='text-sm text-muted-foreground'>
                                            {user.username || t('pages.user.show.no_username')}
                                        </p>
                                    </div>
                                </div>

                                <div className='space-y-4'>
                                    <h3 className='text-lg font-medium'>
                                        {t('pages.user.show.sections.contact_information')}
                                    </h3>
                                    <div className='grid gap-4'>
                                        <div className='flex items-center gap-2'>
                                            <MailIcon className='h-5 w-5 text-muted-foreground' />
                                            <span className='font-medium'>
                                                {t('pages.user.common.fields.email')}:
                                            </span>
                                            <span>{user.email}</span>
                                        </div>

                                        <div className='flex items-center gap-2'>
                                            <UserIcon className='h-5 w-5 text-muted-foreground' />
                                            <span className='font-medium'>
                                                {t('pages.user.common.fields.username')}:
                                            </span>
                                            <span>
                                                {user.username || t('pages.user.show.no_username')}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {(user.created_at || user.updated_at) && (
                                    <div className='space-y-4 border-t pt-4'>
                                        <h3 className='text-lg font-medium'>
                                            {t('pages.user.show.sections.timestamps')}
                                        </h3>
                                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                                            {user.created_at && (
                                                <div className='flex items-center gap-2'>
                                                    <CalendarIcon className='h-5 w-5 text-muted-foreground' />
                                                    <span className='font-medium'>
                                                        {t('pages.common.columns.created_at')}:
                                                    </span>
                                                    <span>
                                                        {new Date(user.created_at).toLocaleString()}
                                                    </span>
                                                </div>
                                            )}
                                            {user.updated_at && (
                                                <div className='flex items-center gap-2'>
                                                    <CalendarIcon className='h-5 w-5 text-muted-foreground' />
                                                    <span className='font-medium'>
                                                        {t('pages.common.columns.updated_at')}:
                                                    </span>
                                                    <span>
                                                        {new Date(user.updated_at).toLocaleString()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value='roles'>
                            <div className='space-y-6'>
                                <h3 className='text-lg font-medium'>
                                    {t('pages.user.show.sections.roles')}
                                </h3>

                                {user.roles && user.roles.length > 0 ? (
                                    <div className='flex flex-wrap gap-2'>
                                        {user.roles.map((role, index) => (
                                            <Badge
                                                variant='outline'
                                                onClick={handleRoleClick.bind(null, role)}
                                                key={index}
                                                className='cursor-pointer text-sm hover:bg-primary hover:text-primary-foreground'
                                            >
                                                <>
                                                    <KeyRoundIcon className='mr-1 h-3 w-3' />
                                                    {role.name}
                                                </>
                                            </Badge>
                                        ))}
                                    </div>
                                ) : (
                                    <p className='text-muted-foreground'>
                                        {t('pages.user.show.no_roles')}
                                    </p>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </AuthenticatedLayout>
    );
}
