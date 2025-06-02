<?php

namespace App\Http\Controllers;

use App\Http\Requests\StudentCourseCognitiveClassification\StoreStudentCourseCognitiveClassificationRequest;
use App\Http\Requests\StudentCourseCognitiveClassification\UpdateStudentCourseCognitiveClassificationRequest;
use App\Http\Resources\StudentCourseCognitiveClassificationResource;
use App\Models\StudentCourseCognitiveClassification;
use App\Support\Enums\IntentEnum;
use App\Support\Enums\PermissionEnum;
use App\Support\Interfaces\Services\StudentCourseCognitiveClassificationServiceInterface;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Support\Str;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class StudentCourseCognitiveClassificationController extends Controller implements HasMiddleware {
    public function __construct(protected StudentCourseCognitiveClassificationServiceInterface $studentCourseCognitiveClassificationService) {}

    public static function middleware(): array {
        return [
            self::createPermissionMiddleware([PermissionEnum::STUDENT_COURSE_COGNITIVE_CLASSIFICATION_CREATE->value], ['create', 'store']),
            self::createPermissionMiddleware([PermissionEnum::STUDENT_COURSE_COGNITIVE_CLASSIFICATION_UPDATE->value], ['edit', 'update']),
            self::createPermissionMiddleware([PermissionEnum::STUDENT_COURSE_COGNITIVE_CLASSIFICATION_READ->value], ['index', 'show']),
            self::createPermissionMiddleware([PermissionEnum::STUDENT_COURSE_COGNITIVE_CLASSIFICATION_DELETE->value], ['destroy']),
        ];
    }

    public function index(Request $request) {
        $intent = $request->get('intent');

        // Get course cognitive classification for a student
        if ($intent === IntentEnum::STUDENT_COURSE_COGNITIVE_CLASSIFICATION_INDEX_GET_BY_USER_AND_COURSE->value) {
            $userId = $request->get('user_id');
            $courseId = $request->get('course_id');
            $classificationType = $request->get('classification_type', 'topsis');

            if (!$userId || !$courseId) {
                return response()->json(['error' => 'User ID and Course ID are required'], 422);
            }

            $classification = $this->studentCourseCognitiveClassificationService->getOrCreateCourseClassification(
                $userId,
                $courseId,
                $classificationType
            );

            return new StudentCourseCognitiveClassificationResource($classification);
        }

        // Get cognitive report for a course
        if ($intent === IntentEnum::STUDENT_COURSE_COGNITIVE_CLASSIFICATION_INDEX_GET_COURSE_REPORT->value) {
            $courseId = $request->get('course_id');
            $classificationType = $request->get('classification_type', 'topsis');

            if (!$courseId) {
                return response()->json(['error' => 'Course ID is required'], 422);
            }

            $report = $this->studentCourseCognitiveClassificationService->getCourseCognitiveReport(
                $courseId,
                $classificationType
            );

            return response()->json($report);
        }

        // Regular index page with pagination
        $perPage = $request->get('perPage', 10);
        $data = StudentCourseCognitiveClassificationResource::collection(
            $this->studentCourseCognitiveClassificationService->getAllPaginated($request->query(), $perPage)
        );

        if ($this->ajax()) {
            return $data;
        }

        return inertia('StudentCourseCognitiveClassification/Index');
    }

    public function create() {
        return inertia('StudentCourseCognitiveClassification/Create');
    }

    public function store(StoreStudentCourseCognitiveClassificationRequest $request) {
        if ($this->ajax()) {
            return $this->studentCourseCognitiveClassificationService->create($request->validated());
        }
    }

    public function show(StudentCourseCognitiveClassification $studentCourseClassification) {
        $intent = request()->get('intent');

        // Export calculation steps as Excel file
        if ($intent === IntentEnum::STUDENT_COURSE_COGNITIVE_CLASSIFICATION_INDEX_EXPORT_CALCULATION_STEPS->value) {
            $details = $this->studentCourseCognitiveClassificationService->getDetailedClassification($studentCourseClassification);

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

        // Get detailed classification information with material breakdowns
        if ($intent === IntentEnum::STUDENT_COURSE_COGNITIVE_CLASSIFICATION_SHOW_DETAILS->value) {
            $details = $this->studentCourseCognitiveClassificationService->getDetailedClassification($studentCourseClassification);

            return response()->json($details);
        }

        $data = StudentCourseCognitiveClassificationResource::make($studentCourseClassification->load(['course', 'user']));

        if ($this->ajax()) {
            return $data;
        }

        return inertia('StudentCourseCognitiveClassification/Show', compact('data'));
    }

    public function edit(StudentCourseCognitiveClassification $studentCourseClassification) {
        $data = StudentCourseCognitiveClassificationResource::make($studentCourseClassification);

        return inertia('StudentCourseCognitiveClassification/Edit', compact('data'));
    }

    public function update(UpdateStudentCourseCognitiveClassificationRequest $request, StudentCourseCognitiveClassification $studentCourseClassification) {
        if ($this->ajax()) {
            return $this->studentCourseCognitiveClassificationService->update($studentCourseClassification, $request->validated());
        }
    }

    public function destroy(StudentCourseCognitiveClassification $studentCourseClassification) {
        if ($this->ajax()) {
            return $this->studentCourseCognitiveClassificationService->delete($studentCourseClassification);
        }
    }

    /**
     * Add detailed TOPSIS calculation steps to an Excel worksheet
     */
    private function addTopsisCalculationSteps($sheet, $material) {
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
}
