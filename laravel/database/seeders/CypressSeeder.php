<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

/**
 * Cypress Testing Seeder
 *
 * Provides minimal test data specifically for Cypress E2E tests.
 * This seeder ensures consistent test data without relying on external files.
 */
class CypressSeeder extends Seeder {
    /**
     * Run the database seeds for Cypress testing.
     */
    public function run(): void {
        // Force development seeding for Cypress tests (ignore Excel imports)
        putenv('FORCE_DEV_SEEDING=true');

        // Always run essential seeders required for the application to function
        $this->call([
            PermissionSeeder::class,
            RoleSeeder::class,
            RolePermissionSeeder::class,
            UserSeeder::class,
            SchoolSeeder::class,
            ClassRoomSeeder::class,
            CourseSeeder::class,
            LearningMaterialSeeder::class,
            LearningMaterialQuestionSeeder::class,
            LearningMaterialQuestionTestCaseSeeder::class,
        ]);

        // Restore environment variable
        putenv('FORCE_DEV_SEEDING');
    }
}
