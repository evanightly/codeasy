import '../css/app.css';
import './bootstrap';
import { Toaster as SonnerToaster } from '@/Components/UI/sonner';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob('./Pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <>
                <SonnerToaster
                    toastOptions={
                        {
                            // https://github.com/shadcn-ui/ui/issues/2234
                        }
                    }
                    theme="light"
                    richColors
                    duration={2000}
                    closeButton
                />
                <App {...props} />
            </>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});
