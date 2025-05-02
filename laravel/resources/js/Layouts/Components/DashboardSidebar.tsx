'use client';

import {
    AudioWaveform,
    Book,
    Brain,
    FileCheck,
    GalleryVerticalEnd,
    Lock,
    PieChart,
    Presentation,
    School,
    ShieldCheck,
    TestTube,
    Users,
} from 'lucide-react';
import * as React from 'react';

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from '@/Components/UI/sidebar';
import { ROUTES } from '@/Support/Constants/routes';
import { PermissionEnum } from '@/Support/Enums/permissionEnum';
import { MenuItem } from '@/Support/Interfaces/Others';
import { usePage } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { DashboardSidebarHeader } from './Components/DashboardSidebarHeader';
import { DashboardSidebarUser } from './Components/DashboardSidebarUser';
import { DashboardSiteSwitcher } from './Components/DashboardSiteSwitcher';

interface AppSidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

const DashboardSidebar = ({ ...props }: AppSidebarProps) => {
    const { t, currentLocale } = useLaravelReactI18n();
    const { url } = usePage();

    const data = {
        teams: [
            {
                name: 'Codeasy',
                logo: GalleryVerticalEnd,
                description: 'The best platform to learn programming',
                url: '#',
            },
            {
                name: 'Codeasy (Legacy)',
                logo: GalleryVerticalEnd,
                description: 'The best platform to learn programming',
                url: 'http://localhost:3000',
            },
            {
                name: 'SKKNI',
                logo: AudioWaveform,
                description: 'Sistem Kompetensi Keahlian Nasional Indonesia',
                url: 'http://localhost:3000',
            },
        ],
    };

    const menuItems: MenuItem[] = React.useMemo(
        () => [
            {
                type: 'group',
                title: t('components.dashboard_sidebar.dashboard'),
                items: [
                    {
                        type: 'menu',
                        title: 'Dashboard',
                        url: route(`${ROUTES.DASHBOARD}.index`),
                        icon: PieChart,
                    },
                ],
            },
            {
                type: 'group',
                title: t('components.dashboard_sidebar.admin.title'),
                items: [
                    {
                        type: 'menu',
                        title: t('components.dashboard_sidebar.admin.permissions'),
                        url: route(`${ROUTES.PERMISSIONS}.index`),
                        icon: ShieldCheck,
                        permissions: [PermissionEnum.PERMISSION_READ],
                    },
                    {
                        type: 'menu',
                        title: t('components.dashboard_sidebar.admin.roles'),
                        url: route(`${ROUTES.ROLES}.index`),
                        icon: Lock,
                        permissions: [PermissionEnum.ROLE_READ],
                    },
                    {
                        type: 'menu',
                        title: t('components.dashboard_sidebar.admin.users'),
                        url: route(`${ROUTES.USERS}.index`),
                        icon: Users,
                        permissions: [PermissionEnum.USER_READ],
                    },
                ],
            },
            {
                type: 'group',
                title: t('components.dashboard_sidebar.academic.title'),
                items: [
                    {
                        type: 'menu',
                        title: t('components.dashboard_sidebar.academic.schools'),
                        url: route(`${ROUTES.SCHOOLS}.index`),
                        icon: School,
                        permissions: [PermissionEnum.SCHOOL_READ],
                    },
                    {
                        type: 'menu',
                        title: t('components.dashboard_sidebar.academic.school_requests'),
                        url: route(`${ROUTES.SCHOOL_REQUESTS}.index`),
                        icon: FileCheck,
                        permissions: [PermissionEnum.SCHOOL_REQUEST_READ],
                    },
                    {
                        type: 'menu',
                        title: t('components.dashboard_sidebar.academic.class_rooms'),
                        url: route(`${ROUTES.CLASS_ROOMS}.index`),
                        icon: Presentation,
                        permissions: [PermissionEnum.CLASS_ROOM_READ],
                    },
                    {
                        type: 'menu',
                        title: t('components.dashboard_sidebar.academic.courses'),
                        url: route(`${ROUTES.COURSES}.index`),
                        icon: Book,
                        permissions: [PermissionEnum.COURSE_READ],
                    },
                    {
                        type: 'menu',
                        title: t(
                            'components.dashboard_sidebar.academic.student_cognitive_classifications',
                        ),
                        url: route(`${ROUTES.STUDENT_COGNITIVE_CLASSIFICATIONS}.index`),
                        icon: Brain,
                        permissions: [PermissionEnum.STUDENT_COGNITIVE_CLASSIFICATION_READ],
                    },
                    {
                        type: 'menu',
                        title: t('components.dashboard_sidebar.academic.test_case_change_trackers'),
                        url: route(`${ROUTES.TEST_CASE_CHANGE_TRACKERS}.index`),
                        icon: TestTube,
                        permissions: [PermissionEnum.TEST_CASE_CHANGE_TRACKER_READ],
                    },
                ],
            },
            {
                type: 'group',
                title: t('pages.student_courses.index.title'),
                items: [
                    {
                        type: 'menu',
                        title: t('pages.student_courses.index.title'),
                        url: route('student.courses.index'),
                        icon: School,
                        isActive:
                            url.startsWith('/student/courses') ||
                            url.startsWith('/student/materials') ||
                            url.startsWith('/student/questions'),
                    },
                ],
                permission: null, // No special permission needed, shown to all students
            },
        ],
        [currentLocale, url],
    );

    return (
        <Sidebar collapsible='icon' {...props}>
            <SidebarHeader>
                <DashboardSiteSwitcher teams={data.teams} />
            </SidebarHeader>
            <SidebarContent>
                <DashboardSidebarHeader items={menuItems} />
            </SidebarContent>
            <SidebarFooter>
                <DashboardSidebarUser />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
};

export { DashboardSidebar };
