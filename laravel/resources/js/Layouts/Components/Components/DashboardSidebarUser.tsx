'use client';

import { BadgeCheck, ChevronsUpDown, LogOut, Sparkles, Terminal } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/Components/UI/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/Components/UI/dropdown-menu';
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/Components/UI/sidebar';
import { Link, usePage } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { DashboardNavbarDarkModeToggler } from './Components/DashboardDarkModeToggler';
import { SetLocalization } from './Components/DashboardSetLocalization';
import { DashboardSetTheme } from './Components/DashboardSetTheme';
import { DashboardSandboxPromo } from './DashboardSandboxPromo';

const DashboardSidebarUser = () => {
    const { state } = useSidebar();
    const { isMobile } = useSidebar();
    const { t } = useLaravelReactI18n();
    const {
        auth: { user },
    } = usePage().props;

    const abbreviatedName = user?.name?.split(' ').map((n) => n.charAt(0));

    return (
        <SidebarMenu>
            {state === 'expanded' ? (
                <SidebarMenuItem className='mb-6'>
                    <DashboardSandboxPromo />
                </SidebarMenuItem>
            ) : (
                <SidebarMenuItem className='mb-6'>
                    <SidebarMenuButton variant='windui' asChild>
                        <Link href={route('sandbox.index')}>
                            <Terminal />
                            <span>{t('components.dashboard_sidebar.user.sandbox')}</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            )}
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size='lg'
                            className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
                        >
                            <Avatar className='h-8 w-8 rounded-lg'>
                                <AvatarImage
                                    src={user?.profile_image_url ?? ''}
                                    className='object-cover'
                                    alt={user.name}
                                />
                                <AvatarFallback className='rounded-lg'>
                                    {abbreviatedName}
                                </AvatarFallback>
                            </Avatar>
                            <div className='grid flex-1 text-left text-sm leading-tight'>
                                <span className='truncate font-semibold'>{user.name}</span>
                                <span className='truncate text-xs'>{user.email}</span>
                            </div>
                            <ChevronsUpDown className='ml-auto size-4' />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        sideOffset={4}
                        side={isMobile ? 'bottom' : 'right'}
                        className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg'
                        align='end'
                    >
                        <DropdownMenuLabel className='p-0 font-normal'>
                            <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
                                <Avatar className='h-8 w-8 rounded-lg'>
                                    <AvatarImage src={user?.image_url ?? ''} alt={user.name} />
                                    <AvatarFallback className='rounded-lg'>
                                        {abbreviatedName}
                                    </AvatarFallback>
                                </Avatar>
                                <div className='grid flex-1 text-left text-sm leading-tight'>
                                    <span className='truncate font-semibold'>{user.name}</span>
                                    <span className='truncate text-xs'>{user.email}</span>
                                </div>
                                <DashboardNavbarDarkModeToggler />
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem>
                                <Sparkles />
                                {t('components.dashboard_sidebar.user.upgrade_to_pro')}
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem asChild>
                                <Link href={route('profile.edit')}>
                                    <BadgeCheck />
                                    {t('components.dashboard_sidebar.user.profile')}
                                </Link>
                            </DropdownMenuItem>

                            <SetLocalization />

                            <DashboardSetTheme />
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link method='post' href={route('logout')} className='w-full'>
                                <LogOut />
                                {t('components.dashboard_sidebar.user.log_out')}
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
};

export { DashboardSidebarUser };
