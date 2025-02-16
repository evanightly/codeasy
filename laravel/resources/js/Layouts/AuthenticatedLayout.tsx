import { SidebarInset, SidebarProvider } from '@/Components/UI/sidebar';
import { GenericBreadcrumbItem } from '@/Support/Interfaces/Others';
import { usePage } from '@inertiajs/react';
import React from 'react';
import { DashboardNavbar } from './Components/DashboardNavbar';
import { DashboardSidebar } from './Components/DashboardSidebar';

interface DashboardLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
    breadcrumbs?: GenericBreadcrumbItem[];
}

export default function AuthenticatedLayout({
    children,
    breadcrumbs,
}: DashboardLayoutProps) {
    const { auth } = usePage().props;

    return (
        <SidebarProvider>
            {auth.user && <DashboardSidebar />}
            <SidebarInset>
                <DashboardNavbar breadcrumbs={breadcrumbs} />
                {children}
            </SidebarInset>
        </SidebarProvider>
    );
}
