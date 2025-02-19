import { LucideIcon } from 'lucide-react';

export interface BaseMenuItem {
    title: string;
    icon?: LucideIcon;
    permissions?: string[];
}

export interface SingleMenuItem extends BaseMenuItem {
    url: string;
    type: 'menu';
}

export interface DropdownMenuItem extends BaseMenuItem {
    type: 'dropdown';
    items: {
        title: string;
        url: string;
        permissions?: string[];
    }[];
}

export interface MenuGroup {
    type: 'group';
    title: string;
    items: (SingleMenuItem | DropdownMenuItem)[];
}

export type MenuItem = SingleMenuItem | DropdownMenuItem | MenuGroup;
