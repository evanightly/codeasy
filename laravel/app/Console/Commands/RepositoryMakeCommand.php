<?php

namespace App\Console\Commands;

use App\Helpers\FileHelper;
use Illuminate\Console\Command;
use Illuminate\Contracts\Filesystem\FileNotFoundException;
use Illuminate\Filesystem\Filesystem;
use Illuminate\Support\Str;

class RepositoryMakeCommand extends Command {
    protected $signature = 'make:repository {name}';
    protected $description = 'Generate a repository interface and implementation for a model';

    public function __construct(protected FileHelper $fileHelper) {
        parent::__construct();
    }

    /**
     */
    public function handle(): void {
        $name = Str::studly($this->argument('name'));
        $this->createRepositoryInterface($name);
        $this->createRepository($name);
        $this->info('Repository created successfully.');
    }

    /**
     */
    protected function createRepositoryInterface(string $name): void {
        $repositoryInterfacePath = app_path("Support/Interfaces/Repositories/{$name}RepositoryInterface.php");
        $repositoryInterfaceStubContents = file_get_contents(base_path('stubs/scaffold/backend/repository.interface.stub'));
        $content = str_replace('{{ modelName }}', $name, $repositoryInterfaceStubContents);
        $this->fileHelper->replaceFileWithContent($repositoryInterfacePath, $content);
        $this->info("Repository interface created: {$repositoryInterfacePath}");
    }

    /**
     */
    protected function createRepository(string $name): void {
        $repositoryPath = app_path("Repositories/{$name}Repository.php");
        $repositoryStubContents = file_get_contents(base_path('stubs/scaffold/backend/repository.stub'));
        $content = str_replace('{{ modelName }}', $name, $repositoryStubContents);
        $this->fileHelper->replaceFileWithContent($repositoryPath, $content);
        $this->info("Repository class created: {$repositoryPath}");
    }
}
