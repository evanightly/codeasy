<?php

if (!function_exists('get_vite_host')) {
    /**
     * Get the correct Vite host based on request context
     */
    function get_vite_host(): string {
        // Only apply custom logic in local environment
        if (!app()->environment('local')) {
            return 'localhost:9002';
        }

        $request = request();
        if (!$request) {
            return 'localhost:9002';
        }

        $host = $request->getHost();

        // Determine if request is coming from Docker network
        $isDockerRequest = $host === 'laravel' ||
                          str_contains($host, 'laravel');

        // Return the appropriate Vite host
        return $isDockerRequest ? 'laravel:9002' : 'localhost:9002';
    }
}

if (!function_exists('get_vite_url')) {
    /**
     * Get the complete Vite URL based on request context
     */
    function get_vite_url(): string {
        return 'http://' . get_vite_host();
    }
}
