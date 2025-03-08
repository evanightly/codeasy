import { Card } from '@/Components/UI/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/UI/tabs';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { UserResource } from '@/Support/Interfaces/Resources';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({
    mustVerifyEmail,
    status,
    user,
}: PageProps<{ mustVerifyEmail: boolean; status?: string; user: UserResource }>) {
    const { t } = useLaravelReactI18n();

    return (
        <AuthenticatedLayout title={t('pages.profile.edit.title')}>
            <Head title={t('pages.profile.edit.title')} />

            <div className='py-12'>
                <div className='mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8'>
                    <Card>
                        <Tabs defaultValue='profile' className='w-full'>
                            <TabsList className='grid w-full grid-cols-3'>
                                <TabsTrigger value='profile'>
                                    {t('pages.profile.edit.tabs.profile')}
                                </TabsTrigger>
                                <TabsTrigger value='password'>
                                    {t('pages.profile.edit.tabs.password')}
                                </TabsTrigger>
                                <TabsTrigger value='danger'>
                                    {t('pages.profile.edit.tabs.danger')}
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value='profile' className='p-4'>
                                <UpdateProfileInformationForm
                                    user={user}
                                    status={status}
                                    mustVerifyEmail={mustVerifyEmail}
                                />
                            </TabsContent>

                            <TabsContent value='password' className='p-4'>
                                <UpdatePasswordForm />
                            </TabsContent>

                            <TabsContent value='danger' className='p-4'>
                                <DeleteUserForm />
                            </TabsContent>
                        </Tabs>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
