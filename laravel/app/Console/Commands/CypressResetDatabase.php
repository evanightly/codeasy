<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class CypressResetDatabase extends Command {
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'cypress:reset-db {--verify : Verify database state after reset}';

    /**
     * The console command description.
     */
    protected $description = 'Reset database for Cypress E2E testing by importing SQL dump file';

    /**
     * Execute the console command.
     */
    public function handle(): int {
        $this->info('🔄 Starting Cypress database reset...');

        $startTime = microtime(true);

        try {
            // Check if SQL dump file exists
            if (!Storage::disk('local')->exists('imports/codeasy.sql')) {
                $this->error('❌ SQL dump file not found at storage/app/imports/codeasy.sql');

                return self::FAILURE;
            }

            $this->info('📦 Dropping all tables and importing SQL dump...');

            // Get the full path to the SQL file
            $sqlFilePath = Storage::disk('local')->path('imports/codeasy.sql');

            // Get database configuration
            $database = config('database.default');
            $config = config("database.connections.{$database}");

            // First, drop and recreate the database to ensure clean state
            $dropCommand = sprintf(
                'mariadb -h %s -P %s -u %s -p%s --ssl=false -e "DROP DATABASE IF EXISTS %s; CREATE DATABASE %s;"',
                $config['host'],
                $config['port'],
                $config['username'],
                $config['password'],
                $config['database'],
                $config['database']
            );

            $output = [];
            $returnCode = null;
            exec($dropCommand . ' 2>&1', $output, $returnCode);

            if ($returnCode !== 0) {
                $this->error('❌ Database drop/create failed:');
                $this->error(implode("\n", $output));

                return self::FAILURE;
            }

            // Then import the SQL dump with foreign key checks disabled
            $importCommand = sprintf(
                'mariadb -h %s -P %s -u %s -p%s --ssl=false %s -e "SET FOREIGN_KEY_CHECKS=0; SOURCE %s; SET FOREIGN_KEY_CHECKS=1;"',
                $config['host'],
                $config['port'],
                $config['username'],
                $config['password'],
                $config['database'],
                $sqlFilePath
            );

            // Execute the import command
            $output = [];
            $returnCode = null;
            exec($importCommand . ' 2>&1', $output, $returnCode);

            if ($returnCode !== 0) {
                $this->error('❌ SQL import failed:');
                $this->error(implode("\n", $output));

                return self::FAILURE;
            }

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
