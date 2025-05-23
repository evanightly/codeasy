import forms from '@tailwindcss/forms';
import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ['class'],
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.tsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
            },
            colors: {
                background: 'hsl(var(--background))',
                'background-2': 'hsl(var(--background-2))',
                foreground: 'hsl(var(--foreground))',
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))',
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))',
                },
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))',
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))',
                },
                tertiary: {
                    DEFAULT: 'hsl(var(--tertiary))',
                    foreground: 'hsl(var(--tertiary-foreground))',
                },
                quaternary: {
                    DEFAULT: 'hsl(var(--quaternary))',
                    foreground: 'hsl(var(--quaternary-foreground))',
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))',
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))',
                },
                success: {
                    DEFAULT: 'hsl(var(--success))',
                    foreground: 'hsl(var(--success-foreground))',
                },
                warning: {
                    DEFAULT: 'hsl(var(--warning))',
                    foreground: 'hsl(var(--warning-foreground))',
                },
                info: {
                    DEFAULT: 'hsl(var(--info))',
                    foreground: 'hsl(var(--info-foreground))',
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))',
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))',
                },
                update: {
                    DEFAULT: 'hsl(var(--update))',
                    foreground: 'hsl(var(--update-foreground))',
                },
                create: {
                    DEFAULT: 'hsl(var(--create))',
                    foreground: 'hsl(var(--create-foreground))',
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))',
                },
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                chart: {
                    1: 'hsl(var(--chart-1))',
                    2: 'hsl(var(--chart-2))',
                    3: 'hsl(var(--chart-3))',
                    4: 'hsl(var(--chart-4))',
                    5: 'hsl(var(--chart-5))',
                },
                sidebar: {
                    DEFAULT: 'hsl(var(--sidebar-background))',
                    foreground: 'hsl(var(--sidebar-foreground))',
                    primary: 'hsl(var(--sidebar-primary))',
                    'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
                    accent: 'hsl(var(--sidebar-accent))',
                    'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
                    border: 'hsl(var(--sidebar-border))',
                    ring: 'hsl(var(--sidebar-ring))',
                },
                'color-1': 'hsl(var(--color-1))',
                'color-2': 'hsl(var(--color-2))',
                'color-3': 'hsl(var(--color-3))',
                'color-4': 'hsl(var(--color-4))',
                'color-5': 'hsl(var(--color-5))',
            },
            keyframes: {
                'accordion-down': {
                    from: {
                        height: '0',
                    },
                    to: {
                        height: 'var(--radix-accordion-content-height)',
                    },
                },
                'accordion-up': {
                    from: {
                        height: 'var(--radix-accordion-content-height)',
                    },
                    to: {
                        height: '0',
                    },
                },
                'shiny-text': {
                    '0%, 90%, 100%': {
                        'background-position': 'calc(-100% - var(--shiny-width)) 0',
                    },
                    '30%, 60%': {
                        'background-position': 'calc(100% + var(--shiny-width)) 0',
                    },
                },
                gradient: {
                    to: {
                        backgroundPosition: 'var(--bg-size) 0',
                    },
                },
                'border-beam': {
                    '100%': {
                        'offset-distance': '100%',
                    },
                },
                marquee: {
                    from: {
                        transform: 'translateX(0)',
                    },
                    to: {
                        transform: 'translateX(calc(-100% - var(--gap)))',
                    },
                },
                'marquee-vertical': {
                    from: {
                        transform: 'translateY(0)',
                    },
                    to: {
                        transform: 'translateY(calc(-100% - var(--gap)))',
                    },
                },
                'background-position-spin': {
                    '0%': {
                        backgroundPosition: 'top center',
                    },
                    '100%': {
                        backgroundPosition: 'bottom center',
                    },
                },
                orbit: {
                    '0%': {
                        transform:
                            'rotate(0deg) translateY(calc(var(--radius) * 1px)) rotate(0deg)',
                    },
                    '100%': {
                        transform:
                            'rotate(360deg) translateY(calc(var(--radius) * 1px)) rotate(-360deg)',
                    },
                },
                pulse: {
                    '0%, 100%': {
                        boxShadow: '0 0 0 0 var(--pulse-color)',
                    },
                    '50%': {
                        boxShadow: '0 0 0 8px var(--pulse-color)',
                    },
                },
                grid: {
                    '0%': {
                        transform: 'translateY(-50%)',
                    },
                    '100%': {
                        transform: 'translateY(0)',
                    },
                },
                ripple: {
                    '0%, 100%': {
                        transform: 'translate(-50%, -50%) scale(1)',
                    },
                    '50%': {
                        transform: 'translate(-50%, -50%) scale(0.9)',
                    },
                },
                'shimmer-slide': {
                    to: {
                        transform: 'translate(calc(100cqw - 100%), 0)',
                    },
                },
                'spin-around': {
                    '0%': {
                        transform: 'translateZ(0) rotate(0)',
                    },
                    '15%, 35%': {
                        transform: 'translateZ(0) rotate(90deg)',
                    },
                    '65%, 85%': {
                        transform: 'translateZ(0) rotate(270deg)',
                    },
                    '100%': {
                        transform: 'translateZ(0) rotate(360deg)',
                    },
                },
                shine: {
                    '0%': {
                        'background-position': '0% 0%',
                    },
                    '50%': {
                        'background-position': '100% 100%',
                    },
                    to: {
                        'background-position': '0% 0%',
                    },
                },
                'modal-fade-in': {
                    '0%': {
                        opacity: '0',
                    },
                    '100%': {
                        opacity: '1',
                    },
                },
                'modal-fade-out': {
                    '0%': {
                        opacity: '1',
                    },
                    '100%': {
                        opacity: '0',
                    },
                },
                rainbow: {
                    '0%': {
                        'background-position': '0%',
                    },
                    '100%': {
                        'background-position': '200%',
                    },
                },
                'nyx-fade-out': {
                    '0%': {
                        opacity: '1',
                    },
                    '100%': {
                        opacity: '0',
                    },
                },
                'line-shadow': {
                    '0%': {
                        'background-position': '0 0',
                    },
                    '100%': {
                        'background-position': '100% -100%',
                    },
                },
                'aurora-border': {
                    '0%, 100%': {
                        borderRadius: '37% 29% 27% 27% / 28% 25% 41% 37%',
                    },
                    '25%': {
                        borderRadius: '47% 29% 39% 49% / 61% 19% 66% 26%',
                    },
                    '50%': {
                        borderRadius: '57% 23% 47% 72% / 63% 17% 66% 33%',
                    },
                    '75%': {
                        borderRadius: '28% 49% 29% 100% / 93% 20% 64% 25%',
                    },
                },
                'aurora-1': {
                    '0%, 100%': {
                        top: '0',
                        right: '0',
                    },
                    '50%': {
                        top: '50%',
                        right: '25%',
                    },
                    '75%': {
                        top: '25%',
                        right: '50%',
                    },
                },
                'aurora-2': {
                    '0%, 100%': {
                        top: '0',
                        left: '0',
                    },
                    '60%': {
                        top: '75%',
                        left: '25%',
                    },
                    '85%': {
                        top: '50%',
                        left: '50%',
                    },
                },
                'aurora-3': {
                    '0%, 100%': {
                        bottom: '0',
                        left: '0',
                    },
                    '40%': {
                        bottom: '50%',
                        left: '25%',
                    },
                    '65%': {
                        bottom: '25%',
                        left: '50%',
                    },
                },
                'aurora-4': {
                    '0%, 100%': {
                        bottom: '0',
                        right: '0',
                    },
                    '50%': {
                        bottom: '25%',
                        right: '40%',
                    },
                    '90%': {
                        bottom: '50%',
                        right: '25%',
                    },
                },
                rippling: {
                    '0%': {
                        opacity: '1',
                    },
                    '100%': {
                        transform: 'scale(2)',
                        opacity: '0',
                    },
                },
                meteor: {
                    '0%': { transform: 'rotate(215deg) translateX(0)', opacity: 1 },
                    '70%': { opacity: 1 },
                    '100%': {
                        transform: 'rotate(215deg) translateX(-500px)',
                        opacity: 0,
                    },
                },
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                'shiny-text': 'shiny-text 8s infinite',
                gradient: 'gradient 8s linear infinite',
                'border-beam': 'border-beam calc(var(--duration)*1s) infinite linear',
                marquee: 'marquee var(--duration) infinite linear',
                'marquee-vertical': 'marquee-vertical var(--duration) linear infinite',
                'background-position-spin': 'background-position-spin 3000ms infinite alternate',
                orbit: 'orbit calc(var(--duration)*1s) linear infinite',
                pulse: 'pulse var(--duration) ease-out infinite',
                grid: 'grid 15s linear infinite',
                ripple: 'ripple var(--duration,2s) ease calc(var(--i, 0)*.2s) infinite',
                'shimmer-slide': 'shimmer-slide var(--speed) ease-in-out infinite alternate',
                'spin-around': 'spin-around calc(var(--speed) * 2) infinite linear',
                shine: 'shine var(--duration) infinite linear',
                'modal-fade-in': 'modal-fade-in 500ms ease-out',
                'modal-fade-out': 'modal-fade-out 500ms ease-in',
                rainbow: 'rainbow var(--speed, 2s) infinite linear',
                'nyx-fade-out': 'nyx-fade-out 0.2s ease-out',
                'line-shadow': 'line-shadow 15s linear infinite',
                'aurora-border': 'aurora-border 10s ease-in-out infinite',
                'aurora-1': 'aurora-1 15s ease-in-out infinite',
                'aurora-2': 'aurora-2 15s ease-in-out infinite',
                'aurora-3': 'aurora-3 15s ease-in-out infinite',
                'aurora-4': 'aurora-4 15s ease-in-out infinite',
                rippling: 'rippling var(--duration) ease-out',
                meteor: 'meteor 5s linear infinite',
            },
            borderColor: {
                'grid-line': 'hsl(var(--border) / var(--grid-line-opacity))',
            },
            gridTemplateColumns: {
                'grid-16': 'repeat(16, minmax(0, 1fr))',
                'grid-12': 'repeat(12, minmax(0, 1fr))',
                'grid-8': 'repeat(8, minmax(0, 1fr))',
                'grid-md': 'repeat(var(--md-grid-columns), 1fr)',
                'grid-sm': 'repeat(var(--sm-grid-columns), 1fr)',
            },
            gridTemplateRows: {
                'grid-md': 'repeat(var(--md-grid-rows), 1fr)',
                'grid-sm': 'repeat(var(--sm-grid-rows), 1fr)',
            },
            spacing: {
                'nyx-layout-top': 'calc(var(--nyx-banner-height) + var(--nyx-nav-height))',
            },
        },
    },

    plugins: [forms, require('tailwindcss-animate')],
};
