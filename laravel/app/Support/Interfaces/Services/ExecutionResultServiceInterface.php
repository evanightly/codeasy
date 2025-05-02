<?php

namespace App\Support\Interfaces\Services;

interface ExecutionResultServiceInterface extends BaseCrudServiceInterface {
    /**
     * Execute code via FastAPI and store the result
     */
    public function executeCode(int $studentScoreId, string $code, array $testCases = []): array;

    /**
     * Get the latest execution result for a student score
     *
     * @return \App\Models\ExecutionResult|null
     */
    public function getLatestResult(int $studentScoreId);
}
