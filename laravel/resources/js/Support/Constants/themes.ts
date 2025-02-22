type ThemeType = 'predefined' | 'custom';

interface ThemeColors {
    background: string;
    'background-2': string;
    'background-3'?: string;
    foreground: string;
    card: string;
    'card-foreground': string;
    popover: string;
    'popover-foreground': string;
    primary: string;
    'primary-foreground': string;
    secondary: string;
    'secondary-foreground': string;
    tertiary: string;
    'tertiary-foreground': string;
    quaternary: string;
    'quaternary-foreground': string;
    warning: string;
    'warning-foreground': string;
    success: string;
    'success-foreground': string;
    info: string;
    'info-foreground': string;
    muted: string;
    'muted-foreground': string;
    accent: string;
    'accent-foreground': string;
    update?: string;
    'update-foreground'?: string;
    create?: string;
    'create-foreground'?: string;
    destructive: string;
    'destructive-foreground': string;
    border: string;
    input: string;
    ring: string;
    radius: string;
    'chart-1'?: string;
    'chart-2'?: string;
    'chart-3'?: string;
    'chart-4'?: string;
    'chart-5'?: string;
    'chart-post-all'?: string;
    'chart-post-saved'?: string;
    'chart-post-upvoted'?: string;
    'chart-urls'?: string;
    'sidebar-background'?: string;
    'sidebar-foreground'?: string;
    'sidebar-primary'?: string;
    'sidebar-primary-foreground'?: string;
    'sidebar-accent'?: string;
    'sidebar-accent-foreground'?: string;
    'sidebar-border'?: string;
    'sidebar-ring'?: string;
    'color-1'?: string;
    'color-2'?: string;
    'color-3'?: string;
    'color-4'?: string;
    'color-5'?: string;
    tag?: string;
    'tag-foreground'?: string;
    'tag-interest'?: string;
    'tag-interest-foreground'?: string;
    'tag-annotation'?: string;
    'tag-annotation-foreground'?: string;
    'tag-custom'?: string;
    'tag-custom-foreground'?: string;
    [key: string]: string | undefined;
}

interface Theme {
    name: string;
    type: ThemeType;
    light_colors: ThemeColors;
    dark_colors: ThemeColors;
    is_active: boolean;
}

export const THEMES: Theme[] = [
    {
        name: 'Miami',
        type: 'predefined',
        light_colors: {
            background: '0 0% 100%',
            'background-2': '0 0% 98%',
            foreground: '0 0% 3.9%',
            card: '0 0% 100%',
            'card-foreground': '0 0% 3.9%',
            popover: '0 0% 100%',
            'popover-foreground': '0 0% 3.9%',
            primary: '0 0% 9%',
            'primary-foreground': '0 0% 98%',
            secondary: '0 0% 96.1%',
            'secondary-foreground': '0 0% 9%',
            tertiary: '289 100% 50%',
            'tertiary-foreground': '0 0% 98%',
            quaternary: '144 100% 50%',
            'quaternary-foreground': '0 0% 3.9%',
            warning: '61 100% 50%',
            'warning-foreground': '0 0% 3.9%',
            success: '120 100% 50%',
            'success-foreground': '0 0% 3.9%',
            info: '207 100% 50%',
            'info-foreground': '0 0% 98%',
            muted: '0 0% 96.1%',
            'muted-foreground': '0 0% 45.1%',
            accent: '0 0% 96.1%',
            'accent-foreground': '0 0% 9%',
            update: '239 84% 67%',
            'update-foreground': '0 0% 98%',
            create: '160 84% 39%',
            'create-foreground': '0 0% 98%',
            destructive: '0 84.2% 60.2%',
            'destructive-foreground': '0 0% 98%',
            border: '0 0% 89.8%',
            input: '0 0% 89.8%',
            ring: '0 0% 3.9%',
            'chart-1': '12 76% 61%',
            'chart-2': '173 58% 39%',
            'chart-3': '197 37% 24%',
            'chart-4': '43 74% 66%',
            'chart-5': '27 87% 67%',
            radius: '0.5rem',
            'sidebar-background': '0 0% 98%',
            'sidebar-foreground': '240 5.3% 26.1%',
            'sidebar-primary': '240 5.9% 10%',
            'sidebar-primary-foreground': '0 0% 98%',
            'sidebar-accent': '240 4.8% 95.9%',
            'sidebar-accent-foreground': '240 5.9% 10%',
            'sidebar-border': '220 13% 91%',
            'sidebar-ring': '217.2 91.2% 59.8%',
            'color-1': '0 100% 63%',
            'color-2': '270 100% 63%',
            'color-3': '210 100% 63%',
            'color-4': '195 100% 63%',
            'color-5': '90 100% 63%',
        },
        dark_colors: {
            background: '0 0% 3.9%',
            'background-2': '0 0% 14.9%',
            foreground: '0 0% 98%',
            card: '0 0% 3.9%',
            'card-foreground': '0 0% 98%',
            popover: '0 0% 3.9%',
            'popover-foreground': '0 0% 98%',
            primary: '0 0% 98%',
            'primary-foreground': '0 0% 9%',
            secondary: '0 0% 14.9%',
            'secondary-foreground': '0 0% 98%',
            tertiary: '289 100% 50%',
            'tertiary-foreground': '0 0% 98%',
            quaternary: '144 100% 50%',
            'quaternary-foreground': '0 0% 3.9%',
            warning: '61 100% 50%',
            'warning-foreground': '0 0% 3.9%',
            success: '120 100% 50%',
            'success-foreground': '0 0% 3.9%',
            info: '207 100% 50%',
            'info-foreground': '0 0% 98%',
            muted: '0 0% 14.9%',
            'muted-foreground': '0 0% 63.9%',
            accent: '0 0% 14.9%',
            'accent-foreground': '0 0% 98%',
            update: '239 84% 67%',
            'update-foreground': '0 0% 98%',
            create: '160 84% 39%',
            'create-foreground': '0 0% 98%',
            destructive: '0 62.8% 30.6%',
            'destructive-foreground': '0 0% 98%',
            border: '0 0% 14.9%',
            input: '0 0% 14.9%',
            ring: '0 0% 83.1%',
            'chart-1': '220 70% 50%',
            'chart-2': '160 60% 45%',
            'chart-3': '30 80% 55%',
            'chart-4': '280 65% 60%',
            'chart-5': '340 75% 55%',
            radius: '0.5rem',
            'sidebar-background': '240 5.9% 10%',
            'sidebar-foreground': '240 4.8% 95.9%',
            'sidebar-primary': '224.3 76.3% 48%',
            'sidebar-primary-foreground': '0 0% 100%',
            'sidebar-accent': '240 3.7% 15.9%',
            'sidebar-accent-foreground': '240 4.8% 95.9%',
            'sidebar-border': '240 3.7% 15.9%',
            'sidebar-ring': '217.2 91.2% 59.8%',
            'color-1': '0 100% 63%',
            'color-2': '270 100% 63%',
            'color-3': '210 100% 63%',
            'color-4': '195 100% 63%',
            'color-5': '90 100% 63%',
        },
        is_active: true,
    },
    {
        name: 'Codeasy',
        type: 'predefined',
        light_colors: {
            background: '0 0% 100%',
            'background-2': '0 0% 98%',
            'background-3': '0 0% 96%',
            foreground: '240 10% 3.9%',
            primary: '142 76% 36%',
            'primary-foreground': '355 100% 97%',
            secondary: '240 5.9% 90%',
            'secondary-foreground': '240 5.9% 10%',
            tertiary: '289 100% 50%',
            'tertiary-foreground': '0 0% 98%',
            quaternary: '144 100% 50%',
            'quaternary-foreground': '0 0% 3.9%',
            card: '0 0% 100%',
            'card-foreground': '240 10% 3.9%',
            popover: '0 0% 100%',
            'popover-foreground': '240 10% 3.9%',
            muted: '240 4.8% 95.9%',
            'muted-foreground': '240 3.8% 46.1%',
            accent: '240 4.8% 95.9%',
            'accent-foreground': '240 5.9% 10%',
            warning: '48 96% 89%',
            'warning-foreground': '38 92% 50%',
            success: '120 100% 50%',
            'success-foreground': '0 0% 3.9%',
            info: '207 100% 50%',
            'info-foreground': '0 0% 98%',
            destructive: '0 84.2% 60.2%',
            'destructive-foreground': '0 0% 98%',
            border: '240 5.9% 90%',
            input: '240 5.9% 90%',
            ring: '142 76% 36%',
            radius: '0.5rem',
        },
        dark_colors: {
            background: '240 10% 3.9%',
            'background-2': '240 7.7% 8.9%',
            'background-3': '240 7.7% 10.9%',
            foreground: '0 0% 98%',
            primary: '142 76% 36%',
            'primary-foreground': '355 100% 97%',
            secondary: '240 3.7% 15.9%',
            'secondary-foreground': '0 0% 98%',
            tertiary: '289 100% 50%',
            'tertiary-foreground': '0 0% 98%',
            quaternary: '144 100% 50%',
            'quaternary-foreground': '0 0% 3.9%',
            card: '240 10% 3.9%',
            'card-foreground': '0 0% 98%',
            popover: '240 10% 3.9%',
            'popover-foreground': '0 0% 98%',
            muted: '240 3.7% 15.9%',
            'muted-foreground': '240 5% 64.9%',
            accent: '240 3.7% 15.9%',
            'accent-foreground': '0 0% 98%',
            warning: '48 96% 89%',
            'warning-foreground': '38 92% 50%',
            success: '120 100% 50%',
            'success-foreground': '0 0% 3.9%',
            info: '207 100% 50%',
            'info-foreground': '0 0% 98%',
            destructive: '0 62.8% 30.6%',
            'destructive-foreground': '0 0% 98%',
            border: '240 3.7% 15.9%',
            input: '240 3.7% 15.9%',
            ring: '142 76% 36%',
            radius: '0.5rem',
        },
        is_active: false,
    },
    {
        name: 'Daemonize',
        type: 'predefined',
        light_colors: {
            background: '0 0% 100%',
            'background-2': '0 0% 98%',
            'background-3': '0 0% 96.1%',
            foreground: '0 0% 3.9%',
            card: '0 0% 100%',
            'card-foreground': '0 0% 3.9%',
            popover: '0 0% 100%',
            'popover-foreground': '0 0% 3.9%',
            primary: '348 100% 56%',
            'primary-foreground': '0 0% 98%',
            secondary: '0 0% 96.1%',
            'secondary-foreground': '0 0% 9%',
            tertiary: '289 100% 50%',
            'tertiary-foreground': '0 0% 98%',
            quaternary: '144 100% 50%',
            'quaternary-foreground': '0 0% 3.9%',
            warning: '61 100% 50%',
            'warning-foreground': '0 0% 3.9%',
            success: '120 100% 50%',
            'success-foreground': '0 0% 3.9%',
            info: '207 100% 50%',
            'info-foreground': '0 0% 98%',
            muted: '0 0% 96.1%',
            'muted-foreground': '0 0% 45.1%',
            accent: '0 0% 96.1%',
            'accent-foreground': '0 0% 9%',
            update: '239 84% 67%',
            'update-foreground': '0 0% 98%',
            create: '160 84% 39%',
            'create-foreground': '0 0% 98%',
            destructive: '0 84.2% 60.2%',
            'destructive-foreground': '0 0% 98%',
            tag: '230 80% 68%',
            'tag-foreground': '0 0% 98%',
            'tag-interest': '255 80% 68%',
            'tag-interest-foreground': '0 0% 98%',
            'tag-annotation': '0 80% 68%',
            'tag-annotation-foreground': '0 0% 98%',
            'tag-custom': '39 80% 68%',
            'tag-custom-foreground': '0 0% 98%',
            border: '0 0% 89.8%',
            input: '0 0% 89.8%',
            ring: '0 0% 3.9%',
            'chart-1': '12 76% 61%',
            'chart-2': '173 58% 39%',
            'chart-3': '197 37% 24%',
            'chart-4': '43 74% 66%',
            'chart-5': '27 87% 67%',
            'chart-post-all': '214 98% 34%',
            'chart-post-saved': '157 100% 50%',
            'chart-post-upvoted': '0 47% 60%',
            'chart-urls': '256 86% 62%',
            radius: '0.5rem',
            'sidebar-background': '0 0% 98%',
            'sidebar-foreground': '240 5.3% 26.1%',
            'sidebar-primary': '240 5.9% 10%',
            'sidebar-primary-foreground': '0 0% 98%',
            'sidebar-accent': '240 4.8% 95.9%',
            'sidebar-accent-foreground': '240 5.9% 10%',
            'sidebar-border': '220 13% 91%',
            'sidebar-ring': '217.2 91.2% 59.8%',
            'color-1': '0 100% 63%',
            'color-2': '270 100% 63%',
            'color-3': '210 100% 63%',
            'color-4': '195 100% 63%',
            'color-5': '90 100% 63%',
        },
        dark_colors: {
            background: '0 0% 3.9%',
            'background-2': '240 5.9% 10%',
            'background-3': '240 4.8% 15.9%',
            foreground: '0 0% 98%',
            card: '0 0% 3.9%',
            'card-foreground': '0 0% 98%',
            popover: '0 0% 3.9%',
            'popover-foreground': '0 0% 98%',
            primary: '348 100% 56%',
            'primary-foreground': '0 0% 98%',
            secondary: '0 0% 14.9%',
            'secondary-foreground': '0 0% 98%',
            tertiary: '289 100% 50%',
            'tertiary-foreground': '0 0% 98%',
            quaternary: '144 100% 50%',
            'quaternary-foreground': '0 0% 3.9%',
            warning: '61 100% 50%',
            'warning-foreground': '0 0% 3.9%',
            success: '120 100% 50%',
            'success-foreground': '0 0% 3.9%',
            info: '207 100% 50%',
            'info-foreground': '0 0% 98%',
            muted: '0 0% 14.9%',
            'muted-foreground': '0 0% 63.9%',
            accent: '0 0% 14.9%',
            'accent-foreground': '0 0% 98%',
            update: '239 84% 67%',
            'update-foreground': '0 0% 98%',
            create: '160 84% 39%',
            'create-foreground': '0 0% 98%',
            destructive: '0 62.8% 30.6%',
            'destructive-foreground': '0 0% 98%',
            tag: '230 80% 68%',
            'tag-foreground': '0 0% 98%',
            'tag-interest': '255 80% 68%',
            'tag-interest-foreground': '0 0% 98%',
            'tag-annotation': '0 80% 68%',
            'tag-annotation-foreground': '0 0% 98%',
            'tag-custom': '39 80% 68%',
            'tag-custom-foreground': '0 0% 98%',
            border: '0 0% 14.9%',
            input: '0 0% 14.9%',
            ring: '0 0% 83.1%',
            'chart-1': '220 70% 50%',
            'chart-2': '160 60% 45%',
            'chart-3': '30 80% 55%',
            'chart-4': '280 65% 60%',
            'chart-5': '340 75% 55%',
            'chart-post-all': '214 98% 34%',
            'chart-post-saved': '157 100% 50%',
            'chart-post-upvoted': '0 47% 60%',
            'chart-urls': '256 86% 62%',
            'sidebar-background': '240 5.9% 10%',
            'sidebar-foreground': '240 4.8% 95.9%',
            'sidebar-primary': '224.3 76.3% 48%',
            'sidebar-primary-foreground': '0 0% 100%',
            'sidebar-accent': '240 3.7% 15.9%',
            'sidebar-accent-foreground': '240 4.8% 95.9%',
            'sidebar-border': '240 3.7% 15.9%',
            'sidebar-ring': '217.2 91.2% 59.8%',
            'color-1': '0 100% 63%',
            'color-2': '270 100% 63%',
            'color-3': '210 100% 63%',
            'color-4': '195 100% 63%',
            'color-5': '90 100% 63%',
            radius: '0',
        },
        is_active: false,
    },
];

export type { Theme, ThemeColors, ThemeType };
