<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\StudentCognitiveClassification;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Log;

class StudentCognitiveClassificationSeeder extends Seeder {
    /**
     * Run the database seeds.
     */
    public function run(): void {
        // Check if we should force development seeding even in production
        $forceDevSeeding = env('FORCE_DEV_SEEDING', false);

        // Skip seeding if in production and not forced to use development data
        if (app()->isProduction() && !$forceDevSeeding) {
            return;
        }

        $this->info('Seeding student cognitive classifications with static data...');

        // Get the first course
        $course = Course::where('active', true)->first();

        if (!$course) {
            $this->info('No active courses found. Skipping classification seeding.');

            return;
        }

        // Get students from the classroom
        $students = $course->classroom->students->take(10);

        if ($students->isEmpty()) {
            $this->info("No students found for course {$course->name}. Skipping.");

            return;
        }

        // Static classification data mapping to cognitive levels
        $classificationData = [
            // Remember level
            0 => ['level' => 'Remember', 'score' => 0.22],
            // Understand level
            1 => ['level' => 'Understand', 'score' => 0.35],
            // Apply level
            2 => ['level' => 'Apply', 'score' => 0.48],
            // Analyze level
            3 => ['level' => 'Analyze', 'score' => 0.62],
            // Evaluate level
            4 => ['level' => 'Evaluate', 'score' => 0.78],
            // Create level
            5 => ['level' => 'Create', 'score' => 0.92],
        ];

        $classificationType = 'topsis';
        $now = Carbon::now();

        // Create static classification records for each student
        foreach ($students as $index => $student) {
            // Get classification based on student index (cycle through classifications)
            $classification = $classificationData[$index % count($classificationData)];

            // Create mock raw data that would be returned from fastapi
            $rawData = [
                'materials' => [],
                'method' => $classificationType,
            ];

            // Create classification record
            StudentCognitiveClassification::updateOrCreate(
                [
                    'user_id' => $student->id,
                    'course_id' => $course->id,
                    'classification_type' => $classificationType,
                ],
                [
                    'classification_level' => $classification['level'],
                    'classification_score' => $classification['score'],
                    'raw_data' => $rawData,
                    'classified_at' => $now->subHours(rand(1, 48)),
                ]
            );

            $this->info("Created classification for student {$student->name}: Level {$classification['level']}, Score {$classification['score']}");
        }

        $this->info('Student cognitive classifications seeded successfully!');
    }

    /**
     * Output info message during seeding
     */
    protected function info($message): void {
        $this->command->info($message);
        Log::info($message);
    }
}
