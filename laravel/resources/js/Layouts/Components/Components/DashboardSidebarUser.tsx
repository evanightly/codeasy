'use client';

import { BadgeCheck, ChevronsUpDown, LogOut, Sparkles } from 'lucide-react';

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
import { DashboardNavbarDarkModeToggler } from './Components/DashboardDarkModeToggler';
import { SetLocalization } from './Components/DashboardSetLocalization';
import { DashboardSetTheme } from './Components/DashboardSetTheme';

const DashboardSidebarUser = () => {
    const { isMobile } = useSidebar();
    const {
        auth: { user },
    } = usePage().props;

    const abbreviatedName = user?.name?.split(' ').map((n) => n.charAt(0));

    return (
        <SidebarMenu>
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
                                Upgrade to Pro
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem asChild>
                                <Link href={route('profile.edit')}>
                                    <BadgeCheck />
                                    Profile
                                </Link>
                            </DropdownMenuItem>

                            <SetLocalization />

                            <DashboardSetTheme />
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link method='post' href={route('logout')} className='w-full'>
                                <LogOut />
                                Log out
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
};

export { DashboardSidebarUser };
