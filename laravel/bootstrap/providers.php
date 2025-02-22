<?php

$providers = [
    // Common Providers (loaded in all environments)
    App\Providers\AppServiceProvider::class,
    App\Providers\RepositoryServiceProvider::class,
];

$localProviders = [
    // Development-only Providers
    App\Providers\TelescopeServiceProvider::class,
    // Add more local-only providers here
    // Example: App\Providers\DebugbarServiceProvider::class,
];

return app()->isLocal()
    ? array_merge($providers, $localProviders)
    : $providers;
