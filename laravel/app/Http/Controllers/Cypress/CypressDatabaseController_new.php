<?php

namespace App\Http\Controllers\Cypress;

use App\Http\Controllers\Controller;
use Database\Seeders\CypressSeeder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Cypress Database Management Controller
 *
 * Provides simple, reliable database reset for E2E testing using migrate:fresh and seeding.
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
     * Reset database to clean state using migrate:fresh and seed with test data
     *
     * This is the simple, reliable approach - no complex truncation or verification.
     * Just fresh migrations + Cypress seeder.
     */
    public function resetDatabase(Request $request): JsonResponse {
        if ($validation = $this->validateCypressAccess()) {
            return $validation;
        }

        try {
            Log::info('Cypress: Starting database reset with migrate:fresh');

            $startTime = microtime(true);

            // Run fresh migrations - this drops all tables and recreates them
            Artisan::call('migrate:fresh', ['--force' => true]);

            // Seed with Cypress test data
            Artisan::call('db:seed', [
                '--class' => CypressSeeder::class,
                '--force' => true,
            ]);

            $duration = round((microtime(true) - $startTime) * 1000, 2);

            Log::info('Cypress: Database reset completed successfully', [
                'duration_ms' => $duration,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Database reset successfully with migrate:fresh and Cypress seeder',
                'duration_ms' => $duration,
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
