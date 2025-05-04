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
        // if (app()->isProduction()) {
        //     return;
        // }

        $this->info('Seeding student scores with realistic data patterns...');

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

        // Enhanced student data patterns - each pattern represents a cognitive level
        // with more nuanced and varied metrics for better classification
        $studentData = [
            // Remember level student (low scores, few completions)
            0 => [
                'compile_counts' => [3, 5, 8, 9, 7],             // High compile counts (struggles)
                'coding_times' => [420, 580, 640, 390, 450],     // Longer coding times (seconds)
                'completion_pattern' => [true, false, false, false, false], // Only completes first question
                'variable_counts' => [1, 0, 1, 0, 0],            // Few variables
                'function_counts' => [0, 0, 0, 0, 0],            // No functions
            ],
            // Understand level student
            1 => [
                'compile_counts' => [4, 6, 7, 8, 5],             // Still high compile counts
                'coding_times' => [380, 450, 500, 420, 390],     // Moderate-high coding times
                'completion_pattern' => [true, true, false, false, false], // Completes two questions
                'variable_counts' => [2, 2, 1, 1, 0],            // Few variables
                'function_counts' => [0, 1, 0, 0, 0],            // Minimal functions
            ],
            // Apply level student
            2 => [
                'compile_counts' => [5, 4, 6, 5, 4],             // Moderate compile counts
                'coding_times' => [350, 320, 380, 340, 310],     // Moderate coding times
                'completion_pattern' => [true, true, true, false, false], // Completes three questions
                'variable_counts' => [3, 3, 2, 2, 1],            // More variables
                'function_counts' => [1, 1, 1, 0, 0],            // Some functions
            ],
            // Analyze level student
            3 => [
                'compile_counts' => [4, 3, 5, 4, 3],             // More efficient compiling
                'coding_times' => [300, 280, 320, 290, 270],     // More efficient coding time
                'completion_pattern' => [true, true, true, true, false], // Completes four questions
                'variable_counts' => [4, 3, 4, 3, 2],            // Good variable use
                'function_counts' => [1, 2, 1, 1, 0],            // Better function use
            ],
            // Evaluate level student
            4 => [
                'compile_counts' => [3, 3, 4, 3, 2],             // Efficient compiling
                'coding_times' => [250, 230, 270, 240, 220],     // Efficient coding time
                'completion_pattern' => [true, true, true, true, true], // Completes all questions
                'variable_counts' => [5, 4, 5, 4, 3],            // Good variable organization
                'function_counts' => [2, 2, 1, 1, 1],            // Good function usage
            ],
            // Create level student (highest performance)
            5 => [
                'compile_counts' => [2, 2, 3, 2, 2],             // Very efficient compiling
                'coding_times' => [200, 180, 210, 190, 185],     // Quick coding times
                'completion_pattern' => [true, true, true, true, true], // Completes all questions
                'variable_counts' => [6, 5, 7, 5, 4],            // Excellent variable use
                'function_counts' => [3, 2, 3, 2, 2],            // Excellent function use
            ],
        ];

        // Create the student scores with variations to make the data more natural
        foreach ($students as $index => $student) {
            // Get data pattern based on student index (cycle through patterns)
            $patternIndex = $index % count($studentData);
            $pattern = $studentData[$patternIndex];

            // Add slight variations to make data more realistic
            $variationFactor = rand(80, 120) / 100; // Random factor between 0.8 and 1.2

            $this->info("Creating scores for student: {$student->name} (Pattern: " .
                        ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'][$patternIndex] . ')');

            foreach ($materials as $materialIndex => $material) {
                $questions = $material->learning_material_questions()->where('active', true)->orderBy('order_number')->get();

                // Add difficulty factor based on material order (later materials are more challenging)
                $materialDifficulty = 1 + ($materialIndex * 0.1); // Increases difficulty by 10% per material

                foreach ($questions as $questionIndex => $question) {
                    // Only create data for first 5 questions per material
                    if ($questionIndex >= 5) {
                        continue;
                    }

                    // Apply variations to base pattern with material difficulty
                    $compileFactor = max(1, round($pattern['compile_counts'][$questionIndex] * $materialDifficulty * $variationFactor));
                    $timeFactor = max(60, round($pattern['coding_times'][$questionIndex] * $materialDifficulty * $variationFactor));

                    // Later questions in the same material have higher chance to be incomplete
                    $questionDifficulty = 1 + ($questionIndex * 0.15); // 15% more difficult per question
                    $isCompleted = $pattern['completion_pattern'][$questionIndex];

                    // For higher-indexed materials, reduce completion probability
                    if ($materialIndex >= 1 && $questionIndex >= 3) {
                        // More advanced students still have a chance to complete later materials
                        $completionProbability = $patternIndex * 15; // 0% for Remember, up to 75% for Create
                        $isCompleted = $isCompleted && (rand(0, 100) < $completionProbability);
                    }

                    // All questions are at least tried for first material
                    // For later materials, decrease probability of trying for lower-level students
                    $isTried = true;
                    if ($materialIndex >= 2) {
                        $tryProbability = 30 + ($patternIndex * 10); // 30% for Remember, up to 80% for Create
                        $isTried = rand(0, 100) < $tryProbability;
                    }

                    // Skip if not tried
                    if (!$isTried) {
                        continue;
                    }

                    // Create the score with realistic variations
                    $score = StudentScore::updateOrCreate(
                        [
                            'user_id' => $student->id,
                            'learning_material_question_id' => $question->id,
                        ],
                        [
                            'coding_time' => $timeFactor,
                            'score' => $isCompleted ? rand(70, 100) : rand(0, 60),
                            'completion_status' => $isCompleted,
                            'trial_status' => $isTried,
                            'compile_count' => $compileFactor,
                        ]
                    );

                    // Create execution result if tried
                    if ($isTried) {
                        // Scale variable and function counts based on material difficulty and pattern
                        $varCount = max(0, round($pattern['variable_counts'][$questionIndex] * ($isCompleted ? 1 : 0.7) * $variationFactor));
                        $funcCount = max(0, round($pattern['function_counts'][$questionIndex] * ($isCompleted ? 1 : 0.5) * $variationFactor));

                        $executionResult = $score->execution_results()->create([
                            'code' => $this->generateSampleCode($question->title, $varCount, $funcCount, $isCompleted),
                            'compile_status' => $isCompleted,
                            'variable_count' => $varCount,
                            'function_count' => $funcCount,
                        ]);

                        // Set completed execution result if applicable
                        if ($isCompleted) {
                            $score->update([
                                'completed_execution_result_id' => $executionResult->id,
                            ]);
                        }
                    }
                }
            }
        }

        $this->info('Student scores seeded successfully with realistic cognitive patterns!');
    }

    /**
     * Generate sample code with specified number of variables and functions
     * and make it look more realistic based on completion status
     */
    private function generateSampleCode(string $questionTitle, int $variables, int $functions, bool $isCompleted): string {
        $code = "# Python code for: {$questionTitle}\n\n";

        // Add imports based on complexity
        if ($functions > 1) {
            $code .= "import numpy as np\n";
            if ($functions > 2) {
                $code .= "import pandas as pd\nimport matplotlib.pyplot as plt\n";
            }
            $code .= "\n";
        }

        // Add docstring for more advanced code
        if ($variables > 3 || $functions > 1) {
            $code .= "'''\n";
            $code .= 'This program ' . ($isCompleted ? 'implements' : 'attempts to implement') . " a solution for {$questionTitle}\n";
            $code .= "'''\n\n";
        }

        // Add variables with more realistic names and values
        $varNames = ['data', 'result', 'count', 'total', 'value', 'items', 'scores', 'avg', 'max_val', 'min_val'];

        for ($i = 0; $i < $variables; $i++) {
            $varName = $varNames[$i % count($varNames)] . ($i >= count($varNames) ? '_' . ceil($i / count($varNames)) : '');

            if ($i % 3 == 0) {
                $code .= "{$varName} = " . rand(5, 100) . "\n";
            } elseif ($i % 3 == 1) {
                $code .= "{$varName} = " . (rand(0, 1) ? 'True' : 'False') . "\n";
            } else {
                $code .= "{$varName} = [" . implode(', ', array_map(function () {
                    return rand(1, 50);
                }, range(1, rand(3, 7)))) . "]\n";
            }
        }

        $code .= "\n";

        // Add functions with more realistic implementation
        $functionNames = ['calculate', 'process', 'analyze', 'get_result', 'compute', 'transform'];

        for ($i = 0; $i < $functions; $i++) {
            $funcName = $functionNames[$i % count($functionNames)] . ($i >= count($functionNames) ? '_' . ceil($i / count($functionNames)) : '');
            $hasParams = rand(0, 1) == 1;

            $code .= "def {$funcName}(" . ($hasParams ? 'data, option=None' : '') . "):\n";
            $code .= "    \"\"\"\n";
            $code .= '    ' . ucfirst($funcName) . ' the given ' . ($hasParams ? 'data' : 'information') . "\n";
            $code .= "    \"\"\"\n";

            // Add function body based on complexity
            if ($isCompleted) {
                $code .= "    result = 0\n";
                if ($hasParams) {
                    $code .= "    if option:\n";
                    $code .= "        for item in data:\n";
                    $code .= "            result += item\n";
                    $code .= "        return result\n";
                    $code .= "    else:\n";
                    $code .= "        return sum(data) if isinstance(data, list) else data\n";
                } else {
                    $code .= "    # Simple implementation\n";
                    $code .= '    return ' . rand(10, 50) . "\n";
                }
            } else {
                // Incomplete function with potential errors
                $code .= "    # TODO: Implement this function\n";
                $code .= "    result = 0  # Placeholder\n";
                if (rand(0, 1) == 1) {
                    // Add a commented out error line
                    $code .= "    # return result  # Uncomment this line\n";
                } else {
                    $code .= "    return result\n";
                }
            }
            $code .= "\n";
        }

        // Add main code execution
        $code .= "# Main code execution\n";
        if ($isCompleted) {
            if ($functions > 0) {
                $funcName = $functionNames[0];
                $code .= "print('{$questionTitle} - Solution')\n";
                $code .= "result = {$funcName}([" . implode(', ', array_map(function () {
                    return rand(1, 20);
                }, range(1, 5))) . "])\n";
                $code .= "print(f'Result: {result}')\n";
            } else {
                $code .= "print('Simple solution for {$questionTitle}')\n";
                if ($variables > 0) {
                    $code .= "print(f'Value: {" . $varNames[0] . "}')\n";
                } else {
                    $code .= "print('Hello, Data Science!')\n";
                }
            }
        } else {
            // Incomplete main code
            $code .= "print('Working on {$questionTitle}...')\n";
            $code .= "# TODO: Complete implementation\n";
        }

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
