<?php

namespace Database\Seeders;

use App\Models\ClassRoom;
use App\Models\Course;
use App\Services\Course\CourseImportService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

class CourseSeeder extends Seeder {
    private const TEST_DATA_COUNT = [
        'courses_per_classroom' => 3,
    ];

    // Path to look for Excel import file
    private const EXCEL_IMPORT_PATH = 'imports/courses_import.xlsx';

    public function run(): void {
        // Check if we should force development seeding even in production
        $forceDevSeeding = env('FORCE_DEV_SEEDING', false);

        // Use production seeding unless development seeding is forced
        if (app()->isProduction() && !$forceDevSeeding) {
            $this->seedProductionData();

            return;
        }

        // Check if we have an Excel file to import
        $excelPath = $this->getExcelImportPath();

        if ($excelPath && file_exists($excelPath)) {
            $this->info('Found Excel import file. Importing courses from Excel...');
            $this->importFromExcel($excelPath);

            return;
        }

        // Fall back to default seeding if no Excel file is found
        $this->info('No Excel import file found. Using default seeding data...');
        $this->seedDevelopmentData();
    }

    private function seedProductionData(): void {
        // Production data would go here if needed
    }

    private function importFromExcel($filePath): void {
        $importer = app(CourseImportService::class);
        $result = $importer->import($filePath);

        if ($result['success']) {
            $this->info('Excel import completed successfully:');
            $this->info("- {$result['stats']['courses']} courses");
            $this->info("- {$result['stats']['materials']} learning materials");
            $this->info("- {$result['stats']['questions']} questions");
            $this->info("- {$result['stats']['testCases']} test cases");
        } else {
            $this->error('Excel import failed: ' . $result['message']);
            foreach ($result['errors'] as $error) {
                $this->warn("- {$error}");
            }
        }
    }

    private function seedDevelopmentData(): void {
        $classrooms = ClassRoom::all();

        foreach ($classrooms as $classroom) {
            $this->createCoursesForClassroom($classroom);
        }
    }

    /**
     * Get the path to the Excel import file
     */
    private function getExcelImportPath(): ?string {
        // Check storage/app directory first
        if (Storage::exists(self::EXCEL_IMPORT_PATH)) {
            return Storage::path(self::EXCEL_IMPORT_PATH);
        }

        // Check public directory as fallback
        $publicPath = public_path('imports/courses_import.xlsx');
        if (file_exists($publicPath)) {
            return $publicPath;
        }

        return null;
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

    /**
     * Output info message during seeding
     */
    private function info($message): void {
        $this->command->info($message);
    }

    /**
     * Output error message during seeding
     */
    private function error($message): void {
        $this->command->error($message);
    }

    /**
     * Output warning message during seeding
     */
    private function warn($message): void {
        $this->command->warn($message);
    }
}
