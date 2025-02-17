<?php

namespace App\Console\Commands;

use App\Helpers\FileHelper;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class StoreRequestServiceMakeCommand extends Command {
    protected $signature = 'make:store-request-service {name}';
    protected $description = 'Generate a store request service for a model';

    public function __construct(protected FileHelper $fileHelper) {
        parent::__construct();
    }

    public function handle(): void {
        $modelName = Str::studly($this->argument('name'));

        $requestPath = app_path("Http/Requests/{$modelName}/Store{$modelName}Request.php");
        $stubPath = base_path('stubs/scaffold/backend/store.request.stub');

        $stub = file_get_contents($stubPath);
        $content = str_replace('{{ modelName }}', $modelName, $stub);

        $this->fileHelper->replaceFileWithContent($requestPath, $content);
        $this->info("Store Request created: {$requestPath}");
    }
}
