<?php

namespace App\Support\Interfaces\Services;

use App\Models\StudentCognitiveClassification;
use Illuminate\Http\Response;
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
}
