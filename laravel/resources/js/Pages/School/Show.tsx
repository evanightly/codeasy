import { buttonVariants } from '@/Components/UI/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/card';
import { useConfirmation } from '@/Contexts/ConfirmationDialogContext';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { schoolServiceHook } from '@/Services/schoolServiceHook';
import { ROUTES } from '@/Support/Constants/routes';
import { RoleEnum } from '@/Support/Enums/roleEnum';
import { SchoolResource } from '@/Support/Interfaces/Resources';
import { Link, router, usePage } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { SchoolDetails } from './Partials/SchoolDetails';
import { UsersList } from './Partials/UsersList';

interface Props {
    data: SchoolResource;
}

export default function Show({ data: school }: Props) {
    const { t } = useLaravelReactI18n();
    const { auth } = usePage().props;
    const confirmAction = useConfirmation();
    const unassignAdminMutation = schoolServiceHook.useUnassignAdmin();
    const unassignStudentMutation = schoolServiceHook.useUnassignStudent();
    const bulkUnassignStudentsMutation = schoolServiceHook.useBulkUnassignStudents();

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

    const handleUnassignStudent = async (userId: number) => {
        confirmAction(async () => {
            toast.promise(
                unassignStudentMutation.mutateAsync({
                    id: school.id,
                    data: { user_id: userId },
                }),
                {
                    loading: t('pages.school.common.messages.pending.unassign_student'),
                    success: () => {
                        router.reload();
                        return t('pages.school.common.messages.success.unassign_student');
                    },
                    error: t('pages.school.common.messages.error.unassign_student'),
                },
            );
        });
    };

    const handleBulkUnassignStudents = async (userIds: number[]) => {
        confirmAction(async () => {
            toast.promise(
                bulkUnassignStudentsMutation.mutateAsync({
                    id: school.id,
                    data: { user_ids: userIds },
                }),
                {
                    loading: t('pages.school.common.messages.pending.unassign_students'),
                    success: t('pages.school.common.messages.success.unassign_students', {
                        count: userIds.length,
                    }),
                    error: t('pages.school.common.messages.error.unassign_students'),
                    finally: () => {
                        location.reload(); // cant use router.reload due to early return in promise
                        // router.reload();
                    },
                },
            );
        });
    };

    const isSuperAdmin = auth.user.roles.includes(RoleEnum.SUPER_ADMIN) ?? false;
    const isSchoolAdmin = auth.user.roles.includes(RoleEnum.SCHOOL_ADMIN) ?? false;

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

                <div className='flex flex-col gap-6'>
                    <SchoolDetails school={school} />

                    <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
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
                                    canDelete={isSuperAdmin}
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
                                    useDataTable={true}
                                    onDelete={handleUnassignStudent}
                                    onBulkDelete={handleBulkUnassignStudents}
                                    emptyMessage={t('pages.school.common.empty_states.no_students')}
                                    canDelete={isSchoolAdmin}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
