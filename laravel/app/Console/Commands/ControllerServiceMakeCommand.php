<?php

namespace App\Console\Commands;

use App\Helpers\FileHelper;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class ControllerServiceMakeCommand extends Command {
    protected $signature = 'make:controller-service {name}';
    protected $description = 'Generate controller and service files for a model';

    public function __construct(protected FileHelper $fileHelper) {
        parent::__construct();
    }

    public function handle(): void {
        $name = Str::studly($this->argument('name'));
        $this->createController($name);
        $this->info('Controller and service files created successfully.');
    }

    protected function createController(string $name): void {
        $controllerPath = app_path("Http/Controllers/{$name}Controller.php");
        $controllerStubContents = file_get_contents(base_path('stubs/scaffold/backend/controller.stub'));
        $content = str_replace(
            ['{{ modelName }}', '{{ modelNameCamel }}', '{{ modelNameUpper }}'],
            [$name, Str::camel($name), Str::upper($name)],
            $controllerStubContents
        );
        $this->fileHelper->replaceFileWithContent($controllerPath, $content);
        $this->info("Controller created: {$controllerPath}");
    }
}
