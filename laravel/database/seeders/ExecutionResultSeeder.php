<?php

namespace Database\Seeders;

use App\Models\ExecutionResult;
use App\Models\StudentScore;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Log;

class ExecutionResultSeeder extends Seeder {
    public function run(): void {
        if (app()->isProduction()) {
            return;
        }

        $this->info('Seeding execution results with realistic attempt history...');

        // Find student scores that have been tried but haven't been completed yet or scores that were completed
        $studentScores = StudentScore::where('trial_status', true)->get();
        $count = count($studentScores);

        $this->info("Found {$count} student scores with trial status for history creation");

        foreach ($studentScores as $score) {
            // Skip scores that don't have a completed execution result yet (totally stuck students)
            if (!$score->completed_execution_result_id && !$score->completion_status) {
                // For incomplete scores, we'll create 1-2 failed attempts to show they tried
                $attempts = rand(1, 2);

                for ($i = 1; $i <= $attempts; $i++) {
                    // Create failed execution results
                    ExecutionResult::create([
                        'student_score_id' => $score->id,
                        'code' => $this->getIncompleteCode($score->learning_material_question->title, $i),
                        'compile_status' => false, // All failed
                        'variable_count' => rand(0, 1), // Minimal progress
                        'function_count' => 0, // No functions
                        'created_at' => now()->subMinutes(($attempts - $i + 1) * 15), // Space out the attempts
                    ]);
                }

                continue; // Skip to next score
            }

            // For completed scores, create a progression history
            if ($score->completed_execution_result_id) {
                // Get the completed execution result
                $completedResult = $score->completed_execution_result;

                if (!$completedResult) {
                    continue; // Skip if somehow missing
                }

                // Determine how many attempts the student made before succeeding
                // Higher compile count means more attempts
                $historySize = min(6, max(2, ceil($score->compile_count / 2)));

                // Distribution of errors vs progress
                // First attempts have more errors, later attempts show progress
                for ($i = 1; $i < $historySize; $i++) {
                    $attemptRatio = $i / $historySize; // 0 to almost 1
                    $isCompileSuccess = $i >= ($historySize - 2); // Last 2 attempts compile successfully

                    // Create execution result with progressive improvement
                    ExecutionResult::create([
                        'student_score_id' => $score->id,
                        'code' => $this->getProgressiveCode(
                            $score->learning_material_question->title,
                            $i,
                            $historySize,
                            $completedResult->variable_count,
                            $completedResult->function_count,
                            $isCompileSuccess
                        ),
                        'compile_status' => $isCompileSuccess,
                        'variable_count' => max(0, round($completedResult->variable_count * $attemptRatio)),
                        'function_count' => max(0, round($completedResult->function_count * $attemptRatio)),
                        'created_at' => now()->subMinutes(($historySize - $i) * rand(8, 20)), // Realistic timing
                    ]);
                }
            }
        }

        $this->info('Execution results seeded successfully with realistic progression history!');
    }

    /**
     * Generate incomplete code for failed attempts
     */
    private function getIncompleteCode(string $title, int $attempt): string {
        $errorProbability = 80; // 80% chance of syntax error in incomplete code

        $code = "# Attempt #{$attempt} for: {$title}\n\n";

        if (rand(0, 100) < $errorProbability) {
            // Add a syntax error
            $syntaxErrors = [
                "# This attempt has a syntax error\ndef function(:\n    print('Missing parenthesis')\n\n",
                "# Indentation error\ndef calculate():\nprint('Wrong indentation')\n\n",
                "# Missing colon\nfor i in range(5)\n    print(i)\n\n",
                "# Unclosed string\nprint(\"Hello world\n\n",
                "# Undefined variable\nresult = x + 10\nprint(result)\n\n",
            ];

            $code .= $syntaxErrors[array_rand($syntaxErrors)];
        } else {
            // Add code that runs but doesn't solve the problem
            $code .= "# This attempt runs but doesn't solve the problem\n";
            $code .= "print('Working on it...')\n";
            $code .= "# TODO: Implement solution\n";
        }

        $code .= "# Some basic variables\n";
        $code .= 'counter = ' . rand(1, 10) . "\n";

        return $code;
    }

    /**
     * Generate code showing progressive improvement
     */
    private function getProgressiveCode(
        string $title,
        int $attempt,
        int $totalAttempts,
        int $finalVarCount,
        int $finalFuncCount,
        bool $compiles
    ): string {
        // Progress ratio from 0 to 1
        $progress = $attempt / $totalAttempts;

        $code = "# Attempt #{$attempt} for: {$title}\n\n";

        if (!$compiles) {
            // Early attempts might have syntax errors
            $errorTypes = [
                "# Incomplete function\ndef process_data(data):\n    # Function isn't finished yet\n    result = []\n    for item in data:\n        # Missing logic here\n\n",
                "# Variable issues\ntotal = 0\nfor i in range(10):\n    # Inconsistent indentation or logic issues\n  total += i\n\n",
                "# Logic error\ndef calculate_average(numbers):\n    return sum(numbers) # Forgot to divide by len(numbers)\n\n",
            ];

            $code .= $errorTypes[array_rand($errorTypes)];
        } else {
            // Later attempts have better structure
            $code .= "# Making progress on the solution\n";
            if ($finalFuncCount > 0) {
                $code .= "def process_data(values):\n";
                $code .= "    result = 0\n";
                $code .= "    for val in values:\n";
                $code .= "        result += val\n";
                $code .= "    return result\n\n";
            }
        }

        // Add approximately the right number of variables based on progress
        $currentVarCount = max(1, ceil($finalVarCount * $progress));
        $varNames = ['data', 'result', 'count', 'values', 'total'];

        $code .= "# Variables\n";
        for ($i = 0; $i < $currentVarCount; $i++) {
            if ($i < count($varNames)) {
                $name = $varNames[$i];
            } else {
                $name = 'var_' . ($i - count($varNames) + 1);
            }

            if ($i % 3 == 0) {
                $code .= "{$name} = " . rand(5, 100) . "\n";
            } else {
                $code .= "{$name} = [" . implode(', ', array_map(function () {
                    return rand(1, 20);
                }, range(1, 3))) . "]\n";
            }
        }

        // Main execution code
        $code .= "\n# Main code\n";
        $code .= "print('Processing data for {$title}...')\n";

        if ($compiles && $currentVarCount > 1) {
            if ($finalFuncCount > 0) {
                $code .= "result = process_data(values)\n";
                $code .= "print(f'Result: {result}')\n";
            } else {
                $code .= "print(f'Total: {total}')\n";
            }
        } else {
            $code .= "# Output is incomplete\n";
            $code .= "print('Still working on it...')\n";
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
