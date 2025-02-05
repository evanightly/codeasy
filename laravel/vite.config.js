import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

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
    ],
});
