<?php

namespace App\Console\Commands;

use Database\Seeders\CypressSeeder;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

class CypressResetDatabase extends Command {
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'cypress:reset-db {--verify : Verify database state after reset}';

    /**
     * The console command description.
     */
    protected $description = 'Reset database for Cypress E2E testing using migrate:fresh and CypressSeeder';

    /**
     * Execute the console command.
     */
    public function handle(): int {
        $this->info('🔄 Starting Cypress database reset...');

        $startTime = microtime(true);

        try {
            // Run fresh migrations
            $this->info('📦 Running migrate:fresh...');
            Artisan::call('migrate:fresh', ['--force' => true]);

            // Seed with Cypress test data
            $this->info('🌱 Seeding with CypressSeeder...');
            Artisan::call('db:seed', [
                '--class' => CypressSeeder::class,
                '--force' => true,
            ]);

            $duration = round((microtime(true) - $startTime) * 1000, 2);

            $this->info("✅ Database reset completed successfully in {$duration}ms");

            // Verify database state if requested
            if ($this->option('verify')) {
                $this->verifyDatabaseState();
            }

            return self::SUCCESS;

        } catch (\Exception $e) {
            $this->error('❌ Database reset failed: ' . $e->getMessage());

            return self::FAILURE;
        }
    }

    /**
     * Verify that the database has been properly seeded
     */
    private function verifyDatabaseState(): void {
        $this->info('🔍 Verifying database state...');

        $tables = [
            'users' => 'Users',
            'schools' => 'Schools',
            'courses' => 'Courses',
            'learning_materials' => 'Learning Materials',
            'learning_material_questions' => 'Learning Material Questions',
            'learning_material_question_test_cases' => 'Test Cases',
        ];

        $allGood = true;

        foreach ($tables as $table => $displayName) {
            $count = DB::table($table)->count();

            if ($count > 0) {
                $this->line("  ✅ {$displayName}: {$count} records");
            } else {
                $this->error("  ❌ {$displayName}: No records found!");
                $allGood = false;
            }
        }

        if ($allGood) {
            $this->info('🎉 All essential data is present!');
        } else {
            $this->error('⚠️  Some essential data is missing!');
        }
    }
}
