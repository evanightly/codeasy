'use client';

import {
    AudioWaveform,
    Book,
    FileCheck,
    GalleryVerticalEnd,
    Lock,
    PieChart,
    Presentation,
    School,
    ShieldCheck,
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
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { DashboardSidebarHeader } from './Components/DashboardSidebarHeader';
import { DashboardSidebarUser } from './Components/DashboardSidebarUser';
import { DashboardSiteSwitcher } from './Components/DashboardSiteSwitcher';

interface AppSidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

const DashboardSidebar = ({ ...props }: AppSidebarProps) => {
    const { t, currentLocale } = useLaravelReactI18n();
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
                    },
                    {
                        type: 'menu',
                        title: t('components.dashboard_sidebar.academic.school_requests'),
                        url: route(`${ROUTES.SCHOOL_REQUESTS}.index`),
                        icon: FileCheck,
                    },
                    {
                        type: 'menu',
                        title: t('components.dashboard_sidebar.academic.class_rooms'),
                        url: route(`${ROUTES.CLASS_ROOMS}.index`),
                        icon: Presentation,
                    },
                    {
                        type: 'menu',
                        title: t('components.dashboard_sidebar.academic.courses'),
                        url: route(`${ROUTES.COURSES}.index`),
                        icon: Book,
                    },
                ],
            },
        ],
        [currentLocale],
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
