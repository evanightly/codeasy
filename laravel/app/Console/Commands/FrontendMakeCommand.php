<?php

namespace App\Console\Commands;

use App\Helpers\FileHelper;
use Illuminate\Console\Command;
use Illuminate\Contracts\Filesystem\FileNotFoundException;
use Illuminate\Filesystem\Filesystem;
use Illuminate\Support\Str;

class FrontendMakeCommand extends Command {
    protected $signature = 'make:frontend {name}';
    protected $description = 'Generate frontend files for a model';

    public function __construct(protected Filesystem $files, protected FileHelper $fileHelper) {
        parent::__construct();
    }

    /**
     * @throws FileNotFoundException
     */
    public function handle(): void {
        $name = Str::studly($this->argument('name'));
        $this->createFrontendModel($name);
        $this->createFrontendResource($name);
        $this->createFrontendService($name);
        $this->appendFrontendModelToRoutes($name);
        $this->appendFrontendModelToIndex($name);
        $this->appendFrontendResourceToIndex($name);
        $this->info('Frontend files created successfully.');
    }

    /**
     * @throws FileNotFoundException
     */
    protected function createFrontendModel(string $name): void {
        $path = resource_path("js/Support/Interfaces/Models/{$name}.ts");
        $stub = $this->files->get(base_path('stubs/scaffold/frontend/model.stub'));
        $content = str_replace('{{ modelName }}', $name, $stub);
        $this->files->put($path, $content);
        $this->info("Frontend model interface created: {$path}");
    }

    /**
     * @throws FileNotFoundException
     */
    protected function createFrontendResource(string $name): void {
        $path = resource_path("js/Support/Interfaces/Resources/{$name}Resource.ts");
        $stub = $this->files->get(base_path('stubs/scaffold/frontend/resource.stub'));
        $content = str_replace('{{ modelName }}', $name, $stub);
        $this->files->put($path, $content);
        $this->info("Frontend resource created: {$path}");
    }

    /**
     * @throws FileNotFoundException
     */
    protected function createFrontendService(string $name): void {
        // Convert the service name to camelCase
        $serviceFileName = Str::camel($name) . 'ServiceHook';
        $path = resource_path("js/Services/{$serviceFileName}.ts");

        $stub = $this->files->get(base_path('stubs/scaffold/frontend/service.hook.stub'));
        $content = str_replace(
            ['{{ modelName }}', '{{ modelCamel }}', '{{ modelUpperSnake }}'],
            [$name, Str::camel($name), Str::upper(Str::snake($name))],
            $stub
        );
        $this->files->put($path, $content);
        $this->info("Frontend service created: {$path}");
    }

    /**
     * @throws FileNotFoundException
     */
    protected function appendFrontendModelToRoutes(string $name): void {
        $routesPath = resource_path('js/Support/Constants/routes.ts');
        $modelUpperSnake = Str::upper(Str::snake($name));
        $modelDashed = Str::kebab($name);
        $routesContent = $this->files->get($routesPath);
        $routePostfix = 'S';
        $routePostfixLower = Str::lower($routePostfix);

        if (!str_contains($routesContent, "{$modelUpperSnake}{$routePostfix}")) {
            $routesContent = str_replace('};', "\t{$modelUpperSnake}{$routePostfix}: '{$modelDashed}{$routePostfixLower}',\n};", $routesContent);
            $this->files->put($routesPath, $routesContent);
        } else {
            $this->warn("Route {$modelUpperSnake}{$routePostfix} already exists.");
        }
    }

    /**
     * @throws FileNotFoundException
     */
    protected function appendFrontendModelToIndex(string $name): void {
        $modelInterfacePath = resource_path('js/Support/Interfaces/Models/index.ts');
        $modelName = Str::studly($name);
        $modelInterfaceContent = $this->files->get($modelInterfacePath);

        if (!str_contains($modelInterfaceContent, "export * from './{$modelName}';")) {
            $modelInterfaceContent .= "\nexport * from './{$modelName}';";
            $this->files->put($modelInterfacePath, $modelInterfaceContent);
        } else {
            $this->warn("Model interface {$modelName} is already included.");
        }
    }

    /**
     * @throws FileNotFoundException
     */
    protected function appendFrontendResourceToIndex(string $name): void {
        $resourceInterfacePath = resource_path('js/Support/Interfaces/Resources/index.ts');
        $modelName = Str::studly($name);
        $resourceInterfaceContent = $this->files->get($resourceInterfacePath);

        if (!str_contains($resourceInterfaceContent, "export * from './{$modelName}Resource';")) {
            $resourceInterfaceContent .= "\nexport * from './{$modelName}Resource';";
            $this->files->put($resourceInterfacePath, $resourceInterfaceContent);
        } else {
            $this->warn("Resource interface {$modelName}Resource is already included.");
        }
    }
}
