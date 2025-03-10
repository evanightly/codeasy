<?php

namespace App\Support\Interfaces\Repositories;

interface ExecutionResultRepositoryInterface extends BaseRepositoryInterface {
    /**
     * Find the latest execution result for a student score
     *
     * @return \App\Models\ExecutionResult|null
     */
    public function findLatestByStudentScore(int $studentScoreId);

    /**
     * Count the compilation attempts for a student score
     */
    public function countCompilationAttempts(int $studentScoreId): int;
}
