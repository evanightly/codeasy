<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\LearningMaterial;
use App\Support\Enums\LearningMaterialTypeEnum;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Seeder;

class LearningMaterialSeeder extends Seeder {
    private const TEST_DATA_COUNT = [
        'materials_per_course' => 5, // Increasing to accommodate more data science topics
    ];

    public function run(): void {
        if (app()->isProduction()) {
            $this->seedProductionData();

            return;
        }

        // Skip seeding if courses were imported from Excel
        if ($this->wasExcelImportUsed()) {
            $this->info('Skipping learning material seeding as courses were imported from Excel.');

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

        // Define materials based on course name
        $materialsByCourseName = [
            'Introduction to Python for Data Science' => [
                ['title' => 'Python Basics for Data Science', 'type' => LearningMaterialTypeEnum::LIVE_CODE],
                ['title' => 'Installing and Importing Libraries', 'type' => LearningMaterialTypeEnum::LIVE_CODE],
                ['title' => 'Working with NumPy Arrays', 'type' => LearningMaterialTypeEnum::LIVE_CODE],
                ['title' => 'Introduction to Pandas', 'type' => LearningMaterialTypeEnum::LIVE_CODE],
                ['title' => 'Basic Data Visualization', 'type' => LearningMaterialTypeEnum::LIVE_CODE],
            ],
            'Data Analysis with Python' => [
                ['title' => 'Data Cleaning with Pandas', 'type' => LearningMaterialTypeEnum::LIVE_CODE],
                ['title' => 'Data Transformation Techniques', 'type' => LearningMaterialTypeEnum::LIVE_CODE],
                ['title' => 'Grouping and Aggregation', 'type' => LearningMaterialTypeEnum::LIVE_CODE],
                ['title' => 'Working with Time Series Data', 'type' => LearningMaterialTypeEnum::LIVE_CODE],
                ['title' => 'Statistical Analysis with SciPy', 'type' => LearningMaterialTypeEnum::LIVE_CODE],
            ],
            'Data Visualization with Python' => [
                ['title' => 'Matplotlib Fundamentals', 'type' => LearningMaterialTypeEnum::LIVE_CODE],
                ['title' => 'Advanced Plotting with Matplotlib', 'type' => LearningMaterialTypeEnum::LIVE_CODE],
                ['title' => 'Statistical Visualizations with Seaborn', 'type' => LearningMaterialTypeEnum::LIVE_CODE],
                ['title' => 'Interactive Visualizations with Plotly', 'type' => LearningMaterialTypeEnum::LIVE_CODE],
                ['title' => 'Creating Dashboard Layouts', 'type' => LearningMaterialTypeEnum::LIVE_CODE],
            ],
            'Machine Learning Foundations with Python' => [
                ['title' => 'Introduction to scikit-learn', 'type' => LearningMaterialTypeEnum::LIVE_CODE],
                ['title' => 'Regression Models', 'type' => LearningMaterialTypeEnum::LIVE_CODE],
                ['title' => 'Classification Techniques', 'type' => LearningMaterialTypeEnum::LIVE_CODE],
                ['title' => 'Clustering Algorithms', 'type' => LearningMaterialTypeEnum::LIVE_CODE],
                ['title' => 'Model Evaluation and Selection', 'type' => LearningMaterialTypeEnum::LIVE_CODE],
            ],
            'Advanced Python for Data Science' => [
                ['title' => 'Advanced Pandas Techniques', 'type' => LearningMaterialTypeEnum::LIVE_CODE],
                ['title' => 'Advanced Time Series Analysis', 'type' => LearningMaterialTypeEnum::LIVE_CODE],
                ['title' => 'Natural Language Processing', 'type' => LearningMaterialTypeEnum::LIVE_CODE],
                ['title' => 'Building Custom Visualization Functions', 'type' => LearningMaterialTypeEnum::LIVE_CODE],
                ['title' => 'Working with Big Data in Python', 'type' => LearningMaterialTypeEnum::LIVE_CODE],
            ],
        ];

        // Default materials if course name doesn't match any predefined categories
        $defaultMaterials = [
            ['title' => 'Python Fundamentals', 'type' => LearningMaterialTypeEnum::LIVE_CODE],
            ['title' => 'Data Manipulation with Pandas', 'type' => LearningMaterialTypeEnum::LIVE_CODE],
            ['title' => 'Data Visualization Basics', 'type' => LearningMaterialTypeEnum::LIVE_CODE],
            ['title' => 'Statistical Analysis', 'type' => LearningMaterialTypeEnum::LIVE_CODE],
            ['title' => 'Machine Learning Introduction', 'type' => LearningMaterialTypeEnum::LIVE_CODE],
        ];

        $materialsToCreate = $materialsByCourseName[$course->name] ?? $defaultMaterials;
        $maxMaterials = min(count($materialsToCreate), self::TEST_DATA_COUNT['materials_per_course']);

        for ($i = 0; $i < $maxMaterials; $i++) {
            $materialData = $materialsToCreate[$i];

            $material = LearningMaterial::create([
                'course_id' => $course->id,
                'title' => $materialData['title'],
                'description' => 'This material covers ' . $materialData['title'] . ' for students learning data science with Python.',
                'type' => $materialData['type'],
                'order_number' => $i + 1,
                'active' => true,
            ]);

            $materials->push($material);
        }

        return $materials;
    }

    /**
     * Check if the courses were imported from Excel
     */
    private function wasExcelImportUsed(): bool {
        // Check for a marker file or environment variable that could be set by CourseSeeder
        $excelPath = storage_path('app/imports/courses_import.xlsx');
        $publicPath = public_path('imports/courses_import.xlsx');

        return file_exists($excelPath) || file_exists($publicPath);
    }

    /**
     * Output info message during seeding
     */
    private function info($message): void {
        $this->command->info($message);
    }
}
