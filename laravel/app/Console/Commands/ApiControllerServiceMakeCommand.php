<?php

namespace App\Console\Commands;

use App\Helpers\FileHelper;
use File;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class ApiControllerServiceMakeCommand extends Command {
    protected $signature = 'make:api-controller-service {name}';
    protected $description = 'Generate an API controller service for a model';

    public function __construct(protected FileHelper $fileHelper) {
        parent::__construct();
    }

    public function handle(): void {
        $modelName = Str::studly($this->argument('name'));
        $modelNameCamel = Str::camel($this->argument('name'));

        $controllerPath = app_path("Http/Controllers/Api/Api{$modelName}Controller.php");
        $controllerStubContents = file_get_contents(base_path('stubs/scaffold/backend/controller.api.stub'));
        $content = str_replace(
            ['{{ modelName }}', '{{ modelNameCamel }}'],
            [$modelName, $modelNameCamel],
            $controllerStubContents
        );

        $this->fileHelper->replaceFileWithContent($controllerPath, $content);
        $this->info("API Controller created: {$controllerPath}");
    }
}
