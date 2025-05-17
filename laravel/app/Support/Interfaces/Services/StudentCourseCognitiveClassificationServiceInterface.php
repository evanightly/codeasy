<?php

namespace App\Support\Interfaces\Services;

use Adobrovolsky97\LaravelRepositoryServicePattern\Services\Contracts\BaseCrudServiceInterface;
use App\Models\StudentCourseCognitiveClassification;

interface StudentCourseCognitiveClassificationServiceInterface extends BaseCrudServiceInterface {
    /**
     * Get or create a course-level cognitive classification for a student
     */
    public function getOrCreateCourseClassification(
        int $userId,
        int $courseId,
        string $classificationType = 'topsis'
    ): StudentCourseCognitiveClassification;

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
}
