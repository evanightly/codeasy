import { CustomTanstackQueryDevtools } from '@/Components/custom-tanstack-query-devtools';
import GenericBreadcrumb from '@/Components/GenericBreadcrumb';
import { Separator } from '@/Components/UI/separator';
import { SidebarTrigger } from '@/Components/UI/sidebar';
import { generateDynamicBreadcrumbs } from '@/Helpers';
import { GenericBreadcrumbItem } from '@/Support/Interfaces/Others';
import { usePage } from '@inertiajs/react';
import { ReactNode } from 'react';

interface DashboardNavbarProps {
    breadcrumbs?: GenericBreadcrumbItem[];
    navbarStart?: ReactNode;
}

const DashboardNavbar = ({
    breadcrumbs = generateDynamicBreadcrumbs(),
    navbarStart,
}: DashboardNavbarProps) => {
    const { env } = usePage().props;

    return (
        <header className='flex h-16 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12'>
            <div className='flex flex-1 items-center gap-2'>
                <SidebarTrigger title='Toggle Sidebar' className='-ml-1 text-foreground' />
                <Separator orientation='vertical' className='mr-2 h-4' />
                {breadcrumbs && <GenericBreadcrumb breadcrumbs={breadcrumbs} />}
                {navbarStart}
                {env.appEnv === 'local' && (
                    <div className='ml-auto flex items-center gap-2'>
                        <CustomTanstackQueryDevtools />
                    </div>
                )}
            </div>
        </header>
    );
};

export { DashboardNavbar };
