<?php

namespace Database\Seeders;

use App\Models\ClassRoom;
use App\Models\Course;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Seeder;

class CourseSeeder extends Seeder {
    private const TEST_DATA_COUNT = [
        'courses_per_classroom' => 3,
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

        $dataScienceCourses = [
            [
                'name' => 'Introduction to Python for Data Science',
                'description' => 'Learn the fundamentals of Python programming for data science, including basic syntax, data types, and importing essential libraries like NumPy and Pandas.',
            ],
            [
                'name' => 'Data Analysis with Python',
                'description' => 'Master data manipulation, cleaning, and analysis using Pandas and NumPy. Learn how to handle missing data, perform statistical operations, and prepare datasets for visualization.',
            ],
            [
                'name' => 'Data Visualization with Python',
                'description' => 'Create compelling data visualizations using Matplotlib, Seaborn, and Plotly. Learn to design charts, graphs, and interactive plots to effectively communicate insights from data.',
            ],
            [
                'name' => 'Machine Learning Foundations with Python',
                'description' => 'Introduction to machine learning concepts and implementation using scikit-learn. Learn regression, classification, clustering techniques, and model evaluation.',
            ],
            [
                'name' => 'Advanced Python for Data Science',
                'description' => 'Explore advanced techniques in Python for data science including time series analysis, natural language processing, and building complex visualization dashboards.',
            ],
        ];

        // Create a subset of courses for each classroom
        $coursesToCreate = min(count($dataScienceCourses), self::TEST_DATA_COUNT['courses_per_classroom']);
        $selectedCourses = array_slice($dataScienceCourses, 0, $coursesToCreate);

        foreach ($selectedCourses as $index => $courseData) {
            // Select a random teacher for this course
            $teacher = $teachers->random();

            $course = Course::create([
                'class_room_id' => $classroom->id,
                'teacher_id' => $teacher->id,
                'name' => $courseData['name'],
                'description' => $courseData['description'],
                'active' => true, // All courses are active
            ]);

            $courses->push($course);
        }

        return $courses;
    }
}
