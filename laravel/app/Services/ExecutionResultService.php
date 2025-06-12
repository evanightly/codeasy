<?php

namespace App\Services;

use App\Models\StudentScore;
use App\Support\Interfaces\Repositories\ExecutionResultRepositoryInterface;
use App\Support\Interfaces\Services\ExecutionResultServiceInterface;
use App\Support\Interfaces\Services\StudentScoreServiceInterface;
use App\Traits\Services\HandlesPageSizeAll;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ExecutionResultService extends BaseCrudService implements ExecutionResultServiceInterface {
    use HandlesPageSizeAll;

    public function getAllPaginated(array $search = [], int $pageSize = 15): LengthAwarePaginator {
        $this->handlePageSizeAll();

        return parent::getAllPaginated($search, $pageSize);
    }

    protected function getRepositoryClass(): string {
        return ExecutionResultRepositoryInterface::class;
    }

    /** @var ExecutionResultRepository */
    protected $repository;

    /**
     * ExecutionResultService constructor.
     */
    public function __construct(
        protected StudentScoreServiceInterface $studentScoreService
    ) {
        parent::__construct();
    }

    /**
     * Execute code via FastAPI and store the result
     */
    public function executeCode(int $studentScoreId, string $code, array $testCases = []): array {
        $studentScore = StudentScore::find($studentScoreId);

        if (!$studentScore) {
            return [
                'error' => 'Student score not found',
                'success' => false,
            ];
        }

        // If this is the first compilation, mark the question as tried
        if (!$studentScore->trial_status) {
            $this->studentScoreService->update($studentScore, [
                'trial_status' => true,
            ]);
        }

        // Count existing execution attempts
        $compileCount = $this->repository->countCompilationAttempts($studentScoreId) + 1;

        // Execute via FastAPI
        try {
            $payload = [
                'code' => $code,
                'type' => 'student',
                'testcases' => $testCases,
                'student_id' => $studentScore->user_id, // Pass student ID for isolation
            ];

            $response = Http::post(config('services.fastapi.url') . '/test', $payload);

            if (!$response->successful()) {
                Log::error('FastAPI Error: ' . $response->body());

                return [
                    'error' => 'Failed to execute code',
                    'success' => false,
                ];
            }

            $outputData = $response->json();

            // Process output to get image URLs
            $output = array_map(function ($item) {
                if ($item['type'] === 'image') {
                    // Adjust image URL with nginx URL if needed
                    $nginxUrl = env('NGINX_URL', env('APP_URL'));
                    $item['content'] = rtrim($nginxUrl, '/') . $item['content'];
                }

                return $item;
            }, $outputData);

            // Check if there's any test stats in the output
            $testStats = null;
            $imageUrl = null;
            $variableCount = 0;
            $functionCount = 0;

            foreach ($output as $item) {
                if ($item['type'] === 'test_stats') {
                    $testStats = $item;
                }
                if ($item['type'] === 'image') {
                    $imageUrl = $item['content'];
                }
                // Extract code metrics
                if ($item['type'] === 'code_metrics') {
                    $variableCount = $item['variable_count'] ?? 0;
                    $functionCount = $item['function_count'] ?? 0;
                }
            }

            // Extract test case metrics
            $testCaseSuccess = 0;
            $testCaseTotal = 0;

            if ($testStats && isset($testStats['success'], $testStats['total_tests'])) {
                $testCaseSuccess = $testStats['success'];
                $testCaseTotal = $testStats['total_tests'];
            }

            // Check if the student score is already completed
            if ($studentScore->completion_status) {
                // If already completed, log the execution without creating a new record or updating the score
                Log::info('Code execution for completed student score - skipping ExecutionResult creation', [
                    'student_score_id' => $studentScore->id,
                    'test_success' => $testCaseSuccess,
                    'test_total' => $testCaseTotal,
                    'using_existing_execution_result' => $studentScore->completed_execution_result_id,
                ]);

                // Return the execution output without creating a new record
                return [
                    'output' => $output,
                    'success' => true,
                    'compile_count' => $compileCount,
                    'variable_count' => $variableCount,
                    'function_count' => $functionCount,
                    'is_completed' => true,
                ];
            }

            // Only create a new execution result if the student score is not already completed
            $result = $this->create([
                'student_score_id' => $studentScoreId,
                'code' => $code,
                'compile_count' => $compileCount,
                'compile_status' => !isset($output[0]['type']) || $output[0]['type'] !== 'error',
                'output_image' => $imageUrl,
                'variable_count' => $variableCount,
                'function_count' => $functionCount,
                'test_case_complete_count' => $testCaseSuccess,
                'test_case_total_count' => $testCaseTotal,
            ]);

            // Update score if there are test results
            if ($testStats && isset($testStats['success'], $testStats['total_tests'])) {
                // Calculate score as percentage
                $scoreValue = $testStats['total_tests'] > 0
                    ? round(($testStats['success'] / $testStats['total_tests']) * 100)
                    : 0;

                // Update student score with test case counts for Revision 2
                $this->studentScoreService->update($studentScore, [
                    'score' => $scoreValue,
                    // Mark as completed if all tests pass
                    'completion_status' => $testStats['success'] === $testStats['total_tests'] && $testStats['total_tests'] > 0,
                    'completed_execution_result_id' => $testStats['success'] === $testStats['total_tests'] ? $result->id : null,
                    // Add test case counts for cognitive classification
                    'test_case_complete_count' => $testCaseSuccess,
                    'test_case_total_count' => $testCaseTotal,
                ]);
            }

            return [
                'output' => $output,
                'success' => true,
                'compile_count' => $compileCount,
                'variable_count' => $variableCount,
                'function_count' => $functionCount,
            ];

        } catch (\Exception $e) {
            Log::error('Code execution error: ' . $e->getMessage());

            // Store failed execution attempt only if the student score is not already completed
            if (!$studentScore->completion_status) {
                $this->create([
                    'student_score_id' => $studentScoreId,
                    'code' => $code,
                    'compile_count' => $compileCount,
                    'compile_status' => false,
                    'output' => $e->getMessage(),
                ]);
            } else {
                // Log the error without creating a record
                Log::info('Failed code execution for completed student score - skipping ExecutionResult creation', [
                    'student_score_id' => $studentScore->id,
                    'error' => $e->getMessage(),
                ]);
            }

            return [
                'error' => 'Code execution error: ' . $e->getMessage(),
                'success' => false,
            ];
        }
    }

    /**
     * Get the latest execution result for a student score
     *
     * @return \App\Models\ExecutionResult|null
     */
    public function getLatestResult(int $studentScoreId) {
        return $this->repository->findLatestByStudentScore($studentScoreId);
    }
}
