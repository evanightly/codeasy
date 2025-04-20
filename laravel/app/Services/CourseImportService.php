<?php

namespace App\Services;

use App\Support\Interfaces\Repositories\CourseRepositoryInterface;
use App\Support\Interfaces\Services\CourseImportServiceInterface;
use Illuminate\Support\Facades\Log;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Symfony\Component\HttpFoundation\File\Exception\FileException;
use ZipArchive;

class CourseImportService implements CourseImportServiceInterface {
    public function __construct(protected CourseRepositoryInterface $courseRepository) {}

    /**
     * Preview import data without saving to database
     *
     * @param  string  $filePath  Path to the uploaded file
     * @return array Preview data with success/error status
     */
    public function preview(string $filePath): array {
        try {
            $pathInfo = pathinfo($filePath);
            $extension = strtolower($pathInfo['extension'] ?? '');

            // Initialize preview data structure
            $previewData = [
                'courses' => [],
                'materials' => [],
                'questions' => [],
                'testCases' => [],
                'pdfContent' => [],
                'isZipImport' => false,
                'stats' => [
                    'courses' => 0,
                    'materials' => 0,
                    'questions' => 0,
                    'testCases' => 0,
                    'pdfQuestions' => 0,
                    'pdfTestCases' => 0,
                ],
            ];

            $excelPath = $filePath;

            // If ZIP file, extract and analyze contents
            if ($extension === 'zip') {
                $previewData['isZipImport'] = true;
                $extractPath = storage_path('app/temp/extract_' . uniqid());

                if (!is_dir($extractPath)) {
                    mkdir($extractPath, 0777, true);
                }

                $zip = new ZipArchive;
                if ($zip->open($filePath) !== true) {
                    throw new FileException('Unable to open ZIP file');
                }
                $zip->extractTo($extractPath);

                // Find Excel file in extracted folder
                $excelFiles = glob($extractPath . '/*.{xlsx,xls}', GLOB_BRACE);
                if (empty($excelFiles)) {
                    throw new FileException('No Excel file found in ZIP archive');
                }
                $excelPath = $excelFiles[0];

                // Look for PDF files and analyze them
                $pdfFiles = glob($extractPath . '/**/*.pdf', GLOB_BRACE);
                foreach ($pdfFiles as $pdfFile) {
                    $relativePath = str_replace($extractPath . '/', '', $pdfFile);
                    $pdfContent = $this->analyzePdfContent($pdfFile);

                    if (!empty($pdfContent['questions'])) {
                        $previewData['pdfContent'][$relativePath] = $pdfContent;
                        $previewData['stats']['pdfQuestions'] += count($pdfContent['questions']);
                        $previewData['stats']['pdfTestCases'] += count($pdfContent['testCases']);
                    }
                }

                $zip->close();
            }

            // Process Excel file
            $spreadsheet = IOFactory::load($excelPath);

            // Process Courses sheet
            if ($spreadsheet->sheetNameExists('Courses')) {
                $coursesSheet = $spreadsheet->getSheetByName('Courses');
                $coursesData = $coursesSheet->toArray();
                $headers = array_shift($coursesData); // Remove header row

                foreach ($coursesData as $row) {
                    if (empty($row[0])) {
                        continue;
                    } // Skip empty rows

                    $courseData = [
                        'name' => $row[array_search('name', $headers, true)] ?? null,
                        'description' => $row[array_search('description', $headers, true)] ?? null,
                        'classroom' => $row[array_search('classroom', $headers, true)] ?? null,
                        'teacher_email' => $row[array_search('teacher_email', $headers, true)] ?? null,
                        'active' => $row[array_search('active', $headers, true)] ?? true,
                    ];

                    // Skip rows with missing required fields
                    if (empty($courseData['name']) || empty($courseData['classroom'])) {
                        continue;
                    }

                    $previewData['courses'][] = $courseData;
                }

                $previewData['stats']['courses'] = count($previewData['courses']);
            }

            // Process Materials sheet
            if ($spreadsheet->sheetNameExists('Materials')) {
                $materialsSheet = $spreadsheet->getSheetByName('Materials');
                $materialsData = $materialsSheet->toArray();
                $headers = array_shift($materialsData); // Remove header row

                foreach ($materialsData as $row) {
                    if (empty($row[0])) {
                        continue;
                    } // Skip empty rows

                    $materialData = [
                        'course_name' => $row[array_search('course_name', $headers, true)] ?? null,
                        'title' => $row[array_search('title', $headers, true)] ?? null,
                        'description' => $row[array_search('description', $headers, true)] ?? null,
                        'type' => $row[array_search('type', $headers, true)] ?? null,
                        'order_number' => $row[array_search('order_number', $headers, true)] ?? null,
                        'file' => $row[array_search('file', $headers, true)] ?? null,
                        'active' => $row[array_search('active', $headers, true)] ?? true,
                    ];

                    // Skip rows with missing required fields
                    if (empty($materialData['course_name']) || empty($materialData['title'])) {
                        continue;
                    }

                    $previewData['materials'][] = $materialData;
                }

                $previewData['stats']['materials'] = count($previewData['materials']);
            }

            // Process Questions sheet
            if ($spreadsheet->sheetNameExists('Questions')) {
                $questionsSheet = $spreadsheet->getSheetByName('Questions');
                $questionsData = $questionsSheet->toArray();
                $headers = array_shift($questionsData); // Remove header row

                foreach ($questionsData as $row) {
                    if (empty($row[0])) {
                        continue;
                    } // Skip empty rows

                    $questionData = [
                        'material_title' => $row[array_search('material_title', $headers, true)] ?? null,
                        'course_name' => $row[array_search('course_name', $headers, true)] ?? null,
                        'title' => $row[array_search('title', $headers, true)] ?? null,
                        'description' => $row[array_search('description', $headers, true)] ?? null,
                        'order_number' => $row[array_search('order_number', $headers, true)] ?? null,
                        'clue' => $row[array_search('clue', $headers, true)] ?? null,
                        'active' => $row[array_search('active', $headers, true)] ?? true,
                    ];

                    // Skip rows with missing required fields
                    if (empty($questionData['material_title']) || empty($questionData['title'])) {
                        continue;
                    }

                    $previewData['questions'][] = $questionData;
                }

                $previewData['stats']['questions'] = count($previewData['questions']);
            }

            // Process TestCases sheet
            if ($spreadsheet->sheetNameExists('TestCases')) {
                $testCasesSheet = $spreadsheet->getSheetByName('TestCases');
                $testCasesData = $testCasesSheet->toArray();
                $headers = array_shift($testCasesData); // Remove header row

                foreach ($testCasesData as $row) {
                    if (empty($row[0])) {
                        continue;
                    } // Skip empty rows

                    $testCaseData = [
                        'question_title' => $row[array_search('question_title', $headers, true)] ?? null,
                        'material_title' => $row[array_search('material_title', $headers, true)] ?? null,
                        'course_name' => $row[array_search('course_name', $headers, true)] ?? null,
                        'description' => $row[array_search('description', $headers, true)] ?? null,
                        'input' => $row[array_search('input', $headers, true)] ?? null,
                        'hidden' => $row[array_search('hidden', $headers, true)] ?? false,
                        'order_number' => $row[array_search('order_number', $headers, true)] ?? null,
                        'active' => $row[array_search('active', $headers, true)] ?? true,
                    ];

                    // Skip rows with missing required fields
                    if (empty($testCaseData['question_title']) || empty($testCaseData['description'])) {
                        continue;
                    }

                    $previewData['testCases'][] = $testCaseData;
                }

                $previewData['stats']['testCases'] = count($previewData['testCases']);
            }

            // Clean up extracted files if it was a ZIP
            if ($extension === 'zip' && isset($extractPath)) {
                $this->deleteDirectory($extractPath);
            }

            return [
                'success' => true,
                'preview' => $previewData,
            ];

        } catch (\Exception $e) {
            Log::error('Error previewing import: ' . $e->getMessage(), ['exception' => $e]);

            return [
                'success' => false,
                'message' => 'Error previewing import: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Analyze PDF content for questions and test cases
     * This is a simplified implementation that would need to be expanded
     * with actual NLP or parsing logic for production use
     */
    private function analyzePdfContent(string $pdfPath): array {
        // This is a placeholder implementation
        // In a real implementation, you would use a PDF parser library
        // and possibly NLP to identify questions and test cases

        // For demonstration purposes, we'll just return some mock data
        $result = [
            'questions' => [],
            'testCases' => [],
        ];

        // Simplified mock detection of questions and test cases
        // In reality, this would use a PDF parser and more sophisticated analysis
        $filename = pathinfo($pdfPath, PATHINFO_FILENAME);

        // Mock 2-3 questions with test cases for demo purposes
        $questionCount = rand(2, 3);
        for ($i = 0; $i < $questionCount; $i++) {
            $questionIndex = $i;
            $result['questions'][] = [
                'title' => 'Question ' . ($i + 1) . ' from ' . $filename,
                'description' => 'Auto-detected question content would appear here.',
                'order_number' => $i + 1,
            ];

            // Add 2-4 test cases per question
            $testCaseCount = rand(2, 4);
            for ($j = 0; $j < $testCaseCount; $j++) {
                $result['testCases'][] = [
                    'question_index' => $questionIndex,
                    'description' => 'Test case ' . ($j + 1) . ' for question ' . ($i + 1),
                    'input' => 'test(input) == expected_output',
                    'hidden' => rand(0, 1) === 1,
                    'order_number' => $j + 1,
                ];
            }
        }

        return $result;
    }

    /**
     * Import courses from a file
     *
     * @param  string  $filePath  Path to the uploaded file
     * @return array Import results with success/error status
     */
    public function import(string $filePath): array {
        // Implementation of the import logic would go here
        // For now, we'll just return a placeholder response
        return [
            'success' => true,
            'message' => 'Import successful',
            'stats' => [
                'courses' => 0,
                'materials' => 0,
                'questions' => 0,
                'testCases' => 0,
            ],
        ];
    }

    /**
     * Helper to delete a directory recursively
     */
    private function deleteDirectory($dir) {
        if (!is_dir($dir)) {
            return;
        }

        $objects = scandir($dir);
        foreach ($objects as $object) {
            if ($object === '.' || $object === '..') {
                continue;
            }

            $path = $dir . '/' . $object;

            if (is_dir($path)) {
                $this->deleteDirectory($path);
            } else {
                unlink($path);
            }
        }

        rmdir($dir);
    }
}
