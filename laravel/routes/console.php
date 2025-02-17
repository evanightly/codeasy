<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote')->hourly();

Artisan::command('sandbox:cleanup', function () {
    $path = storage_path('app/public/visualizations');
    $files = glob($path . '/sandbox_*.png');
    $count = 0;
    $twoDaysAgo = time() - (2 * 24 * 60 * 60); // 2 days in seconds

    foreach ($files as $file) {
        if (filemtime($file) < $twoDaysAgo) {
            unlink($file);
            $count++;
        }
    }

    $this->info("Cleaned up {$count} sandbox files older than 2 days");
})->purpose('Clean up sandbox visualization files older than 2 days')->daily();
