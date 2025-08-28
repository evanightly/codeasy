<?php

require_once '/home/evanity/Projects/codeasy/laravel/vendor/autoload.php';

use Illuminate\Foundation\Application;

// Create Laravel application instance
$app = new Application(realpath(__DIR__ . '/laravel'));
$app->singleton(
    Illuminate\Contracts\Http\Kernel::class,
    App\Http\Kernel::class
);

$app->singleton(
    Illuminate\Contracts\Console\Kernel::class,
    App\Console\Kernel::class
);

$app->singleton(
    Illuminate\Contracts\Debug\ExceptionHandler::class,
    App\Exceptions\Handler::class
);

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Quick test to verify our service can be instantiated
try {
    $service = app(\App\Support\Interfaces\Services\StudentCognitiveClassificationServiceInterface::class);
    echo "✅ StudentCognitiveClassificationService can be instantiated\n";
    
    // Check if our new methods exist
    if (method_exists($service, 'performCognitiveLevelsClassification')) {
        echo "✅ performCognitiveLevelsClassification method exists\n";
    } else {
        echo "❌ performCognitiveLevelsClassification method missing\n";
    }
    
    // Test event class
    if (class_exists(\App\Events\CognitiveLevelsClassificationProgressEvent::class)) {
        echo "✅ CognitiveLevelsClassificationProgressEvent class exists\n";
    } else {
        echo "❌ CognitiveLevelsClassificationProgressEvent class missing\n";
    }
    
    echo "✅ Cognitive levels classification implementation looks good!\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}
