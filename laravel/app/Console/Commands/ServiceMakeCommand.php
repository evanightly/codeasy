<?php

namespace App\Console\Commands;

use App\Helpers\FileHelper;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class ServiceMakeCommand extends Command {
    protected $signature = 'make:service {name}';
    protected $description = 'Generate a service interface and implementation for a model';

    public function __construct(protected FileHelper $fileHelper) {
        parent::__construct();
    }

    public function handle(): void {
        $name = Str::studly($this->argument('name'));
        $this->createServiceInterface($name);
        $this->createService($name);
        $this->info('Service created successfully.');
    }

    protected function createServiceInterface(string $name): void {
        $serviceInterfacePath = app_path("Support/Interfaces/Services/{$name}ServiceInterface.php");
        $serviceInterfaceStubContents = file_get_contents(base_path('stubs/scaffold/backend/service.interface.stub'));
        $content = str_replace('{{ modelName }}', $name, $serviceInterfaceStubContents);
        $this->fileHelper->replaceFileWithContent($serviceInterfacePath, $content);
        $this->info("Service interface created: {$serviceInterfacePath}");
    }

    protected function createService(string $name): void {
        $servicePath = app_path("Services/{$name}Service.php");
        $serviceStubContents = file_get_contents(base_path('stubs/scaffold/backend/service.stub'));
        $content = str_replace('{{ modelName }}', $name, $serviceStubContents);
        $this->fileHelper->replaceFileWithContent($servicePath, $content);
        $this->info("Service class created: {$servicePath}");
    }
}
