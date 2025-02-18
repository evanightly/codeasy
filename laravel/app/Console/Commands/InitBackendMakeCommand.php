<?php

namespace App\Console\Commands;

use App\Helpers\FileHelper;
use Illuminate\Console\Command;
use Illuminate\Contracts\Filesystem\FileNotFoundException;
use Illuminate\Filesystem\Filesystem;

class InitBackendMakeCommand extends Command {
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'make:init-backend';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Initialize backend files for a model';

    public function __construct(protected Filesystem $files, protected FileHelper $fileHelper) {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @throws FileNotFoundException
     */
    public function handle(): void {
        $this->createRepositoryServiceProvider();
        $this->createJsonResourceTraits();
        $this->createBaseRepository();
        $this->createRepositoryTraits();
        $this->createServiceTraits();
        $this->createConfigFiles();
        $this->info('Backend initialized created successfully.');
    }

    /**
     * @throws FileNotFoundException
     */
    protected function createRepositoryServiceProvider(): void {
        $repositoryServiceProviderPath = app_path('Providers/RepositoryServiceProvider.php');
        $repositoryServiceProviderStubPath = base_path('stubs/scaffold/initializer/backend/repository.service.provider.stub');

        $this->fileHelper->replaceFileWithStubContent($repositoryServiceProviderPath, $repositoryServiceProviderStubPath);
        $this->info('RepositoryServiceProvider created: ' . $repositoryServiceProviderPath);
    }

    /**
     * @throws FileNotFoundException
     */
    protected function createJsonResourceTraits(): void {
        $jsonResourceTraitPathDir = app_path('Traits/Resources/JsonResource');
        $handlesResourceDataSelectionPath = "$jsonResourceTraitPathDir/HandlesResourceDataSelection.php";
        $handlesResourceDataSelectionStubPath = base_path('stubs/scaffold/initializer/backend/traits/json_resource/handles.resource.data.selection.stub');
        $this->fileHelper->replaceFileWithStubContent($handlesResourceDataSelectionPath, $handlesResourceDataSelectionStubPath);
        $this->info('HandlesResourceDataSelection created: ' . $handlesResourceDataSelectionPath);
    }

    /**
     * @throws FileNotFoundException
     */
    protected function createBaseRepository(): void {
        $baseRepositoryInterfacePath = app_path('Support/Interfaces/Repositories/BaseRepositoryInterface.php');
        $baseRepositoryInterfaceStubPath = base_path('stubs/scaffold/initializer/backend/base.repository.interface.stub');
        $this->fileHelper->replaceFileWithStubContent($baseRepositoryInterfacePath, $baseRepositoryInterfaceStubPath);
        $this->info('BaseRepositoryInterface created: ' . $baseRepositoryInterfacePath);

        $baseRepositoryPath = app_path('Repositories/BaseRepository.php');
        $baseRepositoryStubPath = base_path('stubs/scaffold/initializer/backend/base.repository.stub');
        $this->fileHelper->replaceFileWithStubContent($baseRepositoryPath, $baseRepositoryStubPath);
        $this->info('BaseRepository created: ' . $baseRepositoryPath);
    }

    /**
     * @throws FileNotFoundException
     */
    protected function createRepositoryTraits(): void {
        $repositoryTraitPath = app_path('Traits/Repositories');

        $handlesFilteringPath = "$repositoryTraitPath/HandlesFiltering.php";
        $handlesFilteringStubPath = base_path('stubs/scaffold/initializer/backend/traits/repositories/handles.filtering.stub');
        $this->fileHelper->replaceFileWithStubContent($handlesFilteringPath, $handlesFilteringStubPath);

        $handlesSortingPath = "$repositoryTraitPath/HandlesSorting.php";
        $handlesSortingStubPath = base_path('stubs/scaffold/initializer/backend/traits/repositories/handles.sorting.stub');
        $this->fileHelper->replaceFileWithStubContent($handlesSortingPath, $handlesSortingStubPath);

        $handlesRelationsPath = "$repositoryTraitPath/HandlesRelations.php";
        $handlesRelationsStubPath = base_path('stubs/scaffold/initializer/backend/traits/repositories/handles.relations.stub');
        $this->fileHelper->replaceFileWithStubContent($handlesRelationsPath, $handlesRelationsStubPath);

        $relationQueryablePath = "$repositoryTraitPath/RelationQueryable.php";
        $relationQueryableStubPath = base_path('stubs/scaffold/initializer/backend/traits/repositories/relation.queryable.stub');
        $this->fileHelper->replaceFileWithStubContent($relationQueryablePath, $relationQueryableStubPath);
    }

    /**
     * @throws FileNotFoundException
     */
    protected function createServiceTraits(): void {
        $serviceTraitPath = app_path('Traits/Services');

        $handlesPageSizeAllPath = "$serviceTraitPath/HandlesPageSizeAll.php";
        $handlesPageSizeAllStubPath = base_path('stubs/scaffold/initializer/backend/traits/services/handles.page.size.all.stub');
        $this->fileHelper->replaceFileWithStubContent($handlesPageSizeAllPath, $handlesPageSizeAllStubPath);
    }

    /**
     * @throws FileNotFoundException
     */
    protected function createConfigFiles(): void {
        $constantsPath = config_path('constants.php');
        $constantsStubPath = base_path('stubs/scaffold/initializer/backend/config/constants.stub');
        $this->fileHelper->replaceFileWithStubContent($constantsPath, $constantsStubPath);
    }
}
