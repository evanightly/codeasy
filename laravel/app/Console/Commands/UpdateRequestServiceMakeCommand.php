<?php

namespace App\Console\Commands;

use App\Helpers\FileHelper;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class UpdateRequestServiceMakeCommand extends Command {
    protected $signature = 'make:update-request-service {name}';
    protected $description = 'Generate an update request service for a model';

    public function __construct(protected FileHelper $fileHelper) {
        parent::__construct();
    }

    public function handle(): void {
        $modelName = Str::studly($this->argument('name'));

        $requestPath = app_path("Http/Requests/{$modelName}/Update{$modelName}Request.php");
        $stubPath = base_path('stubs/scaffold/backend/update.request.stub');

        $stub = file_get_contents($stubPath);
        $content = str_replace('{{ modelName }}', $modelName, $stub);

        $this->fileHelper->replaceFileWithContent($requestPath, $content);
        $this->info("Update Request created: {$requestPath}");
    }
}
