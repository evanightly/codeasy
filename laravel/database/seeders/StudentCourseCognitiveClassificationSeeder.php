<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\StudentCourseCognitiveClassification;
use App\Models\User;
use App\Support\Enums\RoleEnum;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class StudentCourseCognitiveClassificationSeeder extends Seeder {
    /**
     * Run the database seeds.
     */
    public function run(): void {
        // Create test student users if needed
        $studentUsers = User::role(RoleEnum::STUDENT)->take(5)->get();

        if ($studentUsers->isEmpty()) {
            $students = new \Illuminate\Database\Eloquent\Collection;
            for ($i = 1; $i <= 5; $i++) {
                $student = User::factory()->create([
                    'name' => "Student {$i}",
                    'email' => "student{$i}@codeasy.com",
                    'username' => "student{$i}",
                ]);

                $student->assignRole(\App\Support\Enums\RoleEnum::STUDENT);
                $students->push($student);
            }
            $users = $students;
        } else {
            $users = $studentUsers;
        }

        // Get courses
        $courses = Course::take(3)->get();

        if ($users->isEmpty() || $courses->isEmpty()) {
            $this->command->info('No users or courses found. Skipping cognitive classification seeding.');

            return;
        }

        $cognitiveTypes = ['topsis', 'fuzzy'];
        $cognitiveMinScores = [
            'Remember' => 0,
            'Understand' => 0.25,
            'Apply' => 0.4,
            'Analyze' => 0.55,
            'Evaluate' => 0.7,
            'Create' => 0.85,
        ];

        foreach ($courses as $course) {
            foreach ($users as $user) {
                foreach ($cognitiveTypes as $type) {
                    // Determine a random cognitive level
                    $randomScore = mt_rand(0, 100) / 100;
                    $level = 'Remember';

                    foreach ($cognitiveMinScores as $cognitiveLevel => $minScore) {
                        if ($randomScore >= $minScore) {
                            $level = $cognitiveLevel;
                        }
                    }

                    // Create sample raw data
                    $rawData = [
                        'material_classifications' => [
                            [
                                'id' => 1,
                                'material_id' => 1,
                                'material_name' => 'Introduction to Python',
                                'level' => $level,
                                'score' => $randomScore,
                            ],
                            [
                                'id' => 2,
                                'material_id' => 2,
                                'material_name' => 'Data Structures',
                                'level' => $level,
                                'score' => $randomScore - 0.05,
                            ],
                        ],
                        'recommendations' => [
                            'Practice more on ' . $level . ' level concepts',
                            'Review material on data analysis techniques',
                            'Try more complex examples to improve understanding',
                        ],
                        'calculation_details' => [
                            'material_count' => 2,
                            'average_score' => $randomScore,
                        ],
                    ];

                    // Create the classification
                    StudentCourseCognitiveClassification::create([
                        'user_id' => $user->id,
                        'course_id' => $course->id,
                        'classification_type' => $type,
                        'classification_level' => $level,
                        'classification_score' => $randomScore,
                        'raw_data' => $rawData,
                        'classified_at' => Carbon::now()->subDays(rand(1, 30)),
                    ]);
                }
            }
        }
    }
}
