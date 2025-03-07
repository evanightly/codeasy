<?php

namespace Database\Seeders;

use App\Models\ClassRoom;
use App\Models\Course;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Seeder;

class CourseSeeder extends Seeder {
    private const TEST_DATA_COUNT = [
        'courses_per_classroom' => 2,
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
        $classrooms = ClassRoom::all();

        foreach ($classrooms as $classroom) {
            $this->createCoursesForClassroom($classroom);
        }
    }

    /**
     * Create courses for a specific classroom
     */
    public function createCoursesForClassroom(ClassRoom $classroom): Collection {
        $courses = new Collection;
        $school = $classroom->school;

        // Get teachers from the school
        $teachers = $school->teachers()->inRandomOrder()->get();

        if ($teachers->isEmpty()) {
            return $courses;
        }

        $courseSubjects = [
            'Introduction to Programming',
            'Data Structures',
            'Algorithms',
            'Web Development',
            'Database Systems',
            'Software Engineering',
            'Mobile App Development',
            'Computer Networks',
            'Operating Systems',
            'Artificial Intelligence',
        ];

        for ($i = 1; $i <= self::TEST_DATA_COUNT['courses_per_classroom']; $i++) {
            // Select a random teacher for this course
            $teacher = $teachers->random();

            // Select a random course subject
            $courseName = $courseSubjects[array_rand($courseSubjects)];

            $course = Course::create([
                'class_room_id' => $classroom->id,
                'teacher_id' => $teacher->id,
                'name' => "$courseName - Class {$classroom->name}",
                'description' => "This course covers the fundamentals of $courseName for students in {$classroom->name}.",
                'active' => rand(0, 10) > 2, // 80% chance of being active
            ]);

            $courses->push($course);
        }

        return $courses;
    }
}
