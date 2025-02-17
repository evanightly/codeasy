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
        $this->createGenericBreadcrumbItemInterface();
        $this->createPaginateMetaInterface();
        $this->createPaginateMetaLinkInterface();
        $this->createPaginateResponseInterface();
        $this->createServiceFilterOptionsInterface();
        $this->createServiceHooksFactoryInterface();
        $this->createVitePlugins();
        $this->createFrontendHelpers();
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

    /**
     * @throws FileNotFoundException
     */
    protected function createGenericBreadcrumbItemInterface(): void {
        $genericBreadcrumbItemInterfacePath = resource_path('js/Support/Interfaces/Others/GenericBreadcrumbItem.ts');
        $genericBreadcrumbItemInterfaceStubPath = base_path('stubs/scaffold/initializer/frontend/others/generic.breadcrumb.item.interface.stub');
        $this->fileHelper->replaceFileWithStubContent($genericBreadcrumbItemInterfacePath, $genericBreadcrumbItemInterfaceStubPath);
    }

    /**
     * @throws FileNotFoundException
     */
    protected function createPaginateMetaInterface(): void {
        $paginateMetaInterfacePath = resource_path('js/Support/Interfaces/Others/PaginateMeta.ts');
        $paginateMetaInterfaceStubPath = base_path('stubs/scaffold/initializer/frontend/others/paginate.meta.interface.stub');
        $this->fileHelper->replaceFileWithStubContent($paginateMetaInterfacePath, $paginateMetaInterfaceStubPath);
    }

    /**
     * @throws FileNotFoundException
     */
    public function createPaginateMetaLinkInterface(): void {
        $paginateMetaLinkInterfacePath = resource_path('js/Support/Interfaces/Others/PaginateMetaLink.ts');
        $paginateMetaLinkInterfaceStubPath = base_path('stubs/scaffold/initializer/frontend/others/paginate.meta.link.interface.stub');
        $this->fileHelper->replaceFileWithStubContent($paginateMetaLinkInterfacePath, $paginateMetaLinkInterfaceStubPath);
    }

    /**
     * @throws FileNotFoundException
     */
    public function createPaginateResponseInterface(): void {
        $paginateResponseInterfacePath = resource_path('js/Support/Interfaces/Others/PaginateResponse.ts');
        $paginateResponseInterfaceStubPath = base_path('stubs/scaffold/initializer/frontend/others/paginate.response.interface.stub');
        $this->fileHelper->replaceFileWithStubContent($paginateResponseInterfacePath, $paginateResponseInterfaceStubPath);
    }

    /**
     * @throws FileNotFoundException
     */
    public function createServiceFilterOptionsInterface(): void {
        $serviceFilterOptionsInterfacePath = resource_path('js/Support/Interfaces/Others/ServiceFilterOptions.ts');
        $serviceFilterOptionsInterfaceStubPath = base_path('stubs/scaffold/initializer/frontend/others/service.filter.options.interface.stub');
        $this->fileHelper->replaceFileWithStubContent($serviceFilterOptionsInterfacePath, $serviceFilterOptionsInterfaceStubPath);
    }

    /**
     * @throws FileNotFoundException
     */
    public function createServiceHooksFactoryInterface(): void {
        $serviceHooksFactoryInterfacePath = resource_path('js/Support/Interfaces/Others/ServiceHooksFactory.ts');
        $serviceHooksFactoryInterfaceStubPath = base_path('stubs/scaffold/initializer/frontend/others/service.hooks.factory.interface.stub');
        $this->fileHelper->replaceFileWithStubContent($serviceHooksFactoryInterfacePath, $serviceHooksFactoryInterfaceStubPath);
    }

    /**
     * @throws FileNotFoundException
     */
    protected function createVitePlugins(): void {
        $libColorsPath = base_path('vite_plugins/lib/colors.js');
        $libColorsStubPath = base_path('stubs/scaffold/initializer/frontend/vite_plugins/lib/colors.stub');
        $this->fileHelper->replaceFileWithStubContent($libColorsPath, $libColorsStubPath);
        $this->info("Vite plugin lib colors created: {$libColorsPath}");

        $libGeneratePrefixTextPath = base_path('vite_plugins/lib/generatePrefixText.js');
        $libGeneratePrefixTextStubPath = base_path('stubs/scaffold/initializer/frontend/vite_plugins/lib/generate.prefix.text.stub');
        $this->fileHelper->replaceFileWithStubContent($libGeneratePrefixTextPath, $libGeneratePrefixTextStubPath);
        $this->info("Vite plugin lib generatePrefixText created: {$libGeneratePrefixTextPath}");

        $libGetCurrentTimestampPath = base_path('vite_plugins/lib/getCurrentTimestamp.js');
        $libGetCurrentTimestampStubPath = base_path('stubs/scaffold/initializer/frontend/vite_plugins/lib/get.current.timestamp.stub');
        $this->fileHelper->replaceFileWithStubContent($libGetCurrentTimestampPath, $libGetCurrentTimestampStubPath);
        $this->info("Vite plugin lib getCurrentTimestamp created: {$libGetCurrentTimestampPath}");

        $checkRoutesOverridePluginPath = base_path('vite_plugins/checkRoutesOverridePlugin.js');
        $checkRoutesOverridePluginStubPath = base_path('stubs/scaffold/initializer/frontend/vite_plugins/check.routes.override.plugin.stub');
        $this->fileHelper->replaceFileWithStubContent($checkRoutesOverridePluginPath, $checkRoutesOverridePluginStubPath);
        $this->info("Vite plugin checkRoutesOverridePlugin created: {$checkRoutesOverridePluginPath}");

        $transformIntentEnumPluginPath = base_path('vite_plugins/transformIntentEnumPlugin.js');
        $transformIntentEnumPluginStubPath = base_path('stubs/scaffold/initializer/frontend/vite_plugins/transform.intent.enum.plugin.stub');
        $this->fileHelper->replaceFileWithStubContent($transformIntentEnumPluginPath, $transformIntentEnumPluginStubPath);
        $this->info("Vite plugin transformIntentEnumPlugin created: {$transformIntentEnumPluginPath}");

        $otherDirectoryIndexPath = resource_path('js/Support/Interfaces/Others/index.ts');
        $otherDirectoryIndexStubPath = base_path('stubs/scaffold/initializer/frontend/others/index.stub');
        $this->fileHelper->replaceFileWithStubContent($otherDirectoryIndexPath, $otherDirectoryIndexStubPath);
    }

    /**
     * @throws FileNotFoundException
     */
    protected function createFrontendHelpers(): void {
        $addRippleEffectPath = resource_path('js/Helpers/addRippleEffect.ts');
        $addRippleEffectStubPath = base_path('stubs/scaffold/initializer/frontend/helpers/add.ripple.effect.stub');
        $this->fileHelper->replaceFileWithStubContent($addRippleEffectPath, $addRippleEffectStubPath);
        $this->info("Frontend helper addRippleEffect created: {$addRippleEffectPath}");

        $generateDynamicBreadcrumbsPath = resource_path('js/Helpers/generateDynamicBreadcrumbs.ts');
        $generateDynamicBreadcrumbsStubPath = base_path('stubs/scaffold/initializer/frontend/helpers/generate.dynamic.breadcrumbs.stub');
        $this->fileHelper->replaceFileWithStubContent($generateDynamicBreadcrumbsPath, $generateDynamicBreadcrumbsStubPath);
        $this->info("Frontend helper generateDynamicBreadcrumbs created: {$generateDynamicBreadcrumbsPath}");

        $generateServiceHooksFactoryQueryKeyPath = resource_path('js/Helpers/generateServiceHooksFactoryQueryKey.ts');
        $generateServiceHooksFactoryQueryKeyStubPath = base_path('stubs/scaffold/initializer/frontend/helpers/generate.service.hooks.factory.query.key.stub');
        $this->fileHelper->replaceFileWithStubContent($generateServiceHooksFactoryQueryKeyPath, $generateServiceHooksFactoryQueryKeyStubPath);
        $this->info("Frontend helper generateServiceHooksFactoryQueryKey created: {$generateServiceHooksFactoryQueryKeyPath}");

        $tanstackQueryHelpersPath = resource_path('js/Helpers/tanstackQueryHelpers.ts');
        $tanstackQueryHelpersStubPath = base_path('stubs/scaffold/initializer/frontend/helpers/tanstack.query.helpers.stub');
        $this->fileHelper->replaceFileWithStubContent($tanstackQueryHelpersPath, $tanstackQueryHelpersStubPath);
        $this->info("Frontend helper tanstackQueryHelpers created: {$tanstackQueryHelpersPath}");

        $indexPath = resource_path('js/Helpers/index.ts');
        $indexStubPath = base_path('stubs/scaffold/initializer/frontend/helpers/index.stub');
        $this->fileHelper->replaceFileWithStubContent($indexPath, $indexStubPath);
        $this->info("Frontend helper index created: {$indexPath}");
    }
}
