<?php

namespace App\Support\Interfaces\Services;

use Adobrovolsky97\LaravelRepositoryServicePattern\Services\Contracts\BaseCrudServiceInterface;
use App\Models\StudentCourseCognitiveClassification;
use Symfony\Component\HttpFoundation\StreamedResponse;

interface StudentCourseCognitiveClassificationServiceInterface extends BaseCrudServiceInterface {
    /**
     * Get a course-level cognitive classification for a student (read-only)
     */
    public function getCourseClassification(
        int $userId,
        int $courseId,
        string $classificationType = 'topsis'
    ): ?StudentCourseCognitiveClassification;

    /**
     * Get detailed student course cognitive classification with material breakdowns
     */
    public function getDetailedClassification(
        StudentCourseCognitiveClassification $classification
    ): array;

    /**
     * Generate summary report for student course cognitive classifications
     */
    public function getCourseCognitiveReport(
        int $courseId,
        string $classificationType = 'topsis'
    ): array;

    /**
     * Create or update course-level classification from raw data
     */
    public function getOrCreateCourseClassificationsFromRawData(
        int $userId,
        int $courseId,
        string $classificationType,
        string $level,
        float $score,
        array $rawData,
        $classifiedAt = null
    ): StudentCourseCognitiveClassification;

    /**
     * Export TOPSIS calculation steps to Excel
     */
    public function exportCalculationStepsToExcel(
        StudentCourseCognitiveClassification $classification
    ): StreamedResponse;
}
