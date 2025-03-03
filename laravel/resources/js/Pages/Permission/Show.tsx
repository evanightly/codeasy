import { Badge } from '@/Components/UI/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/UI/tabs';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PermissionResource } from '@/Support/Interfaces/Resources';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { CalendarIcon, LockIcon, ShieldCheckIcon, TagIcon } from 'lucide-react';

interface Props {
    data: {
        data: PermissionResource;
    };
}

export default function Show({ data: { data: permission } }: Props) {
    const { t } = useLaravelReactI18n();
    console.log(permission);

    if (!permission) return null;

    // Parse the permission name to extract resource and action
    const parsePermissionName = (name: string) => {
        const parts = name.split('-');
        if (parts.length < 2) return { resource: name, action: '' };

        const action = parts.pop();
        const resource = parts.join('-');

        return { resource, action };
    };

    const { resource, action } = parsePermissionName(permission?.name ?? '');

    return (
        <AuthenticatedLayout
            title={t('pages.permission.show.title', { name: permission?.name ?? '' })}
        >
            <Card>
                <CardHeader>
                    <CardTitle>{permission.name}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue='details'>
                        <TabsList>
                            <TabsTrigger value='details'>
                                {t('pages.permission.show.sections.information')}
                            </TabsTrigger>
                            {permission.roles && (
                                <TabsTrigger value='roles'>
                                    {t('pages.permission.show.sections.roles')}
                                </TabsTrigger>
                            )}
                        </TabsList>

                        <TabsContent value='details'>
                            <div className='space-y-6'>
                                <div className='space-y-4'>
                                    <div className='grid gap-4'>
                                        <div className='flex items-center gap-2'>
                                            <LockIcon className='h-5 w-5 text-muted-foreground' />
                                            <span className='font-medium'>
                                                {t('pages.permission.common.fields.name')}:
                                            </span>
                                            <span>{permission.name}</span>
                                        </div>

                                        {permission.guard_name && (
                                            <div className='flex items-center gap-2'>
                                                <ShieldCheckIcon className='h-5 w-5 text-muted-foreground' />
                                                <span className='font-medium'>
                                                    {t('pages.permission.show.fields.guard_name')}:
                                                </span>
                                                <span>{permission.guard_name}</span>
                                            </div>
                                        )}

                                        <div className='flex items-center gap-2'>
                                            <TagIcon className='h-5 w-5 text-muted-foreground' />
                                            <span className='font-medium'>
                                                {t('pages.permission.common.fields.group')}:
                                            </span>
                                            <Badge variant='outline'>{resource}</Badge>
                                        </div>

                                        <div className='flex items-center gap-2'>
                                            <ShieldCheckIcon className='h-5 w-5 text-muted-foreground' />
                                            <span className='font-medium'>
                                                {t('pages.permission.show.fields.action')}:
                                            </span>
                                            <Badge variant='secondary'>{action}</Badge>
                                        </div>
                                    </div>
                                </div>

                                {(permission.created_at || permission.updated_at) && (
                                    <div className='space-y-4 border-t pt-4'>
                                        <h3 className='text-lg font-medium'>
                                            {t('pages.permission.show.sections.timestamps')}
                                        </h3>
                                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                                            {permission.created_at && (
                                                <div className='flex items-center gap-2'>
                                                    <CalendarIcon className='h-5 w-5 text-muted-foreground' />
                                                    <span className='font-medium'>
                                                        {t('pages.common.columns.created_at')}:
                                                    </span>
                                                    <span>
                                                        {new Date(
                                                            permission.created_at,
                                                        ).toLocaleString()}
                                                    </span>
                                                </div>
                                            )}
                                            {permission.updated_at && (
                                                <div className='flex items-center gap-2'>
                                                    <CalendarIcon className='h-5 w-5 text-muted-foreground' />
                                                    <span className='font-medium'>
                                                        {t('pages.common.columns.updated_at')}:
                                                    </span>
                                                    <span>
                                                        {new Date(
                                                            permission.updated_at,
                                                        ).toLocaleString()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        {permission.roles && (
                            <TabsContent value='roles'>
                                <div className='space-y-6'>
                                    <h3 className='text-lg font-medium'>
                                        {t('pages.permission.show.sections.roles')}
                                    </h3>

                                    {permission.roles && permission.roles.length > 0 ? (
                                        <div className='flex flex-wrap gap-2'>
                                            {permission.roles.map((role, index) => (
                                                <Badge
                                                    variant='outline'
                                                    key={index}
                                                    className='text-sm'
                                                >
                                                    <ShieldCheckIcon className='mr-1 h-3 w-3' />
                                                    {typeof role === 'string' ? role : role.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className='text-muted-foreground'>
                                            {t('pages.permission.show.no_roles')}
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
