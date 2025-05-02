<?php

namespace App\Jobs\TestCaseChangeTracker;

use App\Models\ExecutionResult;
use App\Models\LearningMaterialQuestion;
use App\Models\StudentScore;
use App\Models\TestCaseChangeTracker;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ExecuteStudentCodeWithUpdatedTestCases implements ShouldQueue {
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     */
    public $tries;

    /**
     * Create a new job instance.
     */
    public function __construct(protected TestCaseChangeTracker $tracker) {
        $this->tries = config('test_case_tracking.max_attempts', 3);
    }

    /**
     * Execute the job.
     */
    public function handle(): void {
        try {
            // Check if tracker is still in pending status
            if ($this->tracker->status !== 'pending') {
                Log::info('Tracker already processed', ['tracker_id' => $this->tracker->id]);

                return;
            }

            // Update status to in-progress
            $this->tracker->update(['status' => 'in_progress']);

            // Get the question
            $question = LearningMaterialQuestion::find($this->tracker->learning_material_question_id);
            if (!$question) {
                $this->markFailed('Question not found');

                return;
            }

            // Get the active test cases for this question
            $testCases = $question->learning_material_question_test_cases()
                ->where('active', true)
                ->get();

            if ($testCases->isEmpty()) {
                $this->markFailed('No active test cases found');

                return;
            }

            // Prepare test case inputs for the FastAPI service
            $testCaseInputs = $testCases->pluck('input')->toArray();

            // Get affected students
            $affectedStudentIds = $this->tracker->affected_student_ids;
            $executionDetails = [
                'processed' => 0,
                'success' => 0,
                'failed' => 0,
                'errors' => [],
            ];

            // Process each affected student
            foreach ($affectedStudentIds as $studentId) {
                // Find the latest execution result for this student and question
                $studentScore = StudentScore::where('user_id', $studentId)
                    ->where('learning_material_question_id', $question->id)
                    // ->where('completion_status', true)
                    ->first();

                dump('studentScore', $studentScore);

                if (!$studentScore) {
                    dump("No student score found for student ID: $studentId");

                    continue;
                }

                // Get student's code
                $executionResult = $studentScore->completed_execution_result_id
                    ? ExecutionResult::find($studentScore->completed_execution_result_id)
                    : $studentScore->execution_results()->orderBy('created_at', 'desc')->first();

                if (!$executionResult || !$executionResult->code) {
                    $executionDetails['errors'][] = "No code found for student ID: $studentId";
                    $executionDetails['failed']++;

                    continue;
                }

                // Re-execute the code with new test cases
                $result = $this->executeCode($executionResult->code, $testCaseInputs, $question->id);
                $executionDetails['processed']++;

                // Update student score based on results
                // Changed from checking if all tests pass to checking if at least one test passes
                $somePassed = false;
                foreach ($result as $item) {
                    if (isset($item['type']) && $item['type'] === 'test_stats') {
                        dump($item);
                        $somePassed = $item['success'] > 0; // Changed from checking equality to checking > 0
                        break;
                    }
                }

                if ($somePassed) {
                    // Update student score to mark as complete if at least one test passes
                    $studentScore->update([
                        'completion_status' => true,
                        'score' => 100,
                        'completed_execution_result_id' => $executionResult->id,
                    ]);
                    $executionDetails['success']++;
                } else {
                    // Update student score to mark as incomplete if no tests pass
                    $studentScore->update([
                        'completion_status' => false,
                        'score' => 0,
                    ]);
                    $executionDetails['failed']++;
                }
            }

            // Mark tracker as completed
            $this->tracker->update([
                'status' => 'completed',
                'completed_at' => now(),
                'execution_details' => $executionDetails,
            ]);

        } catch (\Exception $e) {
            $this->markFailed('Job failed: ' . $e->getMessage());
            Log::error('Test case re-execution failed: ' . $e->getMessage(), [
                'tracker_id' => $this->tracker->id,
                'exception' => $e,
            ]);

            // Re-throw to let the job retry
            throw $e;
        }
    }

    /**
     * Execute code against the FastAPI service.
     */
    protected function executeCode(string $code, array $testCaseInputs, int $questionId): array {
        try {
            // Call the FastAPI service
            $fastApiUrl = config('services.fastapi.url') . '/test';
            $response = Http::post($fastApiUrl, [
                'type' => 'test',
                'code' => $code,
                'testcases' => $testCaseInputs,
                'question_id' => $questionId,
            ]);

            if ($response->successful()) {
                return $response->json() ?: [];
            }

            return [
                'error' => 'Error executing code',
                'details' => $response->json(),
            ];
        } catch (\Exception $e) {
            return [
                'error' => 'Error executing code',
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Mark the tracker as failed.
     */
    protected function markFailed(string $reason): void {
        $this->tracker->update([
            'status' => 'failed',
            'completed_at' => now(),
            'execution_details' => [
                'error' => $reason,
            ],
        ]);
    }
}
