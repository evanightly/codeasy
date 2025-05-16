<?php

namespace App\Support\Interfaces\Services;

use App\Models\StudentCognitiveClassification;
use Illuminate\Http\Response;
use Illuminate\Support\Collection;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

interface StudentCognitiveClassificationServiceInterface extends BaseCrudServiceInterface {
    /**
     * Run classification process for students in a course
     *
     * @param  array  $data  Contains course_id, classification_type, and optionally student_id
     * @return array Result of the classification process
     */
    public function runClassification(array $data): array;

    /**
     * Export classifications to Excel
     */
    public function exportToExcel(array $filters = []): Response|BinaryFileResponse;

    /**
     * Export raw student data used for classifications to Excel
     *
     * @param  int  $courseId  Course to export data for
     * @param  bool|null  $enforceConsistentQuestionCount  Whether to enforce consistent question count
     * @param  string  $exportFormat  Format for export ('raw' or 'ml_tool')
     * @param  bool  $includeClassificationResults  Whether to include classification results in the export
     */
    public function exportRawDataToExcel(
        int $courseId,
        ?bool $enforceConsistentQuestionCount = null,
        string $exportFormat = 'raw',
        bool $includeClassificationResults = false
    ): Response|BinaryFileResponse;

    /**
     * Get detailed classification information
     */
    public function getClassificationDetails(StudentCognitiveClassification $classification): array;

    /**
     * Get material-level classifications for a student in a course
     *
     * @param  int  $userId  The user ID
     * @param  int  $courseId  The course ID
     * @param  string  $classificationType  The classification algorithm type
     * @return \Illuminate\Support\Collection Collection of material-level classifications
     */
    public function getMaterialClassificationsForStudent(
        int $userId,
        int $courseId,
        string $classificationType = 'topsis'
    ): Collection;

    /**
     * Get course-level classification for a student
     *
     * @param  int  $userId  The user ID
     * @param  int  $courseId  The course ID
     * @param  string  $classificationType  The classification algorithm type
     * @return StudentCognitiveClassification|null The course-level classification or null if not found
     */
    public function getCourseClassificationForStudent(
        int $userId,
        int $courseId,
        string $classificationType = 'topsis'
    ): ?StudentCognitiveClassification;
}
