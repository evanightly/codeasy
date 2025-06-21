<?php

namespace App\Http\Controllers\Cypress;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

/**
 * Cypress Database Management Controller
 *
 * Provides simple, reliable database reset for E2E testing by importing SQL dump file.
 * Only available when CYPRESS_TESTING environment variable is true.
 * Only available when CYPRESS_TESTING environment variable is true.
 */
class CypressDatabaseController extends Controller {
    /**
     * Check if Cypress testing is enabled
     */
    private function checkCypressEnabled(): bool {
        return env('CYPRESS_TESTING', false) === true ||
               env('APP_ENV') === 'testing' ||
               request()->hasHeader('X-Cypress-Test');
    }

    /**
     * Check Cypress access before each method
     */
    private function validateCypressAccess(): ?JsonResponse {
        if (!$this->checkCypressEnabled()) {
            return response()->json([
                'success' => false,
                'error' => 'Cypress testing endpoints are disabled',
            ], 403);
        }

        return null;
    }

    /**
     * Reset database to clean state by importing SQL dump file
     *
     * This is the simple, reliable approach - imports pre-configured SQL dump.
     * Much faster than migrations and ensures exact same data state.
     */
    public function resetDatabase(Request $request): JsonResponse {
        if ($validation = $this->validateCypressAccess()) {
            return $validation;
        }

        try {
            Log::info('Cypress: Starting database reset with SQL import');

            $startTime = microtime(true);

            // Check if SQL dump file exists
            if (!Storage::disk('local')->exists('imports/codeasy.sql')) {
                throw new \Exception('SQL dump file not found at storage/app/imports/codeasy.sql');
            }

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
                throw new \Exception('Database drop/create failed: ' . implode("\n", $output));
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
                throw new \Exception('SQL import failed: ' . implode("\n", $output));
            }

            $duration = round((microtime(true) - $startTime) * 1000, 2);

            Log::info('Cypress: Database reset completed successfully', [
                'duration_ms' => $duration,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Database reset successfully with SQL import',
                'duration' => $duration,
                'output' => 'Database imported from codeasy.sql',
                'timestamp' => now()->toISOString(),
            ]);

        } catch (\Exception $e) {
            Log::error('Cypress: Database reset failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Database reset failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get database status for debugging
     */
    public function status(): JsonResponse {
        if ($validation = $this->validateCypressAccess()) {
            return $validation;
        }

        try {
            $tables = ['users', 'schools', 'courses', 'learning_materials', 'learning_material_questions'];
            $status = [];

            foreach ($tables as $table) {
                $status[$table] = DB::table($table)->count();
            }

            return response()->json([
                'success' => true,
                'table_counts' => $status,
                'timestamp' => now()->toISOString(),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to get database status: ' . $e->getMessage(),
            ], 500);
        }
    }
}
