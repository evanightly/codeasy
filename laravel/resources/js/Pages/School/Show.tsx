import { buttonVariants } from '@/Components/UI/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/card';
import { useConfirmation } from '@/Contexts/ConfirmationDialogContext';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { schoolServiceHook } from '@/Services/schoolServiceHook';
import { ROUTES } from '@/Support/Constants/routes';
import { SchoolResource } from '@/Support/Interfaces/Resources';
import { Link, router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { SchoolDetails } from './Partials/SchoolDetails';
import { UsersList } from './Partials/UsersList';

interface Props {
    data: { data: SchoolResource };
}

export default function Show({ data: { data: school } }: Props) {
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
                    loading: 'Removing administrator...',
                    success: () => {
                        router.reload();
                        return 'Administrator removed successfully';
                    },
                    error: 'Failed to remove administrator',
                },
            );
        });
    };

    return (
        <AuthenticatedLayout title={`School Details: ${school.name}`}>
            <div className='space-y-6'>
                <Link
                    href={route(ROUTES.SCHOOLS + '.index')}
                    className={buttonVariants({ variant: 'outline' })}
                >
                    <ArrowLeft className='mr-2 h-4 w-4' />
                    Back to Schools
                </Link>

                <div className='grid gap-6 md:grid-cols-2'>
                    <SchoolDetails school={school} />

                    <div className='space-y-6'>
                        <Card>
                            <CardHeader>
                                <CardTitle>Administrators</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <UsersList
                                    users={school.administrators}
                                    onDelete={handleUnassignAdmin}
                                    emptyMessage='No administrators assigned'
                                    canDelete={true}
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Teachers</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <UsersList
                                    users={school.teachers}
                                    emptyMessage='No teachers assigned'
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Students</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <UsersList
                                    users={school.students}
                                    emptyMessage='No students enrolled'
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
