<?php

namespace App\Console\Commands;

use App\Helpers\FileHelper;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class ResourceServiceMakeCommand extends Command {
    protected $signature = 'make:resource-service {name}';
    protected $description = 'Generate a resource service for a model';

    public function __construct(protected FileHelper $fileHelper) {
        parent::__construct();
    }

    public function handle(): void {
        $modelName = Str::studly($this->argument('name'));

        $resourcePath = app_path("Http/Resources/{$modelName}Resource.php");
        $stubPath = base_path('stubs/scaffold/backend/resource.stub');
        $stub = file_get_contents($stubPath);
        $content = str_replace('{{ modelName }}', $modelName, $stub);

        $this->fileHelper->replaceFileWithContent($resourcePath, $content);
        $this->info("Resource created: {$resourcePath}");
    }
}
