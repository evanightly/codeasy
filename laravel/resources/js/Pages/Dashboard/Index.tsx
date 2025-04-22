'use client';

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { RoleEnum } from '@/Support/Enums/roleEnum';
import { Head, usePage } from '@inertiajs/react';
import { AdminCharts, SchoolAdminCharts, StudentCharts, TeacherCharts } from './Components/Charts';
import StudentTaskTrackingSection from './Components/StudentTracking/StudentTaskTrackingSection';

export default function Dashboard() {
    const { roles } = usePage().props.auth.user;

    return (
        <AuthenticatedLayout>
            <Head title='Dashboard' />
            <div className='flex w-full flex-col gap-8 p-4'>
                {/* SUPER ADMIN */}
                {roles.includes(RoleEnum.SUPER_ADMIN) && <AdminCharts />}

                {/* SCHOOL ADMIN DASHBOARD */}
                {roles.includes(RoleEnum.SCHOOL_ADMIN) && <SchoolAdminCharts />}

                {/* TEACHER */}
                {roles.includes(RoleEnum.TEACHER) && (
                    <>
                        <TeacherCharts />
                        {/* Student Task Tracking System */}
                        <StudentTaskTrackingSection />
                    </>
                )}

                {/* STUDENT */}
                {roles.includes(RoleEnum.STUDENT) && <StudentCharts />}
            </div>
        </AuthenticatedLayout>
    );
}
