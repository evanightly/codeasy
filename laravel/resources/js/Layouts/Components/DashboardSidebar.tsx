'use client';

import { AudioWaveform, Command, Frame, GalleryVerticalEnd, PieChart } from 'lucide-react';
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
    user: {
        name: 'nyxb',
        email: 'm@example.com',
        avatar: '/avatars/nyxb.jpg',
    },
    teams: [
        {
            name: 'Acme Inc',
            logo: GalleryVerticalEnd,
            plan: 'Enterprise',
        },
        {
            name: 'Acme Corp.',
            logo: AudioWaveform,
            plan: 'Startup',
        },
        {
            name: 'Evil Corp.',
            logo: Command,
            plan: 'Free',
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
                icon: Frame,
                permissions: [PermissionEnum.PERMISSION_READ],
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
