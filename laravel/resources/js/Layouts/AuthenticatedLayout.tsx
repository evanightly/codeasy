import { SidebarInset, SidebarProvider } from '@/Components/UI/sidebar';
import { GenericBreadcrumbItem } from '@/Support/Interfaces/Others';
import { Head, usePage } from '@inertiajs/react';
import { HTMLAttributes, ReactNode } from 'react';
import { DashboardNavbar } from './Components/DashboardNavbar';
import { DashboardSidebar } from './Components/DashboardSidebar';

interface DashboardLayoutProps extends HTMLAttributes<HTMLDivElement> {
    breadcrumbs?: GenericBreadcrumbItem[];
    title?: string;
    navbarStart?: ReactNode;
    padding?: boolean;
}

export default function AuthenticatedLayout({
    children,
    breadcrumbs,
    padding = true,
    title,
}: DashboardLayoutProps) {
    const paddingClass = padding ? 'p-5' : 'p-0';
    const { auth } = usePage().props;

    return (
        <>
            <Head title={title} />
            <SidebarProvider>
                {auth.user && <DashboardSidebar />}
                <SidebarInset>
                    <DashboardNavbar breadcrumbs={breadcrumbs} />
                    <main className={`flex flex-1 flex-col gap-4 ${paddingClass}`}>{children}</main>
                </SidebarInset>
            </SidebarProvider>
        </>
    );
}
