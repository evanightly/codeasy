<?php

namespace App\Providers;

use Illuminate\Support\Facades\Blade;
use Illuminate\Support\ServiceProvider;

class ViteServiceProvider extends ServiceProvider {
    public function register(): void {
        //
    }

    public function boot(): void {
        // Only run in local environment
        if (!app()->environment('local')) {
            return;
        }

        // Register custom Blade directive for Vite React Refresh
        Blade::directive('viteReactRefreshWithHost', function () {
            return "<?php 
                \$viteHost = get_vite_host();
                \$viteUrl = 'http://' . \$viteHost;
                echo '<script type=\"module\">
                    import RefreshRuntime from \"' . \$viteUrl . '/@react-refresh\"
                    RefreshRuntime.injectIntoGlobalHook(window)
                    window.\$RefreshReg\$ = () => {}
                    window.\$RefreshSig\$ = () => (type) => type
                    window.__vite_plugin_react_preamble_installed__ = true
                </script>';
            ?>";
        });

        // Register custom Blade directive for Vite assets
        Blade::directive('viteWithHost', function ($expression) {
            return "<?php 
                \$viteHost = get_vite_host();
                \$viteUrl = 'http://' . \$viteHost;
                \$assets = $expression;
                if (!is_array(\$assets)) {
                    \$assets = [\$assets];
                }
                echo '<script type=\"module\" src=\"' . \$viteUrl . '/@vite/client\"></script>';
                foreach (\$assets as \$asset) {
                    echo '<script type=\"module\" src=\"' . \$viteUrl . '/' . ltrim(\$asset, '/') . '\"></script>';
                }
            ?>";
        });
    }
}
