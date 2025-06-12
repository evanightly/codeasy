import { SidebarInset, SidebarProvider } from '@/Components/UI/sidebar';
import { GenericBreadcrumbItem } from '@/Support/Interfaces/Others';
import { Head, usePage } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { HTMLAttributes, ReactNode, useEffect } from 'react';
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
    const { setLocale } = useLaravelReactI18n();

    useEffect(() => {
        // Ensure the locale is set correctly on initial load
        setTimeout(() => {
            if (auth.user.preferences?.locale) {
                setLocale(auth.user.preferences.locale);
                window.axios.defaults.headers['Accept-Language'] = auth.user.preferences.locale;
            }
        }, 100);
    }, [auth.user.preferences?.locale]);

    return (
        <>
            <Head title={title} />
            <SidebarProvider>
                {auth.user && <DashboardSidebar />}
                <SidebarInset className='overflow-x-scroll'>
                    <DashboardNavbar breadcrumbs={breadcrumbs} />
                    <main className={`flex flex-1 flex-col gap-4 text-foreground ${paddingClass}`}>
                        {children}
                    </main>
                </SidebarInset>
            </SidebarProvider>
        </>
    );
}
