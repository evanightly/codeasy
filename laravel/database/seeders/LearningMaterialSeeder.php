<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\LearningMaterial;
use App\Support\Enums\LearningMaterialTypeEnum;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Seeder;

class LearningMaterialSeeder extends Seeder {
    private const TEST_DATA_COUNT = [
        'materials_per_course' => 3,
    ];

    public function run(): void {
        if (app()->isProduction()) {
            $this->seedProductionData();

            return;
        }

        $this->seedDevelopmentData();
    }

    private function seedProductionData(): void {
        // Production data would go here if needed
    }

    private function seedDevelopmentData(): void {
        $courses = Course::where('active', true)->get();

        foreach ($courses as $course) {
            $this->createLearningMaterialsForCourse($course);
        }
    }

    /**
     * Create learning materials for a specific course
     */
    public function createLearningMaterialsForCourse(Course $course): Collection {
        $materials = new Collection;

        $materialTitles = [
            'Basic Concepts',
            'Development Environment Setup',
            'Control Structures',
            'Functions and Methods',
            'Object-Oriented Programming',
            'Working with Data',
            'Error Handling',
            'File Operations',
            'Web Interactions',
            'Advanced Topics',
        ];

        // Always include one live code example
        $liveCodeIndex = rand(0, self::TEST_DATA_COUNT['materials_per_course'] - 1);

        for ($i = 0; $i < self::TEST_DATA_COUNT['materials_per_course']; $i++) {
            $title = $materialTitles[array_rand($materialTitles)];

            // Determine the type - ensure one is live coding
            if ($i === $liveCodeIndex) {
                $type = LearningMaterialTypeEnum::LIVE_CODE;
            } else {
                $type = LearningMaterialTypeEnum::LIVE_CODE; // For now, set all as live code for testing test cases
            }

            $material = LearningMaterial::create([
                'course_id' => $course->id,
                'title' => "$title - {$course->name}",
                'description' => "This material covers $title for students in the {$course->name} course.",
                'type' => $type,
                'order_number' => $i + 1,
                'active' => rand(0, 10) > 1, // 90% chance of being active
            ]);

            $materials->push($material);
        }

        return $materials;
    }
}
