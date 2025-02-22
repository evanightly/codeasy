import { Toaster as SonnerToaster } from '@/Components/UI/sonner';
import { ComponentVariantProvider } from '@/Contexts/ComponentVariantContext';
import { DarkModeProvider } from '@/Contexts/ThemeContext';
import { createInertiaApp } from '@inertiajs/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { MouseEvent } from 'react';
import { createRoot } from 'react-dom/client';
import '../css/app.css';
import './bootstrap';
import { ConfirmationDialogProvider } from './Contexts/ConfirmationDialogContext';
import { addRippleEffect } from './Helpers';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(`./Pages/${name}.tsx`, import.meta.glob('./Pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        document.addEventListener('click', (event) => {
            const target = event.target as HTMLElement;

            // Call addRippleEffect only if a ripple element or its descendant is clicked
            if (target.closest('.ripple')) {
                addRippleEffect(event as unknown as MouseEvent<HTMLElement>);
            }
        });

        const queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    refetchInterval: 10 * 1000,
                    staleTime: 60 * 1000,
                },
            },
        });

        root.render(
            <QueryClientProvider client={queryClient}>
                <DarkModeProvider>
                    <ComponentVariantProvider>
                        <ConfirmationDialogProvider>
                            <SonnerToaster
                                toastOptions={
                                    {
                                        // https://github.com/shadcn-ui/ui/issues/2234
                                    }
                                }
                                theme='light'
                                richColors
                                duration={2000}
                                closeButton
                            />
                            <App {...props} />
                        </ConfirmationDialogProvider>
                    </ComponentVariantProvider>
                </DarkModeProvider>
            </QueryClientProvider>,
        );
    },
    progress: {
        color: 'hsl(var(--primary))',
    },
});
