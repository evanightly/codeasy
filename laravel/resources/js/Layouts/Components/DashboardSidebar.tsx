'use client';

import {
    AudioWaveform,
    FileCheck,
    GalleryVerticalEnd,
    Lock,
    PieChart,
    School,
    ShieldCheck,
    Users,
} from 'lucide-react';
import type * as React from 'react';

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
import { DashboardSidebarHeader } from './Components/DashboardSidebarHeader';
import { DashboardSidebarUser } from './Components/DashboardSidebarUser';
import { DashboardSiteSwitcher } from './Components/DashboardSiteSwitcher';

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

const menuItems: MenuItem[] = [
    {
        type: 'group',
        title: 'Dashboard',
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
        title: 'Admin',
        items: [
            {
                type: 'menu',
                title: 'Permissions',
                url: route(`${ROUTES.PERMISSIONS}.index`),
                icon: ShieldCheck,
                permissions: [PermissionEnum.PERMISSION_READ],
            },
            {
                type: 'menu',
                title: 'Roles',
                url: route(`${ROUTES.ROLES}.index`),
                icon: Lock,
                permissions: [PermissionEnum.ROLE_READ],
            },
            {
                type: 'menu',
                title: 'Users',
                url: route(`${ROUTES.USERS}.index`),
                icon: Users,
                permissions: [PermissionEnum.USER_READ],
            },
        ],
    },
    {
        type: 'group',
        title: 'Academic',
        items: [
            {
                type: 'menu',
                title: 'Schools',
                url: route(`${ROUTES.SCHOOLS}.index`),
                icon: School,
            },
            {
                type: 'menu',
                title: 'School Requests',
                url: route(`${ROUTES.SCHOOL_REQUESTS}.index`),
                icon: FileCheck,
            },
        ],
    },
];

interface AppSidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

const DashboardSidebar = ({ ...props }: AppSidebarProps) => {
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
