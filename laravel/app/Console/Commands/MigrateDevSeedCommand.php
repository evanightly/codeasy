<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Artisan;

class MigrateDevSeedCommand extends Command {
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'migrate:dev-seed 
                            {--fresh : Drop all tables and re-run all migrations}
                            {--seed : Run the database seeders}
                            {--force : Force the operation to run when in production}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Run migrations with development seeding (overrides production environment)';

    /**
     * Execute the console command.
     */
    public function handle(): int {
        if (App::isProduction() && !$this->option('force')) {
            $this->error('This command is running in production environment.');
            $this->info('Use --force flag to override production safety check.');
            $this->warn('Example: php artisan migrate:dev-seed --force');

            return self::FAILURE;
        }

        // Confirm action if in production with force flag
        if (App::isProduction() && $this->option('force')) {
            $this->warn('You are about to run development seeding in PRODUCTION environment!');

            if (!$this->confirm('This will potentially overwrite production data. Are you sure you want to continue?')) {
                $this->info('Operation cancelled.');

                return self::FAILURE;
            }
        }

        // Set environment flag to force development seeding
        $originalForceDevSeedingValue = env('FORCE_DEV_SEEDING');
        putenv('FORCE_DEV_SEEDING=true');

        try {
            $this->info('Setting FORCE_DEV_SEEDING=true to enable development seeding...');

            // Run migrations
            if ($this->option('fresh')) {
                $this->info('Dropping all tables and re-running migrations...');
                $exitCode = Artisan::call('migrate:fresh', [
                    '--force' => true,
                ]);

                if ($exitCode !== 0) {
                    $this->error('Migration failed!');

                    return self::FAILURE;
                }

                $this->info('Migrations completed successfully.');
            } else {
                $this->info('Running migrations...');
                $exitCode = Artisan::call('migrate', [
                    '--force' => true,
                ]);

                if ($exitCode !== 0) {
                    $this->error('Migration failed!');

                    return self::FAILURE;
                }

                $this->info('Migrations completed successfully.');
            }

            // Run development seeding
            if ($this->option('seed') || $this->option('fresh')) {
                $this->info('Running development seeders...');
                $this->info('FORCE_DEV_SEEDING environment variable is set, seeders will use development data');

                $exitCode = Artisan::call('db:seed', [
                    '--force' => true,
                ]);

                if ($exitCode !== 0) {
                    $this->error('Seeding failed!');

                    return self::FAILURE;
                }

                $this->info('Development seeding completed successfully.');
            }

        } finally {
            // Restore original environment variable
            if ($originalForceDevSeedingValue !== false) {
                putenv("FORCE_DEV_SEEDING={$originalForceDevSeedingValue}");
            } else {
                putenv('FORCE_DEV_SEEDING');
            }
            $this->info('Environment variable FORCE_DEV_SEEDING restored.');
        }

        $this->info('✅ migrate:dev-seed command completed successfully!');

        // Show summary
        $this->newLine();
        $this->info('Summary:');
        $this->line('- Migrations: ✅ Complete');
        if ($this->option('seed') || $this->option('fresh')) {
            $this->line('- Development Seeding: ✅ Complete');
        }
        $this->line('- Environment: ' . App::environment());

        return self::SUCCESS;
    }
}
