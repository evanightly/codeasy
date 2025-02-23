import { buttonVariants } from '@/Components/UI/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/card';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ROUTES } from '@/Support/Constants/routes';
import { SchoolResource } from '@/Support/Interfaces/Resources';
import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { UsersList } from './Partials/UsersList';
import { SchoolDetails } from './Partials/SchoolDetails';

interface Props {
    data: { data: SchoolResource };
}

export default function Show({ data: { data: school } }: Props) {
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
                                    emptyMessage='No administrators assigned'
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
