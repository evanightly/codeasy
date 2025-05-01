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

        $this->info('Seeding execution results with static data...');

        // We'll only create additional execution results for scores that have been tried
        // This adds some history to each student's work
        $studentScores = StudentScore::where('trial_status', true)->get();
        $count = count($studentScores);

        $this->info("Found {$count} student scores with trial status");

        foreach ($studentScores as $score) {
            // Skip scores that don't have a completed execution result yet
            if (!$score->completed_execution_result_id) {
                continue;
            }

            // Create 1-3 additional execution results as history
            $attempts = rand(1, 3);

            for ($i = 1; $i <= $attempts; $i++) {
                // Create execution result with progressive improvement
                ExecutionResult::create([
                    'student_score_id' => $score->id,
                    'code' => "# Attempt {$i} for question\n\n" . $this->getCodeForAttempt($score->learning_material_question->title, $i, $attempts),
                    'compile_status' => $i === $attempts, // Last attempt always compiles
                    'variable_count' => max(1, $score->completed_execution_result->variable_count - ($attempts - $i)),
                    'function_count' => max(0, $score->completed_execution_result->function_count - ($attempts - $i)),
                    'created_at' => now()->subMinutes(($attempts - $i + 1) * 10), // Space out the attempts
                ]);
            }
        }

        $this->info('Execution results seeded successfully!');
    }

    /**
     * Generate sample code for an attempt
     */
    private function getCodeForAttempt(string $title, int $attempt, int $totalAttempts): string {
        // More errors in earlier attempts, better code in later attempts
        $errorProbability = (($totalAttempts - $attempt) / $totalAttempts) * 100;

        $code = "# Working on: {$title}\n\n";

        if (rand(0, 100) < $errorProbability) {
            // Add a syntax error in earlier attempts
            $code .= "# This attempt has a syntax error\ndef my_function(:\n    print('Missing parenthesis')\n\n";
        } else {
            $code .= "# This attempt is syntactically correct\ndef my_function():\n    print('Hello, Data Science!')\n\n";
        }

        // Add some variables - more in later attempts
        $variables = $attempt + 1;
        for ($i = 1; $i <= $variables; $i++) {
            $code .= "var_{$i} = {$i} * 10\n";
        }

        $code .= "\n# Main code\n";
        $code .= "print('Attempt #{$attempt}')\n";

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
