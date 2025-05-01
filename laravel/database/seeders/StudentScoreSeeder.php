<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\StudentScore;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Log;

class StudentScoreSeeder extends Seeder {
    /**
     * Run the database seeds.
     */
    public function run(): void {
        if (app()->isProduction()) {
            return;
        }

        $this->info('Seeding student scores with static data...');

        // Get the first course
        $course = Course::where('active', true)->first();

        if (!$course) {
            $this->info('No active courses found. Skipping student score seeding.');

            return;
        }

        // Get students from the classroom
        $students = $course->classroom->students->take(10);

        if ($students->isEmpty()) {
            $this->info("No students found for course {$course->name}. Skipping.");

            return;
        }

        // Get learning materials
        $materials = $course->learning_materials()->where('active', true)->orderBy('order_number')->get();

        if ($materials->isEmpty()) {
            $this->info("No learning materials found for course {$course->name}. Skipping.");

            return;
        }

        // Static data for student scores - mapping cognitive levels
        $studentData = [
            // Remember level student (low scores, few completions)
            0 => [
                'compile_counts' => [3, 5, 8, 2, 4],
                'coding_times' => [120, 180, 240, 90, 150],
                'completion_pattern' => [true, false, false, false, false],
                'variable_counts' => [1, 2, 1, 1, 0],
                'function_counts' => [0, 0, 0, 0, 0],
            ],
            // Understand level student
            1 => [
                'compile_counts' => [4, 6, 7, 5, 3],
                'coding_times' => [200, 250, 300, 180, 220],
                'completion_pattern' => [true, true, false, false, false],
                'variable_counts' => [2, 2, 3, 1, 1],
                'function_counts' => [0, 1, 0, 0, 0],
            ],
            // Apply level student
            2 => [
                'compile_counts' => [5, 4, 6, 7, 6],
                'coding_times' => [300, 270, 350, 320, 280],
                'completion_pattern' => [true, true, true, false, false],
                'variable_counts' => [3, 3, 4, 2, 2],
                'function_counts' => [1, 1, 1, 0, 0],
            ],
            // Analyze level student
            3 => [
                'compile_counts' => [4, 3, 5, 5, 4],
                'coding_times' => [280, 250, 300, 290, 270],
                'completion_pattern' => [true, true, true, true, false],
                'variable_counts' => [4, 3, 5, 4, 3],
                'function_counts' => [1, 2, 1, 1, 0],
            ],
            // Evaluate level student
            4 => [
                'compile_counts' => [3, 4, 4, 3, 5],
                'coding_times' => [250, 220, 240, 260, 230],
                'completion_pattern' => [true, true, true, true, true],
                'variable_counts' => [5, 4, 6, 5, 4],
                'function_counts' => [2, 2, 2, 1, 1],
            ],
            // Create level student (highest performance)
            5 => [
                'compile_counts' => [2, 3, 3, 2, 3],
                'coding_times' => [200, 180, 210, 190, 200],
                'completion_pattern' => [true, true, true, true, true],
                'variable_counts' => [6, 5, 7, 6, 5],
                'function_counts' => [3, 2, 3, 2, 2],
            ],
        ];

        // Create the student scores
        foreach ($students as $index => $student) {
            // Get data pattern based on student index (cycle through patterns)
            $pattern = $studentData[$index % count($studentData)];

            foreach ($materials as $materialIndex => $material) {
                $questions = $material->learning_material_questions()->where('active', true)->orderBy('order_number')->get();

                foreach ($questions as $questionIndex => $question) {
                    // Only create data for first 5 questions per material
                    if ($questionIndex >= 5) {
                        continue;
                    }

                    // All questions are at least tried
                    $tried = true;

                    // Determine completion based on pattern
                    $completed = $pattern['completion_pattern'][$questionIndex % count($pattern['completion_pattern'])];

                    // Create the score
                    $score = StudentScore::updateOrCreate(
                        [
                            'user_id' => $student->id,
                            'learning_material_question_id' => $question->id,
                        ],
                        [
                            'coding_time' => $pattern['coding_times'][$questionIndex % count($pattern['coding_times'])],
                            'score' => $completed ? rand(70, 100) : rand(0, 60),
                            'completion_status' => $completed,
                            'trial_status' => $tried,
                            'compile_count' => $pattern['compile_counts'][$questionIndex % count($pattern['compile_counts'])],
                        ]
                    );

                    // Create execution result
                    if ($tried) {
                        $executionResult = $score->execution_results()->create([
                            'code' => "# Python code for {$question->title}\n\n# Variables and functions\n" .
                                     $this->generateSampleCode(
                                         $pattern['variable_counts'][$questionIndex % count($pattern['variable_counts'])],
                                         $pattern['function_counts'][$questionIndex % count($pattern['function_counts'])]
                                     ),
                            'compile_status' => $completed,
                            'variable_count' => $pattern['variable_counts'][$questionIndex % count($pattern['variable_counts'])],
                            'function_count' => $pattern['function_counts'][$questionIndex % count($pattern['function_counts'])],
                        ]);

                        // Set completed execution result if applicable
                        if ($completed) {
                            $score->update([
                                'completed_execution_result_id' => $executionResult->id,
                            ]);
                        }
                    }
                }
            }

            $this->info("Created scores for student: {$student->name}");
        }

        $this->info('Student scores seeded successfully!');
    }

    /**
     * Generate sample code with specified number of variables and functions
     */
    private function generateSampleCode(int $variables, int $functions): string {
        $code = '';

        // Add variables
        for ($i = 1; $i <= $variables; $i++) {
            $code .= "variable_{$i} = " . rand(10, 100) . "\n";
        }

        $code .= "\n";

        // Add functions
        for ($i = 1; $i <= $functions; $i++) {
            $code .= "def function_{$i}(x):\n";
            $code .= "    return x * {$i}\n\n";
        }

        // Add a simple print statement
        $code .= "\n# Output\nprint('Hello, Data Science!')\n";

        return $code;
    }

    /**
     * Output info message during seeding
     */
    protected function info($message): void {
        $this->command->info($message);
        Log::info($message);
    }
}
