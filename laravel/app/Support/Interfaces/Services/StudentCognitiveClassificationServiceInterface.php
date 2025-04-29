<?php

namespace App\Support\Interfaces\Services;

use Adobrovolsky97\LaravelRepositoryServicePattern\Services\Contracts\BaseCrudServiceInterface;
use Illuminate\Http\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

interface StudentCognitiveClassificationServiceInterface extends BaseCrudServiceInterface {
    /**
     * Run classification process for students in a course
     */
    public function runClassification(array $data): array;

    /**
     * Export classifications to Excel
     *
     * @return Response
     */
    public function exportToExcel(array $filters = []): Response|BinaryFileResponse;

    /**
     * Export raw student data used for classifications to Excel
     *
     * @param  int  $courseId  Course to export data for
     */
    public function exportRawDataToExcel(int $courseId): Response|BinaryFileResponse;
}
