'use client';

import { Link, usePage } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/Components/UI/collapsible';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/Components/UI/sidebar';
import { DropdownMenuItem, MenuItem, SingleMenuItem } from '@/Support/Interfaces/Others';

const DashboardSidebarHeader = ({ items }: { items: MenuItem[] }) => {
    const { auth } = usePage().props;
    const userPermissions: string[] = auth?.user?.permissions || [];

    const hasPermission = (permissions?: string[]) => {
        if (!permissions) return true;
        return permissions.some((perm) => userPermissions.includes(perm));
    };

    const renderMenuItem = (item: SingleMenuItem | DropdownMenuItem) => {
        if (!hasPermission(item.permissions)) return null;

        if (item.type === 'menu') {
            return (
                <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton isActive={window.location.toString() === item.url} asChild>
                        <Link href={item.url}>
                            {item.icon && <item.icon />}
                            <span>{item.title}</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            );
        }

        // Dropdown menu
        const filteredSubItems = item?.items?.filter((subItem) =>
            hasPermission(subItem.permissions),
        );
        if (filteredSubItems?.length === 0) return null;

        return (
            <Collapsible key={item.title} className='group/collapsible' asChild>
                <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                        <SidebarMenuButton tooltip={item.title}>
                            {item.icon && <item.icon />}
                            <span>{item.title}</span>
                            <ChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                        </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <SidebarMenuSub>
                            {filteredSubItems?.map((subItem) => (
                                <SidebarMenuSubItem key={subItem.title}>
                                    <SidebarMenuSubButton asChild>
                                        <Link href={subItem.url}>
                                            <span>{subItem.title}</span>
                                        </Link>
                                    </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                            ))}
                        </SidebarMenuSub>
                    </CollapsibleContent>
                </SidebarMenuItem>
            </Collapsible>
        );
    };

    return (
        <>
            {items.map((item) => {
                if (item.type === 'group') {
                    const filteredGroupItems = item.items.filter((menuItem) =>
                        hasPermission(menuItem.permissions),
                    );
                    if (filteredGroupItems.length === 0) return null;

                    return (
                        <SidebarGroup key={item.title}>
                            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
                            <SidebarMenu>
                                {filteredGroupItems.map((menuItem) => renderMenuItem(menuItem))}
                            </SidebarMenu>
                        </SidebarGroup>
                    );
                }

                return <SidebarMenu key={item.title}>{renderMenuItem(item)}</SidebarMenu>;
            })}
        </>
    );
};

export { DashboardSidebarHeader };
