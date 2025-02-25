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
        host: '0.0.0.0', // agar bisa diakses dari luar container
        port: 9002,
        hmr: {
            clientPort: 9002, // port untuk HMR,
            host: 'localhost',
        },
        watch: {
            usePolling: true, // terkadang diperlukan di Docker env
        },
    },
    plugins: [
        laravel({
            input: 'resources/js/app.tsx',
            refresh: true,
            devServer: {
                // inilah yang dipakai plugin untuk injeksi script HMR ke browser
                host: 'localhost',
                port: 9002,
            },
        }),
        react(),
        i18n(),
        ...customDevPlugins,
    ],
});
