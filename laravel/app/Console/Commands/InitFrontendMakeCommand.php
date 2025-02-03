<?php

namespace App\Console\Commands;

use App\Helpers\FileHelper;
use Illuminate\Console\Command;
use Illuminate\Contracts\Filesystem\FileNotFoundException;
use Illuminate\Filesystem\Filesystem;

class InitFrontendMakeCommand extends Command {
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'make:init-frontend';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Initialize frontend files for a model';

    public function __construct(protected Filesystem $files, protected FileHelper $fileHelper) {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @throws FileNotFoundException
     */
    public function handle(): void {
        $this->createServiceFactory();
        $this->createRoutesFile();
        $this->createModelInterface();
        $this->createResourceInterface();
        $this->info('Frontend files created successfully.');
    }

    /**
     * @throws FileNotFoundException
     */
    protected function createServiceFactory(): void {
        $serviceFactoryPath = resource_path('js/Services/serviceHooksFactory.ts');
        $serviceFactoryStubPath = base_path('stubs/scaffold/initializer/frontend/service.factory.stub');
        $this->fileHelper->replaceFileWithStubContent($serviceFactoryPath, $serviceFactoryStubPath);
        $this->info("Frontend service factory created: {$serviceFactoryPath}");
    }

    /**
     * @throws FileNotFoundException
     */
    protected function createRoutesFile(): void {
        $routesPath = resource_path('js/Support/Constants/routes.ts');
        $routesStubPath = base_path('stubs/scaffold/initializer/frontend/routes.stub');
        $this->fileHelper->replaceFileWithStubContent($routesPath, $routesStubPath);
        $this->info("Frontend routes file created: {$routesPath}");
    }

    /**
     * @throws FileNotFoundException
     */
    protected function createModelInterface(): void {
        $modelInterfacePath = resource_path('js/Support/Interfaces/Models/Model.ts');
        $modelInterfaceStubPath = base_path('stubs/scaffold/initializer/frontend/model.interface.stub');
        $this->fileHelper->replaceFileWithStubContent($modelInterfacePath, $modelInterfaceStubPath);
        $this->info("Frontend model interface Model created: {$modelInterfacePath}");
        $this->appendFrontendModelInterfaceToIndex();
    }

    /**
     * @throws FileNotFoundException
     */
    protected function appendFrontendModelInterfaceToIndex(): void {
        $modelInterfacePath = resource_path('js/Support/Interfaces/Models/index.ts');

        $fileAlreadyExist = $this->fileHelper->checkFileExistence($modelInterfacePath);

        if ($fileAlreadyExist) {
            return;
        }

        $this->files->put($modelInterfacePath, '');
        $modelInterfaceContent = $this->files->get($modelInterfacePath);
        if (!str_contains($modelInterfaceContent, "export * from './Model';")) {
            $modelInterfaceContent .= "\nexport * from './Model';";
            $this->files->put($modelInterfacePath, $modelInterfaceContent);
        } else {
            $this->warn('Model interface Model is already included.');
        }
    }

    /**
     * @throws FileNotFoundException
     */
    protected function createResourceInterface(): void {
        $resourceInterfacePath = resource_path('js/Support/Interfaces/Resources/Resource.ts');
        $resourceInterfaceStubPath = base_path('stubs/scaffold/initializer/frontend/resource.interface.stub');
        $this->fileHelper->replaceFileWithStubContent($resourceInterfacePath, $resourceInterfaceStubPath);
        $this->appendFrontendResourceInterfaceToIndex();
    }

    /**
     * @throws FileNotFoundException
     */
    protected function appendFrontendResourceInterfaceToIndex(): void {
        $resourceInterfacePath = resource_path('js/Support/Interfaces/Resources/index.ts');

        $fileAlreadyExist = $this->fileHelper->checkFileExistence($resourceInterfacePath);

        if ($fileAlreadyExist) {
            return;
        }

        $this->files->put($resourceInterfacePath, '');
        $resourceInterfaceContent = $this->files->get($resourceInterfacePath);
        if (!str_contains($resourceInterfaceContent, "export * from './Resource';")) {
            $resourceInterfaceContent .= "\nexport * from './Resource';";
            $this->files->put($resourceInterfacePath, $resourceInterfaceContent);
        } else {
            $this->warn('Resource interface Resource is already included.');
        }
    }
}
