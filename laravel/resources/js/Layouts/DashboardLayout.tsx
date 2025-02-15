import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/Components/UI/breadcrumb';
import { Separator } from '@/Components/UI/separator';
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from '@/Components/UI/sidebar';
import { Link, usePage } from '@inertiajs/react';
import React from 'react';
import { AppSidebar } from './Components/Sidebar';

interface Breadcrumb {
    name: string;
    url: string;
}

interface DashboardLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
    breadcrumbs?: Breadcrumb[];
}

export default function DashboardLayout({
    children,
    breadcrumbs,
}: DashboardLayoutProps) {
    const { auth } = usePage().props;

    return (
        <SidebarProvider>
            {auth.user && <AppSidebar />}
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        {auth.user && (
                            <>
                                <SidebarTrigger className="h-7 w-7 [&_svg]:size-4 [&_svg]:shrink-0" />
                                <Separator
                                    orientation="vertical"
                                    className="mr-2 h-4"
                                />
                            </>
                        )}

                        {breadcrumbs?.length && (
                            <Breadcrumb>
                                <BreadcrumbList>
                                    <BreadcrumbItem>
                                        <BreadcrumbLink asChild>
                                            <Link href="/">
                                                Home
                                            </Link>
                                        </BreadcrumbLink>
                                    </BreadcrumbItem>
                                    {breadcrumbs?.map((breadcrumb, index) => (
                                        <div key={breadcrumb.url}>
                                            <BreadcrumbItem
                                                key={breadcrumb.url}
                                            >
                                                <BreadcrumbLink
                                                    href={breadcrumb.url}
                                                >
                                                    {breadcrumb.name}
                                                </BreadcrumbLink>
                                            </BreadcrumbItem>
                                            {index < breadcrumbs.length - 1 && (
                                                <BreadcrumbSeparator />
                                            )}
                                        </div>
                                    ))}
                                    <BreadcrumbPage />
                                </BreadcrumbList>
                            </Breadcrumb>
                        )}
                    </div>
                </header>
                {children}
            </SidebarInset>
        </SidebarProvider>
    );
}
