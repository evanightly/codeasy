<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder {
    public function run(): void {
        // Check if we should force development seeding even in production
        $forceDevSeeding = env('FORCE_DEV_SEEDING', false);

        // Use production seeding unless development seeding is forced
        if (app()->isProduction() && !$forceDevSeeding) {
            $this->call([
                PermissionSeeder::class,
                RoleSeeder::class,
                RolePermissionSeeder::class,
                UserSeeder::class,
                SchoolSeeder::class,
            ]);

            return;
        }

        // Development seeding
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
            // TestCourseSeeder::class,
            // StudentCourseCognitiveClassificationSeeder::class,
        ]);
    }
}
