'use client';

import { ChevronsUpDown, Plus } from 'lucide-react';
import * as React from 'react';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from '@/Components/UI/dropdown-menu';
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/Components/UI/sidebar';

const DashboardSiteSwitcher = ({
    teams,
}: {
    teams: {
        name: string;
        logo: React.ElementType;
        description: string;
        url: string;
    }[];
}) => {
    const { isMobile } = useSidebar();
    const [activeTeam, setActiveTeam] = React.useState(teams[0]);

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size='lg'
                            className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
                        >
                            <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'>
                                <activeTeam.logo className='size-4' />
                            </div>
                            <div className='grid flex-1 text-left text-sm leading-tight'>
                                <span className='truncate font-semibold'>{activeTeam.name}</span>
                                <span className='truncate text-xs'>{activeTeam.description}</span>
                            </div>
                            <ChevronsUpDown className='ml-auto' />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        sideOffset={4}
                        side={isMobile ? 'bottom' : 'right'}
                        className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg'
                        align='start'
                    >
                        <DropdownMenuLabel className='text-xs text-muted-foreground'>
                            Sites
                        </DropdownMenuLabel>
                        {teams.map((team, index) => (
                            <DropdownMenuItem
                                onClick={() => setActiveTeam(team)}
                                key={team.name}
                                className='gap-2 p-2'
                            >
                                <div className='flex size-6 items-center justify-center rounded-sm border'>
                                    <team.logo className='size-4 shrink-0' />
                                </div>
                                {team.name}
                                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className='gap-2 p-2'>
                            <div className='flex size-6 items-center justify-center rounded-md border bg-background'>
                                <Plus className='size-4' />
                            </div>
                            <div className='font-medium text-muted-foreground'>Add team</div>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
};

export { DashboardSiteSwitcher };
