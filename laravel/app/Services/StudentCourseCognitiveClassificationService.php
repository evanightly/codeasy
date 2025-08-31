<?php

namespace App\Services;

use App\Models\StudentCognitiveClassification;
use App\Models\StudentCourseCognitiveClassification;
use App\Repositories\StudentCourseCognitiveClassificationRepository;
use App\Support\Interfaces\Repositories\StudentCourseCognitiveClassificationRepositoryInterface;
use App\Support\Interfaces\Services\StudentCognitiveClassificationServiceInterface;
use App\Support\Interfaces\Services\StudentCourseCognitiveClassificationHistoryServiceInterface;
use App\Support\Interfaces\Services\StudentCourseCognitiveClassificationServiceInterface;
use App\Traits\Services\HandlesPageSizeAll;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class StudentCourseCognitiveClassificationService extends BaseCrudService implements StudentCourseCognitiveClassificationServiceInterface {
    use HandlesPageSizeAll;

    /** @var StudentCourseCognitiveClassificationRepository */
    protected $repository;

    public function __construct(
        protected StudentCognitiveClassificationServiceInterface $studentCognitiveClassificationService,
        protected StudentCourseCognitiveClassificationHistoryServiceInterface $historyService
    ) {
        parent::__construct();
    }

    public function getAllPaginated(array $search = [], int $pageSize = 15): LengthAwarePaginator {
        $this->handlePageSizeAll();

        return parent::getAllPaginated($search, $pageSize);
    }

    /**
     * Get a course-level cognitive classification for a student (read-only)
     * This only retrieves existing classifications without creating new ones
     */
    public function getCourseClassification(
        int $userId,
        int $courseId,
        string $classificationType = 'topsis'
    ): ?StudentCourseCognitiveClassification {
        // First check if a record exists in StudentCourseCognitiveClassification table
        $existingClassification = $this->repository->getByUserAndCourseId(
            $userId,
            $courseId,
            $classificationType
        );

        if ($existingClassification) {
            // Enrich material names if missing
            $this->enrichMaterialNamesInClassification($existingClassification);

            return $existingClassification;
        }

        // If not found, check if there's a course-level classification in StudentCognitiveClassification
        $courseClassification = $this->studentCognitiveClassificationService->getCourseClassificationForStudent(
            $userId,
            $courseId,
            $classificationType
        );

        if ($courseClassification) {
            // Create a record in StudentCourseCognitiveClassification for consistency
            // but only if a classification already exists elsewhere
            // TODO: might be cause issue regarding classification creation
            $newClassification = $this->createFromCourseClassification($courseClassification);

            // Enrich material names if missing
            $this->enrichMaterialNamesInClassification($newClassification);

            return $newClassification;
        }

        // Return null if no classification exists
        return null;
    }

    /**
     * Get detailed student course cognitive classification with material breakdowns
     */
    public function getDetailedClassification(
        StudentCourseCognitiveClassification $classification
    ): array {
        // Get material level classifications
        $materialClassifications = $this->studentCognitiveClassificationService->getMaterialClassificationsForStudent(
            $classification->user_id,
            $classification->course_id,
            $classification->classification_type
        );

        // Get detailed information for each material classification
        $materialDetails = $materialClassifications->map(function ($materialClassification) {
            return $this->studentCognitiveClassificationService->getClassificationDetails($materialClassification);
        });

        // Structure the response with overall classification and material details
        return [
            'classification' => $classification,
            'materials' => $materialDetails,
            'raw_data' => $classification->raw_data,
            'recommendations' => $classification->raw_data['recommendations'] ?? [],
            'calculation_details' => $classification->raw_data['calculation_details'] ?? null,
        ];
    }

    /**
     * Generate summary report for student course cognitive classifications
     */
    public function getCourseCognitiveReport(
        int $courseId,
        string $classificationType = 'topsis'
    ): array {
        // Get latest classification for each student in the course (deduplicated)
        $courseClassifications = $this->repository->getLatestByCourseId($courseId, $classificationType);

        // Structure by cognitive level
        $levelCounts = [
            'Remember' => 0,
            'Understand' => 0,
            'Apply' => 0,
            'Analyze' => 0,
            'Evaluate' => 0,
            'Create' => 0,
        ];

        // Count students at each level
        foreach ($courseClassifications as $classification) {
            if (isset($levelCounts[$classification->classification_level])) {
                $levelCounts[$classification->classification_level]++;
            }
        }

        return [
            'total_students' => $courseClassifications->count(),
            'level_distribution' => $levelCounts,
            'classifications' => $courseClassifications,
        ];
    }

    /**
     * Determine if a course classification needs updating based on material classifications
     */
    private function needsUpdating(
        StudentCognitiveClassification $courseClassification,
        Collection $materialClassifications
    ): bool {
        // Check if the course classification is older than the newest material classification
        $newestMaterialDate = $materialClassifications->max('updated_at');

        return $courseClassification->updated_at < $newestMaterialDate;
    }

    /**
     * Create a course-level classification from material classifications
     */
    private function createFromMaterialClassifications(
        int $userId,
        int $courseId,
        string $classificationType,
        Collection $materialClassifications
    ): StudentCourseCognitiveClassification {
        // Calculate average score across materials
        $totalScore = $materialClassifications->sum('classification_score');
        $avgScore = $totalScore / $materialClassifications->count();

        // Determine classification level using rule base
        $level = $this->determineClassificationLevel($avgScore);

        // Gather recommendations
        $allRecommendations = [];
        foreach ($materialClassifications as $classification) {
            if (isset($classification->raw_data['recommendations'])) {
                $allRecommendations = array_merge(
                    $allRecommendations,
                    $classification->raw_data['recommendations']
                );
            }
        }

        // Create raw data
        $rawData = [
            'material_classifications' => $materialClassifications->map(function ($classification) {
                return [
                    'id' => $classification->id,
                    'material_id' => $classification->learning_material_id,
                    'material_name' => $classification->learning_material ? $classification->learning_material->title : null,
                    'level' => $classification->classification_level,
                    'score' => $classification->classification_score,
                ];
            })->toArray(),
            'recommendations' => array_slice($allRecommendations, 0, 5), // Limit to top 5 recommendations
            'calculation_details' => [
                'material_count' => $materialClassifications->count(),
                'average_score' => $avgScore,
            ],
        ];

        // Create or update the StudentCourseCognitiveClassification record
        $courseClassification = $this->repository->updateOrCreate(
            [
                'user_id' => $userId,
                'course_id' => $courseId,
                'classification_type' => $classificationType,
            ],
            [
                'user_id' => $userId,
                'course_id' => $courseId,
                'classification_type' => $classificationType,
                'classification_level' => $level,
                'classification_score' => $avgScore,
                'raw_data' => $rawData,
                'classified_at' => Carbon::now(),
            ]
        );

        // Create a history record of this classification
        $this->createClassificationHistory($courseClassification);

        return $courseClassification;
    }

    /**
     * Create a course-level classification record from an existing StudentCognitiveClassification course-level record
     */
    private function createFromCourseClassification(
        StudentCognitiveClassification $courseClassification
    ): StudentCourseCognitiveClassification {
        $classification = $this->repository->create([
            'user_id' => $courseClassification->user_id,
            'course_id' => $courseClassification->course_id,
            'classification_type' => $courseClassification->classification_type,
            'classification_level' => $courseClassification->classification_level,
            'classification_score' => $courseClassification->classification_score,
            'raw_data' => $courseClassification->raw_data,
            'classified_at' => $courseClassification->classified_at,
        ]);

        // Create a history record of this classification
        $this->createClassificationHistory($classification);

        return $classification;
    }

    /**
     * Create an empty course classification when no material classifications exist
     */
    private function getOrCreateEmptyCourseClassification(
        int $userId,
        int $courseId,
        string $classificationType
    ): StudentCourseCognitiveClassification {
        $classification = $this->repository->updateOrCreate(
            [
                'user_id' => $userId,
                'course_id' => $courseId,
                'classification_type' => $classificationType,
            ],
            [
                'user_id' => $userId,
                'course_id' => $courseId,
                'classification_type' => $classificationType,
                'classification_level' => 'Not Classified',
                'classification_score' => 0,
                'raw_data' => [
                    'material_classifications' => [],
                    'recommendations' => ['Complete some learning materials to receive a cognitive classification.'],
                ],
                'classified_at' => Carbon::now(),
            ]
        );

        // Create a history record for this empty classification
        $this->createClassificationHistory($classification);

        return $classification;
    }

    /**
     * Determine classification level based on score using the rule base
     */
    private function determineClassificationLevel(float $score): string {
        // Apply the rule base as defined in requirements
        if ($score >= 0.85) {
            return 'Create';
        } elseif ($score >= 0.70) {
            return 'Evaluate';
        } elseif ($score >= 0.55) {
            return 'Analyze';
        } elseif ($score >= 0.40) {
            return 'Apply';
        } elseif ($score >= 0.25) {
            return 'Understand';
        }

        return 'Remember';
    }

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
    ): StudentCourseCognitiveClassification {
        $classification = $this->repository->updateOrCreate(
            [
                'user_id' => $userId,
                'course_id' => $courseId,
                'classification_type' => $classificationType,
            ],
            [
                'user_id' => $userId,
                'course_id' => $courseId,
                'classification_type' => $classificationType,
                'classification_level' => $level,
                'classification_score' => $score,
                'raw_data' => $rawData,
                'classified_at' => $classifiedAt ?? \Carbon\Carbon::now(),
            ]
        );

        // Create a history record
        $this->createClassificationHistory($classification);

        return $classification;
    }

    protected function getRepositoryClass(): string {
        return StudentCourseCognitiveClassificationRepositoryInterface::class;
    }

    /**
     * Export detailed calculation steps to Excel file
     *
     * @return \Illuminate\Http\StreamedResponse
     */
    public function exportCalculationStepsToExcel(StudentCourseCognitiveClassification $classification): StreamedResponse {
        $details = $this->getDetailedClassification($classification);

        // Create a spreadsheet with detailed calculation steps
        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Classification Summary');

        // Set headers with styling
        $sheet->setCellValue('A1', 'TOPSIS Classification Analysis Report');
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(16);

        $row = 3;
        $sheet->setCellValue('A' . $row, 'Student: ' . ($details['classification']->user->name ?? 'Unknown'));
        $sheet->setCellValue('A' . ++$row, 'Course: ' . ($details['classification']->course->name ?? 'Unknown'));
        $sheet->setCellValue('A' . ++$row, 'Classification Level: ' . $details['classification']->classification_level);
        $sheet->setCellValue('A' . ++$row, 'Classification Score: ' . $details['classification']->classification_score);
        $sheet->setCellValue('A' . ++$row, 'Classification Type: ' . $details['classification']->classification_type);
        $sheet->setCellValue('A' . ++$row, 'Classified At: ' . $details['classification']->classified_at);

        // Add material classifications summary
        $row += 2;
        $sheet->setCellValue('A' . $row, 'Material Classifications Summary:');
        $sheet->getStyle('A' . $row)->getFont()->setBold(true);
        $row++;

        $sheet->setCellValue('A' . $row, 'Material Name');
        $sheet->setCellValue('B' . $row, 'Classification Level');
        $sheet->setCellValue('C' . $row, 'Classification Score');
        $sheet->getStyle('A' . $row . ':C' . $row)->getFont()->setBold(true);
        $row++;

        foreach ($details['materials'] as $material) {
            $sheet->setCellValue('A' . $row, $material['learning_material']['title'] ?? 'Unknown Material');
            $sheet->setCellValue('B' . $row, $material['classification_level']);
            $sheet->setCellValue('C' . $row, $material['classification_score']);
            $row++;
        }

        // Add recommendations
        if (!empty($details['recommendations'])) {
            $row += 2;
            $sheet->setCellValue('A' . $row, 'Recommendations:');
            $sheet->getStyle('A' . $row)->getFont()->setBold(true);
            $row++;

            foreach ($details['recommendations'] as $index => $recommendation) {
                $sheet->setCellValue('A' . $row, ($index + 1) . '. ' . $recommendation);
                $row++;
            }
        }

        // Create detailed calculation sheets for each material
        foreach ($details['materials'] as $materialIndex => $material) {
            if (!isset($material['calculation_details']) || empty($material['calculation_details'])) {
                continue;
            }

            $materialSheet = $spreadsheet->createSheet();
            $materialTitle = 'Material ' . ($materialIndex + 1) . ' - TOPSIS';
            $materialSheet->setTitle($materialTitle);

            $this->addTopsisCalculationSteps($materialSheet, $material);
        }

        // Set column widths for summary sheet
        $sheet->getColumnDimension('A')->setWidth(50);
        $sheet->getColumnDimension('B')->setWidth(20);
        $sheet->getColumnDimension('C')->setWidth(20);

        // Generate filename
        $studentName = $details['classification']->user->name ?? 'Unknown';
        $courseName = $details['classification']->course->name ?? 'Unknown';
        $filename = 'topsis_calculation_steps_' . Str::slug($studentName) . '_' . Str::slug($courseName) . '_' . date('Y-m-d_H-i-s') . '.xlsx';

        // Create Excel writer and return as download
        $writer = new Xlsx($spreadsheet);

        return response()->streamDownload(function () use ($writer) {
            $writer->save('php://output');
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    /**
     * Add detailed TOPSIS calculation steps to an Excel worksheet
     *
     * @param  \PhpOffice\PhpSpreadsheet\Worksheet\Worksheet  $sheet
     * @param  array  $material
     */
    private function addTopsisCalculationSteps($sheet, $material): void {
        $calculationDetails = $material['calculation_details'] ?? [];

        if (empty($calculationDetails)) {
            $sheet->setCellValue('A1', 'No calculation details available');

            return;
        }

        $row = 1;

        // Material header
        $sheet->setCellValue('A' . $row, 'TOPSIS Calculation Details');
        $sheet->getStyle('A' . $row)->getFont()->setBold(true)->setSize(14);
        $row += 2;

        $sheet->setCellValue('A' . $row, 'Material: ' . ($material['learning_material']['title'] ?? 'Unknown'));
        $sheet->setCellValue('A' . ++$row, 'Final Level: ' . $material['classification_level']);
        $sheet->setCellValue('A' . ++$row, 'Final Score: ' . number_format($material['classification_score'], 4));
        $row += 2;

        // Parse calculation details
        $parsedDetails = is_string($calculationDetails) ? json_decode($calculationDetails, true) : $calculationDetails;

        if (!$parsedDetails || !isset($parsedDetails['steps'])) {
            $sheet->setCellValue('A' . $row, 'Invalid calculation details format');

            return;
        }

        // Step 1: Decision Matrix
        if (isset($parsedDetails['decision_matrix'])) {
            $sheet->setCellValue('A' . $row, 'Step 1: Decision Matrix');
            $sheet->getStyle('A' . $row)->getFont()->setBold(true);
            $row++;

            $sheet->setCellValue('A' . $row, 'Question');
            $sheet->setCellValue('B' . $row, 'compile_count');
            $sheet->setCellValue('C' . $row, 'coding_time');
            $sheet->setCellValue('D' . $row, 'completion_status');
            $sheet->setCellValue('E' . $row, 'trial_status');
            $sheet->setCellValue('F' . $row, 'variable_count');
            $sheet->setCellValue('G' . $row, 'function_count');
            $sheet->setCellValue('H' . $row, 'test_case_rate');
            $sheet->getStyle('A' . $row . ':H' . $row)->getFont()->setBold(true);
            $row++;

            foreach ($parsedDetails['decision_matrix'] as $index => $rowData) {
                $sheet->setCellValue('A' . $row, 'Question ' . ($index + 1));
                $col = 'B';
                foreach ($rowData as $value) {
                    $sheet->setCellValue($col . $row, number_format($value, 4));
                    $col++;
                }
                $row++;
            }
            $row += 2;
        }

        // Process each calculation step
        foreach ($parsedDetails['steps'] as $stepIndex => $step) {
            $stepNumber = $stepIndex + 2; // Start from step 2 since decision matrix is step 1

            $sheet->setCellValue('A' . $row, 'Step ' . $stepNumber . ': ' . $step['name']);
            $sheet->getStyle('A' . $row)->getFont()->setBold(true);
            $row++;

            $sheet->setCellValue('A' . $row, $step['description']);
            $row++;

            // Column Sums
            if (isset($step['column_sums'])) {
                $sheet->setCellValue('A' . $row, 'Column Sums:');
                $row++;
                $col = 'A';
                foreach ($step['column_sums'] as $sum) {
                    $sheet->setCellValue($col . $row, number_format($sum, 4));
                    $col++;
                }
                $row += 2;
            }

            // Normalized Matrix
            if (isset($step['normalized_matrix'])) {
                $sheet->setCellValue('A' . $row, 'Normalized Matrix:');
                $row++;
                foreach ($step['normalized_matrix'] as $matrixRow) {
                    $col = 'A';
                    foreach ($matrixRow as $value) {
                        $sheet->setCellValue($col . $row, number_format($value, 4));
                        $col++;
                    }
                    $row++;
                }
                $row += 2;
            }

            // Weights
            if (isset($step['weights'])) {
                $sheet->setCellValue('A' . $row, 'Weights:');
                $row++;
                $col = 'A';
                foreach ($step['weights'] as $weight) {
                    $sheet->setCellValue($col . $row, number_format($weight, 4));
                    $col++;
                }
                $row += 2;
            }

            // Weighted Matrix
            if (isset($step['weighted_matrix'])) {
                $sheet->setCellValue('A' . $row, 'Weighted Matrix:');
                $row++;
                foreach ($step['weighted_matrix'] as $matrixRow) {
                    $col = 'A';
                    foreach ($matrixRow as $value) {
                        $sheet->setCellValue($col . $row, number_format($value, 4));
                        $col++;
                    }
                    $row++;
                }
                $row += 2;
            }

            // Ideal Solutions
            if (isset($step['ideal_best'], $step['ideal_worst'])) {
                $sheet->setCellValue('A' . $row, 'Ideal Solutions:');
                $row++;

                $sheet->setCellValue('A' . $row, 'Ideal Best (A+):');
                $col = 'B';
                foreach ($step['ideal_best'] as $value) {
                    $sheet->setCellValue($col . $row, number_format($value, 4));
                    $col++;
                }
                $row++;

                $sheet->setCellValue('A' . $row, 'Ideal Worst (A-):');
                $col = 'B';
                foreach ($step['ideal_worst'] as $value) {
                    $sheet->setCellValue($col . $row, number_format($value, 4));
                    $col++;
                }
                $row += 2;
            }

            // Separation Measures
            if (isset($step['separation_best'], $step['separation_worst'])) {
                $sheet->setCellValue('A' . $row, 'Separation Measures:');
                $row++;

                $sheet->setCellValue('A' . $row, 'Question');
                $sheet->setCellValue('B' . $row, 'S+ (from ideal best)');
                $sheet->setCellValue('C' . $row, 'S- (from ideal worst)');
                $sheet->getStyle('A' . $row . ':C' . $row)->getFont()->setBold(true);
                $row++;

                foreach ($step['separation_best'] as $index => $sepBest) {
                    $sheet->setCellValue('A' . $row, 'Question ' . ($index + 1));
                    $sheet->setCellValue('B' . $row, number_format($sepBest, 4));
                    $sheet->setCellValue('C' . $row, number_format($step['separation_worst'][$index], 4));
                    $row++;
                }
                $row += 2;
            }

            // Performance Scores
            if (isset($step['performance_scores'])) {
                $sheet->setCellValue('A' . $row, 'Performance Scores (Ci):');
                $row++;

                $sheet->setCellValue('A' . $row, 'Question');
                $sheet->setCellValue('B' . $row, 'Performance Score');
                $sheet->getStyle('A' . $row . ':B' . $row)->getFont()->setBold(true);
                $row++;

                foreach ($step['performance_scores'] as $index => $score) {
                    $sheet->setCellValue('A' . $row, 'Question ' . ($index + 1));
                    $sheet->setCellValue('B' . $row, number_format($score, 4));
                    $row++;
                }
                $row += 2;
            }

            // Final Score and Level
            if (isset($step['final_score'])) {
                $sheet->setCellValue('A' . $row, 'Final Score: ' . number_format($step['final_score'], 4));
                $row++;
            }

            if (isset($step['final_level'])) {
                $sheet->setCellValue('A' . $row, 'Final Level: ' . $step['final_level']);
                $row++;
            }

            // Bloom's Taxonomy Rules
            if (isset($step['rules'])) {
                $row++;
                $sheet->setCellValue('A' . $row, 'Bloom\'s Taxonomy Mapping Rules:');
                $sheet->getStyle('A' . $row)->getFont()->setBold(true);
                $row++;

                foreach ($step['rules'] as $level => $rule) {
                    $sheet->setCellValue('A' . $row, $level . ': ' . $rule);
                    $row++;
                }
                $row++;
            }

            $row += 2; // Space between steps
        }

        // Set column widths
        for ($col = 'A'; $col <= 'H'; $col++) {
            $sheet->getColumnDimension($col)->setWidth(15);
        }

        // Make first column wider for labels
        $sheet->getColumnDimension('A')->setWidth(25);
    }

    /**
     * Create a history record of a classification
     *
     * @param  StudentCourseCognitiveClassification  $classification  The classification to create history for
     */
    private function createClassificationHistory(StudentCourseCognitiveClassification $classification): void {
        $this->historyService->create([
            'user_id' => $classification->user_id,
            'course_id' => $classification->course_id,
            'student_course_cognitive_classification_id' => $classification->id,
            'classification_type' => $classification->classification_type,
            'classification_level' => $classification->classification_level,
            'classification_score' => $classification->classification_score,
            'raw_data' => $classification->raw_data,
            'classified_at' => $classification->classified_at ?? Carbon::now(),
        ]);
    }

    /**
     * Enrich material names in classification raw_data if they are missing
     */
    private function enrichMaterialNamesInClassification(StudentCourseCognitiveClassification $classification): void {
        if (!$classification->raw_data || !isset($classification->raw_data['material_classifications'])) {
            return;
        }

        $rawData = $classification->raw_data;
        $materialClassifications = $rawData['material_classifications'];
        $needsUpdate = false;

        foreach ($materialClassifications as $index => $materialClassification) {
            // Check if material_name is missing or null
            if (!isset($materialClassification['material_name']) || $materialClassification['material_name'] === null) {
                if (isset($materialClassification['material_id'])) {
                    // Fetch the material name
                    $learningMaterial = \App\Models\LearningMaterial::find($materialClassification['material_id']);

                    if ($learningMaterial) {
                        $rawData['material_classifications'][$index]['material_name'] = $learningMaterial->title;
                        $needsUpdate = true;
                    }
                }
            }
        }

        // Update the classification if we enriched any material names
        if ($needsUpdate) {
            $classification->raw_data = $rawData;
            $classification->save();
        }
    }
}
