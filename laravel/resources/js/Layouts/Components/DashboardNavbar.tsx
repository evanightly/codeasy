import GenericBreadcrumb from '@/Components/GenericBreadcrumb';
import { Separator } from '@/Components/UI/separator';
import { SidebarTrigger } from '@/Components/UI/sidebar';
import { GenericBreadcrumbItem } from '@/Support/Interfaces/Others';
import { ReactNode } from 'react';

interface DashboardNavbarProps {
    breadcrumbs?: GenericBreadcrumbItem[];
    navbarStart?: ReactNode;
}

const DashboardNavbar = ({ breadcrumbs, navbarStart }: DashboardNavbarProps) => {
    return (
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="h-7 w-7 [&_svg]:size-4 [&_svg]:shrink-0" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                {breadcrumbs && <GenericBreadcrumb breadcrumbs={breadcrumbs} />}
                {navbarStart}
            </div>
        </header>
    );
};

export { DashboardNavbar };
