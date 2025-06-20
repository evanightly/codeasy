<?php

namespace App\Providers;

use App\Repositories\ExecutionResultRepository;
use App\Repositories\StudentScoreRepository;
use App\Services\Course\CourseImportService;
use App\Services\DashboardService;
use App\Services\ExecutionResultService;
use App\Services\StudentScoreService;
use App\Services\User\StudentImportService;
use App\Support\Interfaces\Repositories\ExecutionResultRepositoryInterface;
use App\Support\Interfaces\Repositories\StudentScoreRepositoryInterface;
use App\Support\Interfaces\Services\Course\CourseImportServiceInterface;
use App\Support\Interfaces\Services\DashboardServiceInterface;
use App\Support\Interfaces\Services\ExecutionResultServiceInterface;
use App\Support\Interfaces\Services\StudentScoreServiceInterface;
use App\Support\Interfaces\Services\User\StudentImportServiceInterface;
use FilesystemIterator;
use Illuminate\Support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider {
    /**
     * Register services.
     */
    public function register(): void {
        $baseDir = realpath(__DIR__ . '/../../'); // Adjust to get the project root directory
        $modelDir = $baseDir . '/app/Models';
        $modelFiles = new FilesystemIterator($modelDir, FilesystemIterator::SKIP_DOTS);

        foreach ($modelFiles as $modelFile) {
            if ($modelFile->isFile()) {
                $modelName = pathinfo($modelFile->getFilename(), PATHINFO_FILENAME);

                $serviceInterface = "App\\Support\\Interfaces\\Services\\{$modelName}ServiceInterface";
                $service = "App\\Services\\{$modelName}Service";
                $repositoryInterface = "App\\Support\\Interfaces\\Repositories\\{$modelName}RepositoryInterface";
                $repository = "App\\Repositories\\{$modelName}Repository";

                if (class_exists($service) && interface_exists($serviceInterface)) {
                    $this->app->singleton($serviceInterface, $service);
                }

                if (class_exists($repository) && interface_exists($repositoryInterface)) {
                    $this->app->singleton($repositoryInterface, $repository);
                }
            }
        }

        // Example of manual custom binding a service
        // $this->app->bind(BrowserServiceInterface::class, BrowserService::class);

        // Student Score Repository & Service
        $this->app->bind(StudentScoreRepositoryInterface::class, StudentScoreRepository::class);
        $this->app->bind(StudentScoreServiceInterface::class, StudentScoreService::class);

        // Execution Result Repository & Service
        $this->app->bind(ExecutionResultRepositoryInterface::class, ExecutionResultRepository::class);
        $this->app->bind(ExecutionResultServiceInterface::class, ExecutionResultService::class);

        $this->app->bind(CourseImportServiceInterface::class, CourseImportService::class);

        $this->app->bind(StudentImportServiceInterface::class, StudentImportService::class);

        $this->app->bind(DashboardServiceInterface::class, DashboardService::class);
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void {
        //
    }
}
