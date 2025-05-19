<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder {
    public function run(): void {
        if (app()->isProduction()) {
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
