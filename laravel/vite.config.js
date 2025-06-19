import react from '@vitejs/plugin-react';
import i18n from 'laravel-react-i18n/vite';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';
import tanstackQueryKeysPlugin from './vite_plugins/tanstackQueryKeysPlugin.js';
import intentEnumPlugin from './vite_plugins/transformIntentEnumPlugin.js';
import permissionEnumPlugin from './vite_plugins/transformPermissionEnumPlugin.js';
import roleEnumPlugin from './vite_plugins/transformRoleEnumPlugin.js';

// Read environment variable
const isProduction = process.env.APP_ENV === 'production';

// Conditionally load custom plugins
const customDevPlugins = isProduction
    ? []
    : [permissionEnumPlugin(), roleEnumPlugin(), intentEnumPlugin(), tanstackQueryKeysPlugin()];

export default defineConfig({
    server: {
        host: '0.0.0.0', // accessible from anywhere
        port: 9002,
        hmr: {
            port: 9002,
            host: 'localhost', // Force localhost for browser URLs
        },
        allowedHosts: ['localhost', 'laravel', '0.0.0.0'], // Allow Docker service name
        watch: {
            usePolling: true, // often needed in Docker env
        },
        cors: true, // Enable CORS for cross-origin requests
    },
    plugins: [
        laravel({
            input: 'resources/js/app.tsx',
            refresh: true,
        }),
        react(),
        i18n(),
        ...customDevPlugins,
    ],
});
