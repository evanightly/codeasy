import { buttonVariants } from '@/Components/UI/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/card';
import { useConfirmation } from '@/Contexts/ConfirmationDialogContext';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { schoolServiceHook } from '@/Services/schoolServiceHook';
import { ROUTES } from '@/Support/Constants/routes';
import { SchoolResource } from '@/Support/Interfaces/Resources';
import { Link, router } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { SchoolDetails } from './Partials/SchoolDetails';
import { UsersList } from './Partials/UsersList';

interface Props {
    data: { data: SchoolResource };
}

export default function Show({ data: { data: school } }: Props) {
    const { t } = useLaravelReactI18n();
    const confirmAction = useConfirmation();
    const unassignAdminMutation = schoolServiceHook.useUnassignAdmin();

    const handleUnassignAdmin = async (userId: number) => {
        confirmAction(async () => {
            toast.promise(
                unassignAdminMutation.mutateAsync({
                    id: school.id,
                    data: { user_id: userId },
                }),
                {
                    loading: t('pages.school.common.messages.pending.unassign_admin'),
                    success: () => {
                        router.reload();
                        return t('pages.school.common.messages.success.unassign_admin');
                    },
                    error: t('pages.school.common.messages.error.unassign_admin'),
                },
            );
        });
    };

    return (
        <AuthenticatedLayout title={t('pages.school.show.title', { name: school?.name ?? '' })}>
            <div className='space-y-6'>
                <Link
                    href={route(ROUTES.SCHOOLS + '.index')}
                    className={buttonVariants({ variant: 'outline' })}
                >
                    <ArrowLeft className='mr-2 h-4 w-4' />
                    {t('pages.school.show.buttons.back')}
                </Link>

                <div className='grid gap-6 md:grid-cols-2'>
                    <SchoolDetails school={school} />

                    <div className='space-y-6'>
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    {t('pages.school.common.sections.administrators')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <UsersList
                                    users={school.administrators}
                                    onDelete={handleUnassignAdmin}
                                    emptyMessage={t(
                                        'pages.school.common.empty_states.no_administrators',
                                    )}
                                    canDelete={true}
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>{t('pages.school.common.sections.teachers')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <UsersList
                                    users={school.teachers}
                                    emptyMessage={t('pages.school.common.empty_states.no_teachers')}
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>{t('pages.school.common.sections.students')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <UsersList
                                    users={school.students}
                                    emptyMessage={t('pages.school.common.empty_states.no_students')}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
