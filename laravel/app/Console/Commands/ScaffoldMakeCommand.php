<?php

namespace App\Console\Commands;

use App\Helpers\FileHelper;
use Illuminate\Console\Command;
use Illuminate\Contracts\Console\PromptsForMissingInput;
use Illuminate\Support\Str;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputOption;

class ScaffoldMakeCommand extends Command implements PromptsForMissingInput {
    protected $name = 'make:scaffold';
    protected $description = 'Scaffold model, repository, service, controller, api, resource, request files for a model with optional seeder, factory, and Frontend structure generation.';

    public function __construct(protected FileHelper $fileHelper) {
        parent::__construct();
    }

    /**
     * Execute the console command.
     */
    public function handle(): void {

        if (!$this->fileHelper->checkFileExistence(resource_path('js/Support/Constants/routes.ts'))) {
            $this->warn('Routes.ts is not detected, performing first scaffold initialization.');
            $this->call('scaffold:init');
        }

        if ($this->option('all')) {
            $this->input->setOption('factory', true);
            $this->input->setOption('migration', true);
            $this->input->setOption('seed', true);
            $this->input->setOption('controller', true);
            $this->input->setOption('service-repository', true);
            $this->input->setOption('frontend', true);
            $this->input->setOption('resource', true);
            $this->input->setOption('requests', true);
        }

        if ($this->option('all-with-api')) {
            $this->input->setOption('factory', true);
            $this->input->setOption('migration', true);
            $this->input->setOption('seed', true);
            $this->input->setOption('controller', true);
            $this->input->setOption('api-controller', true);
            $this->input->setOption('service-repository', true);
            $this->input->setOption('frontend', true);
            $this->input->setOption('resource', true);
            $this->input->setOption('requests', true);
        }

        $this->createModel();

        if ($this->option('factory')) {
            $this->createFactory();
        }

        if ($this->option('migration')) {
            $this->createMigration();
        }

        if ($this->option('seed')) {
            $this->createSeeder();
        }

        if ($this->option('controller')) {
            $this->createController();
        }

        if ($this->option('api-controller')) {
            $this->createApiController();
        }

        if ($this->option('service-repository')) {
            $this->createServices();
            $this->createRepository();
        }

        if ($this->option('frontend')) {
            $this->createFrontend();
        }

        if ($this->option('resource')) {
            $this->createResource();
        }

        if ($this->option('requests')) {
            $this->createFormRequests();
        }

        //
        //        if ($this->option('test')) {
        //            $this->createTest();
        //        }
        //
        //        if ($this->option('pest')) {
        //            $this->createPest();
        //        }
        //
        //        if ($this->option('exclude')) {
        //            $this->excludeFiles();
        //        }

        $this->info('Scaffold created successfully.');
    }

    /**
     * Create a model for the model.
     */
    protected function createModel(): void {
        $model = Str::studly(class_basename($this->argument('name')));

        $this->call('make:model', [
            'name' => $model,
            '--migration' => false,
            '--factory' => false,
        ]);
    }

    protected function createFactory(): void {
        $factory = Str::studly($this->argument('name'));

        $this->call('make:factory', [
            'name' => "{$factory}Factory",
            '--model' => $this->argument('name'),
        ]);
    }

    /**
     * Create a migration file for the model.
     */
    protected function createMigration(): void {
        $table = Str::snake(Str::pluralStudly(class_basename($this->argument('name'))));

        if ($this->option('pivot')) {
            $table = Str::singular($table);
        }

        $this->call('make:migration', [
            'name' => "create_{$table}_table",
            '--create' => $table,
        ]);
    }

    /**
     * Create a seeder file for the model.
     */
    protected function createSeeder(): void {
        $seeder = Str::studly(class_basename($this->argument('name')));

        $this->call('make:seeder', [
            'name' => "{$seeder}Seeder",
        ]);
    }

    /**
     * Create a controller for the model.
     */
    protected function createController(): void {
        $modelName = $this->argument('name');

        $this->call('make:controller-service', [
            'name' => $modelName,
        ]);
    }

    protected function createApiController(): void {
        $modelName = $this->argument('name');

        $this->call('make:api-controller-service', [
            'name' => $modelName,
        ]);
    }

    protected function createServices(): void {
        $this->call('make:service', [
            'name' => $this->argument('name'),
        ]);
    }

    protected function createRepository(): void {
        $this->call('make:repository', [
            'name' => $this->argument('name'),
        ]);
    }

    protected function createFrontend(): void {
        $this->call('make:frontend', [
            'name' => $this->argument('name'),
        ]);
    }

    protected function createResource(): void {
        $this->call('make:resource-service', [
            'name' => $this->argument('name'),
        ]);
    }

    /**
     * Create the form requests for the model.
     */
    protected function createFormRequests(): void {
        $this->call('make:store-request-service', [
            'name' => $this->argument('name'),
        ]);

        $this->call('make:update-request-service', [
            'name' => $this->argument('name'),
        ]);
    }

    protected function resolveStubPath($stub): string {
        return file_exists($customPath = $this->laravel->basePath(trim($stub, '/')))
            ? $customPath
            : __DIR__ . $stub;
    }

    protected function getArguments(): array {
        return [
            ['name', InputArgument::REQUIRED, 'The name of the model.'],
        ];
    }

    protected function getOptions(): array {
        return [
            ['all', 'a', InputOption::VALUE_NONE, 'Generate all possible files for the model.'],
            ['all-with-api', 'aa', InputOption::VALUE_NONE, 'Generate all possible files for the model with API controller.'],
            ['migration', 'm', InputOption::VALUE_NONE, 'Create a new migration file for the model.'],
            ['seed', 's', InputOption::VALUE_NONE, 'Create a new seeder file for the model.'],
            ['factory', 'f', InputOption::VALUE_NONE, 'Create a new factory file for the model.'],
            ['controller', 'c', InputOption::VALUE_NONE, 'Create a new controller file for the model.'],
            ['api-controller', 'ac', InputOption::VALUE_NONE, 'Create a new API controller file for the model.'],
            ['test', 't', InputOption::VALUE_NONE, 'Create a new test file for the model.'],
            ['pivot', 'p', InputOption::VALUE_NONE, 'Indicates if the generated model is a pivot model.'],
            ['service-repository', 'sr', InputOption::VALUE_NONE, 'Create service and repository and its interface files for the model.'],
            ['frontend', 'fe', InputOption::VALUE_NONE, 'Generate frontend structure for the model.'],
            ['exclude', 'e', InputOption::VALUE_NONE, 'Exclude the specified files from being generated.'],
            ['resource', 'rs', InputOption::VALUE_NONE, 'Indicates if the generated controller should be a resource controller.'],
            ['api', 'api', InputOption::VALUE_NONE, 'Indicates if the generated controller should be an API controller.'],
            ['requests', 'req', InputOption::VALUE_NONE, 'Create form request files for the model.'],
            ['pest', 'pest', InputOption::VALUE_NONE, 'Create a new Pest test file for the model.'],
        ];
    }

    protected function promptForMissingArgumentsUsing(): array {
        return [
            'name' => 'Enter the name of the model',
        ];
    }
}
