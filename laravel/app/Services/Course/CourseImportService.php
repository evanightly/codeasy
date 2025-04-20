<?php

namespace App\Services\Course;

use App\Models\ClassRoom;
use App\Models\Course;
use App\Models\LearningMaterial;
use App\Models\LearningMaterialQuestion;
use App\Models\LearningMaterialQuestionTestCase;
use App\Models\User;
use App\Support\Enums\LearningMaterialTypeEnum;
use App\Support\Enums\ProgrammingLanguageEnum;
use App\Support\Interfaces\Services\Course\CourseImportServiceInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Smalot\PdfParser\Parser as PdfParser;
use ZipArchive;

class CourseImportService implements CourseImportServiceInterface {
    protected $spreadsheet;
    protected $errors = [];
    protected $successCount = [
        'courses' => 0,
        'materials' => 0,
        'questions' => 0,
        'testCases' => 0,
    ];

    // Tracking created entities to allow referencing by title/name
    protected $createdCourses = [];
    protected $createdMaterials = [];
    protected $createdQuestions = [];

    // Extract directory for ZIP files
    protected $extractDir;
    protected $isZipImport = false;
    protected $uploadedFiles = [];

    // PDF Parser instance
    protected $pdfParser;

    public function __construct() {
        $this->pdfParser = new PdfParser;
    }

    public function import(string $filePath) {
        try {
            // Determine if this is a ZIP file
            $fileExtension = pathinfo($filePath, PATHINFO_EXTENSION);
            $this->isZipImport = strtolower($fileExtension) === 'zip';

            if ($this->isZipImport) {
                $excelPath = $this->extractZipFile($filePath);
                if (!$excelPath) {
                    throw new \Exception('No Excel file found in the ZIP archive');
                }
            } else {
                $excelPath = $filePath;
            }

            $this->spreadsheet = IOFactory::load($excelPath);

            DB::beginTransaction();

            $this->processCourseSheet();

            // If there are errors, throw a validation exception before committing
            if (count($this->errors) > 0) {
                $this->cleanupTempFiles();
                DB::rollBack();
                throw ValidationException::withMessages([
                    'excel_file' => 'Import has errors',
                    'details' => $this->errors,
                ]);
            }

            DB::commit();

            // Clean up temporary extraction directory if this was a ZIP import
            $this->cleanupTempFiles();

            return [
                'success' => true,
                'message' => 'Import completed successfully',
                'stats' => $this->successCount,
                'errors' => $this->errors,
            ];
        } catch (ValidationException $e) {
            // Let validation exceptions pass through
            throw $e;
        } catch (\Exception $e) {
            $this->cleanupTempFiles();
            DB::rollBack();
            Log::error('Course import failed: ' . $e->getMessage(), ['exception' => $e]);

            return [
                'success' => false,
                'message' => 'Import failed: ' . $e->getMessage(),
                'errors' => $this->errors,
            ];
        }
    }

    /**
     * Preview the content of an import file without committing changes
     *
     * @param  string  $filePath  Path to the import file (Excel or ZIP)
     * @return array Preview data with courses, materials, questions and test cases
     */
    public function preview(string $filePath): array {
        try {
            // Determine if this is a ZIP file
            $fileExtension = pathinfo($filePath, PATHINFO_EXTENSION);
            $isZipImport = strtolower($fileExtension) === 'zip';
            $pdfQuestionData = [];

            if ($isZipImport) {
                $excelPath = $this->extractZipFile($filePath);
                if (!$excelPath) {
                    throw new \Exception('No Excel file found in the ZIP archive');
                }

                // Also scan for PDF files to extract questions - use recursive search
                $pdfFiles = [];
                $directory = new \RecursiveDirectoryIterator($this->extractDir);
                $iterator = new \RecursiveIteratorIterator($directory);
                foreach ($iterator as $file) {
                    if ($file->isFile() && strtolower($file->getExtension()) === 'pdf') {
                        $pdfFiles[] = $file->getPathname();
                    }
                }

                foreach ($pdfFiles as $pdfFile) {
                    $pdfData = $this->parsePdfContent($pdfFile);
                    if (!empty($pdfData['questions'])) {
                        $fileName = basename($pdfFile);
                        $pdfQuestionData[$fileName] = $pdfData;
                    }
                }
            } else {
                $excelPath = $filePath;
            }

            $spreadsheet = IOFactory::load($excelPath);

            // Read data from sheets but don't commit to database
            $courseSheet = $spreadsheet->getSheetByName('Courses');
            $materialsSheet = $spreadsheet->getSheetByName('Materials');
            $questionsSheet = $spreadsheet->getSheetByName('Questions');
            $testCasesSheet = $spreadsheet->getSheetByName('TestCases');

            $previewData = [
                'courses' => $courseSheet ? $this->readSheetToCollection($courseSheet) : [],
                'materials' => $materialsSheet ? $this->readSheetToCollection($materialsSheet) : [],
                'questions' => $questionsSheet ? $this->readSheetToCollection($questionsSheet) : [],
                'testCases' => $testCasesSheet ? $this->readSheetToCollection($testCasesSheet) : [],
                'pdfContent' => $pdfQuestionData,
                'isZipImport' => $isZipImport,
                'stats' => [
                    'courses' => count($courseSheet ? $this->readSheetToCollection($courseSheet) : []),
                    'materials' => count($materialsSheet ? $this->readSheetToCollection($materialsSheet) : []),
                    'questions' => count($questionsSheet ? $this->readSheetToCollection($questionsSheet) : []),
                    'testCases' => count($testCasesSheet ? $this->readSheetToCollection($testCasesSheet) : []),
                    'pdfQuestions' => array_sum(array_map(function ($pdf) {
                        return count($pdf['questions'] ?? []);
                    }, $pdfQuestionData)),
                    'pdfTestCases' => array_sum(array_map(function ($pdf) {
                        return count($pdf['testCases'] ?? []);
                    }, $pdfQuestionData)),
                ],
            ];

            // Clean up temporary extraction directory if this was a ZIP import
            if ($isZipImport) {
                $this->cleanupTempFiles();
            }

            return [
                'success' => true,
                'preview' => $previewData,
            ];
        } catch (\Exception $e) {
            // Clean up temporary files if needed
            if (isset($isZipImport) && $isZipImport) {
                $this->cleanupTempFiles();
            }

            return [
                'success' => false,
                'message' => 'Preview generation failed: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Extract a ZIP file and find the Excel file within
     *
     * @param  string  $zipPath  Path to the ZIP file
     * @return string|null Path to the extracted Excel file, or null if not found
     */
    protected function extractZipFile(string $zipPath): ?string {
        $zip = new ZipArchive;
        $result = $zip->open($zipPath);

        if ($result !== true) {
            throw new \Exception("Failed to open ZIP file: error code $result");
        }

        // Create a unique temporary directory for extraction
        $this->extractDir = storage_path('app/temp/imports/' . Str::uuid());

        if (!file_exists($this->extractDir)) {
            mkdir($this->extractDir, 0755, true);
        }

        // Extract all files
        $zip->extractTo($this->extractDir);
        $zip->close();

        // Find Excel files in the extracted content
        $excelFiles = array_merge(
            glob($this->extractDir . '/*.xlsx'),
            glob($this->extractDir . '/*.xls')
        );

        if (empty($excelFiles)) {
            throw new \Exception('No Excel file found in the ZIP archive');
        }

        // Return the first Excel file found
        return $excelFiles[0];
    }

    /**
     * Clean up temporary files after import
     */
    protected function cleanupTempFiles() {
        if ($this->isZipImport && $this->extractDir && file_exists($this->extractDir)) {
            $this->rrmdir($this->extractDir);
        }
    }

    /**
     * Recursively remove a directory
     */
    protected function rrmdir($dir) {
        if (is_dir($dir)) {
            $objects = scandir($dir);
            foreach ($objects as $object) {
                if ($object != '.' && $object != '..') {
                    if (is_dir($dir . DIRECTORY_SEPARATOR . $object)) {
                        $this->rrmdir($dir . DIRECTORY_SEPARATOR . $object);
                    } else {
                        unlink($dir . DIRECTORY_SEPARATOR . $object);
                    }
                }
            }
            rmdir($dir);
        }
    }

    /**
     * Resolve and copy a file from the ZIP extract directory to storage
     *
     * @param  string  $relativePath  Relative path from the Excel file
     * @param  string  $targetDirectory  Directory to store the file in
     * @return array File info [filename, extension]
     */
    protected function resolveFile(string $relativePath, string $targetDirectory): array {
        if (empty($relativePath)) {
            return [null, null];
        }

        // Skip if not a ZIP import
        if (!$this->isZipImport) {
            // For non-ZIP imports, just return the filename as-is
            return [basename($relativePath), pathinfo($relativePath, PATHINFO_EXTENSION)];
        }

        // Normalize path
        $relativePath = str_replace(['\\', '/'], DIRECTORY_SEPARATOR, $relativePath);

        // Full path in the extracted directory
        $fullPath = $this->extractDir . DIRECTORY_SEPARATOR . $relativePath;

        // Check if file exists
        if (!file_exists($fullPath)) {
            $this->errors[] = "File not found in ZIP: {$relativePath}";

            return [null, null];
        }

        // Get file extension
        $extension = pathinfo($fullPath, PATHINFO_EXTENSION);

        // Generate unique filename
        $filename = Str::uuid() . '.' . $extension;

        // Directory to store the file
        $storageDirectory = "public/{$targetDirectory}";

        // Copy file to storage
        $storagePath = Storage::putFileAs(
            $storageDirectory,
            $fullPath,
            $filename
        );

        // Track uploaded file
        $this->uploadedFiles[] = $storagePath;

        // Return just the filename and extension (not the path)
        return [$filename, $extension];
    }

    protected function processCourseSheet() {
        $courseSheet = $this->spreadsheet->getSheetByName('Courses');
        if (!$courseSheet) {
            throw new \Exception('Courses sheet not found in the Excel file');
        }

        $courses = $this->readSheetToCollection($courseSheet);

        foreach ($courses as $index => $courseData) {
            try {
                // Convert friendly identifiers to IDs
                if (isset($courseData['classroom']) && !isset($courseData['class_room_id'])) {
                    $classroom = $this->findClassroomByName($courseData['classroom']);
                    if ($classroom) {
                        $courseData['class_room_id'] = $classroom->id;
                    } else {
                        $this->errors[] = "Row {$index}: Classroom '{$courseData['classroom']}' not found";

                        continue;
                    }
                }

                if (isset($courseData['teacher_email']) && !isset($courseData['teacher_id'])) {
                    $teacher = $this->findTeacherByEmail($courseData['teacher_email']);
                    if ($teacher) {
                        $courseData['teacher_id'] = $teacher->id;
                    } else {
                        $this->errors[] = "Row {$index}: Teacher with email '{$courseData['teacher_email']}' not found";

                        continue;
                    }
                }

                $validator = Validator::make($courseData, [
                    'class_room_id' => 'required|exists:class_rooms,id',
                    'teacher_id' => 'required|exists:users,id',
                    'name' => 'required|string|max:255',
                    'description' => 'nullable|string',
                    'active' => 'nullable|boolean',
                ]);

                if ($validator->fails()) {
                    $this->errors[] = "Row {$index}: " . implode(', ', $validator->errors()->all());

                    continue;
                }

                // Create course
                $course = Course::create([
                    'class_room_id' => $courseData['class_room_id'],
                    'teacher_id' => $courseData['teacher_id'],
                    'name' => $courseData['name'],
                    'description' => $courseData['description'] ?? null,
                    'active' => $courseData['active'] ?? true,
                ]);

                // Store for reference by name
                $this->createdCourses[$course->name] = $course->id;

                $this->successCount['courses']++;

                // Process materials for this course
                $this->processMaterialsSheet($course);

            } catch (\Exception $e) {
                $this->errors[] = "Row {$index}: {$e->getMessage()}";
                Log::error("Error processing course row {$index}", ['exception' => $e]);
            }
        }
    }

    protected function processMaterialsSheet(Course $course) {
        $materialsSheet = $this->spreadsheet->getSheetByName('Materials');
        if (!$materialsSheet) {
            throw new \Exception('Materials sheet not found in the Excel file');
        }

        $materials = $this->readSheetToCollection($materialsSheet);

        // Filter by course name or ID
        $filteredMaterials = collect($materials)->filter(function ($item) use ($course) {
            return
                (isset($item['course_id']) && $item['course_id'] == $course->id) ||
                (isset($item['course_name']) && $item['course_name'] == $course->name);
        });

        $orderNumber = 1;

        foreach ($filteredMaterials as $index => $materialData) {
            try {
                // If using course name instead of ID
                if (isset($materialData['course_name']) && !isset($materialData['course_id'])) {
                    $courseId = $this->createdCourses[$materialData['course_name']] ?? null;
                    if ($courseId) {
                        $materialData['course_id'] = $courseId;
                    } else {
                        $this->errors[] = "Materials Row {$index}: Course '{$materialData['course_name']}' not found";

                        continue;
                    }
                }

                $validator = Validator::make($materialData, [
                    'course_id' => 'required|numeric',
                    'title' => 'required|string|max:255',
                    'description' => 'nullable|string',
                    'type' => 'required|string|in:' . implode(',', LearningMaterialTypeEnum::toArray()),
                    'file' => 'nullable|string',
                    'file_extension' => 'nullable|string',
                    'active' => 'nullable|boolean',
                ]);

                if ($validator->fails() || $materialData['course_id'] != $course->id) {
                    $this->errors[] = "Materials Row {$index}: " . implode(', ', $validator->errors()->all());

                    continue;
                }

                // Handle file references for materials if present in the ZIP
                if ($this->isZipImport && !empty($materialData['file'])) {
                    [$filePath, $fileExtension] = $this->resolveFile(
                        $materialData['file'],
                        'learning-materials'  // Changed from learning_materials to learning-materials
                    );

                    if ($filePath) {
                        $materialData['file'] = $filePath;
                        $materialData['file_extension'] = $fileExtension ?? $materialData['file_extension'] ?? null;
                    }
                }

                // Create material
                $material = LearningMaterial::create([
                    'course_id' => $course->id,
                    'title' => $materialData['title'],
                    'description' => $materialData['description'] ?? null,
                    'type' => $materialData['type'],
                    'file' => $materialData['file'] ?? null,
                    'file_extension' => $materialData['file_extension'] ?? null,
                    'order_number' => $orderNumber++,
                    'active' => $materialData['active'] ?? true,
                ]);

                // Store for reference by title
                $materialKey = $course->id . '|' . $material->title;
                $this->createdMaterials[$materialKey] = $material->id;

                $this->successCount['materials']++;

                // Check if this material has a PDF file attached and we're doing a ZIP import
                if ($this->isZipImport &&
                    !empty($materialData['file']) &&
                    strtolower($materialData['file_extension'] ?? '') === 'pdf') {

                    // Get the full path to the PDF file
                    $pdfPath = storage_path('app/public/learning-materials/' . $materialData['file']);

                    // Parse PDF to extract questions and test cases
                    $extractedContent = $this->parsePdfContent($pdfPath);

                    // If questions were found in the PDF, create them
                    if (!empty($extractedContent['questions'])) {
                        $this->createQuestionsFromPdf($material, $extractedContent);
                    }
                } else {
                    // Process questions for this material from the spreadsheet
                    $this->processQuestionsSheet($material);
                }

            } catch (\Exception $e) {
                $this->errors[] = "Materials Row {$index}: {$e->getMessage()}";
                Log::error("Error processing material row {$index}", ['exception' => $e]);
            }
        }
    }

    protected function processQuestionsSheet(LearningMaterial $material) {
        $questionsSheet = $this->spreadsheet->getSheetByName('Questions');
        if (!$questionsSheet) {
            throw new \Exception('Questions sheet not found in the Excel file');
        }

        $questions = $this->readSheetToCollection($questionsSheet);

        // Filter by material title or ID
        $filteredQuestions = collect($questions)->filter(function ($item) use ($material) {
            return
                (isset($item['learning_material_id']) && $item['learning_material_id'] == $material->id) ||
                (isset($item['material_title']) && $item['material_title'] == $material->title &&
                 isset($item['course_name']) && $item['course_name'] == $material->course->name);
        });

        $orderNumber = 1;

        foreach ($filteredQuestions as $index => $questionData) {
            try {
                // If using material title instead of ID
                if (isset($questionData['material_title'], $questionData['course_name']) && !isset($questionData['learning_material_id'])) {
                    $materialKey = $material->course_id . '|' . $questionData['material_title'];
                    $materialId = $this->createdMaterials[$materialKey] ?? null;
                    if ($materialId) {
                        $questionData['learning_material_id'] = $materialId;
                    } else {
                        $this->errors[] = "Questions Row {$index}: Material '{$questionData['material_title']}' in course '{$questionData['course_name']}' not found";

                        continue;
                    }
                }

                $validator = Validator::make($questionData, [
                    'learning_material_id' => 'required|numeric',
                    'title' => 'required|string|max:255',
                    'description' => 'nullable|string',
                    'clue' => 'nullable|string',
                    'file' => 'nullable|string',
                    'file_extension' => 'nullable|string',
                    'active' => 'nullable|boolean',
                ]);

                if ($validator->fails() || $questionData['learning_material_id'] != $material->id) {
                    $this->errors[] = "Questions Row {$index}: " . implode(', ', $validator->errors()->all());

                    continue;
                }

                // Handle file references for questions if present in the ZIP
                if ($this->isZipImport && !empty($questionData['file'])) {
                    [$filePath, $fileExtension] = $this->resolveFile(
                        $questionData['file'],
                        'learning-material-questions'  // Changed from learning_material_questions to learning-material-questions
                    );

                    if ($filePath) {
                        $questionData['file'] = $filePath;
                        $questionData['file_extension'] = $fileExtension ?? $questionData['file_extension'] ?? null;
                    }
                }

                // Create question
                $question = LearningMaterialQuestion::create([
                    'learning_material_id' => $material->id,
                    'title' => $questionData['title'],
                    'description' => $questionData['description'] ?? null,
                    'clue' => $questionData['clue'] ?? null,
                    'file' => $questionData['file'] ?? null,
                    'file_extension' => $questionData['file_extension'] ?? null,
                    'type' => $material->type,
                    'order_number' => $orderNumber++,
                    'active' => $questionData['active'] ?? true,
                ]);

                // Store for reference by title
                $questionKey = $material->id . '|' . $question->title;
                $this->createdQuestions[$questionKey] = $question->id;

                $this->successCount['questions']++;

                // Process test cases for this question
                $this->processTestCasesSheet($question);

            } catch (\Exception $e) {
                $this->errors[] = "Questions Row {$index}: {$e->getMessage()}";
                Log::error("Error processing question row {$index}", ['exception' => $e]);
            }
        }
    }

    protected function processTestCasesSheet(LearningMaterialQuestion $question) {
        $testCasesSheet = $this->spreadsheet->getSheetByName('TestCases');
        if (!$testCasesSheet) {
            throw new \Exception('TestCases sheet not found in the Excel file');
        }

        $testCases = $this->readSheetToCollection($testCasesSheet);

        // Filter by question title or ID
        $filteredTestCases = collect($testCases)->filter(function ($item) use ($question) {
            return
                (isset($item['learning_material_question_id']) && $item['learning_material_question_id'] == $question->id) ||
                (isset($item['question_title']) && $item['question_title'] == $question->title &&
                 isset($item['material_title']) && $item['material_title'] == $question->learningMaterial->title &&
                 isset($item['course_name']) && $item['course_name'] == $question->learningMaterial->course->name);
        });

        foreach ($filteredTestCases as $index => $testCaseData) {
            try {
                // If using question title instead of ID
                if (isset($testCaseData['question_title'], $testCaseData['material_title']) && !isset($testCaseData['learning_material_question_id'])) {
                    $questionKey = $question->learning_material_id . '|' . $testCaseData['question_title'];
                    $questionId = $this->createdQuestions[$questionKey] ?? null;
                    if ($questionId) {
                        $testCaseData['learning_material_question_id'] = $questionId;
                    } else {
                        $this->errors[] = "TestCases Row {$index}: Question '{$testCaseData['question_title']}' in material '{$testCaseData['material_title']}' not found";

                        continue;
                    }
                }

                $validator = Validator::make($testCaseData, [
                    'learning_material_question_id' => 'required|numeric',
                    'description' => 'nullable|string',
                    'input' => 'nullable|string',
                    'expected_output_file' => 'nullable|string',
                    'expected_output_file_extension' => 'nullable|string',
                    'language' => 'nullable|string',
                    'hidden' => 'nullable|boolean',
                    'active' => 'nullable|boolean',
                ]);

                if ($validator->fails() || $testCaseData['learning_material_question_id'] != $question->id) {
                    $this->errors[] = "TestCases Row {$index}: " . implode(', ', $validator->errors()->all());

                    continue;
                }

                // Handle file references for test cases if present in the ZIP
                if ($this->isZipImport && !empty($testCaseData['expected_output_file'])) {
                    [$filePath, $fileExtension] = $this->resolveFile(
                        $testCaseData['expected_output_file'],
                        'learning-material-question-test-cases'  // Changed from learning_material_question_test_cases to learning-material-question-test-cases
                    );

                    if ($filePath) {
                        $testCaseData['expected_output_file'] = $filePath;
                        $testCaseData['expected_output_file_extension'] = $fileExtension ??
                            $testCaseData['expected_output_file_extension'] ?? null;
                    }
                }

                // Create test case
                $testCase = LearningMaterialQuestionTestCase::create([
                    'learning_material_question_id' => $question->id,
                    'description' => $testCaseData['description'] ?? null,
                    'input' => $testCaseData['input'] ?? null,
                    'expected_output_file' => $testCaseData['expected_output_file'] ?? null,
                    'expected_output_file_extension' => $testCaseData['expected_output_file_extension'] ?? null,
                    'language' => $testCaseData['language'] ?? ProgrammingLanguageEnum::PYTHON,
                    'hidden' => $testCaseData['hidden'] ?? true,
                    'active' => $testCaseData['active'] ?? true,
                ]);

                $this->successCount['testCases']++;

            } catch (\Exception $e) {
                $this->errors[] = "TestCases Row {$index}: {$e->getMessage()}";
                Log::error("Error processing test case row {$index}", ['exception' => $e]);
            }
        }
    }

    protected function readSheetToCollection($sheet): array {
        $data = [];
        $headers = [];
        $highestRow = $sheet->getHighestRow();
        $highestColumn = $sheet->getHighestColumn();

        // Get headers (first row)
        for ($col = 'A'; $col <= $highestColumn; $col++) {
            $headers[$col] = $sheet->getCell($col . '1')->getValue();
        }

        // Get data
        for ($row = 2; $row <= $highestRow; $row++) {
            $rowData = [];
            for ($col = 'A'; $col <= $highestColumn; $col++) {
                $value = $sheet->getCell($col . $row)->getValue();
                $header = $headers[$col];
                if (!empty($header)) {
                    $rowData[$header] = $value;
                }
            }
            // Skip completely empty rows
            if (!empty(array_filter($rowData))) {
                $data[] = $rowData;
            }
        }

        return $data;
    }

    /**
     * Find a classroom by name or code
     */
    protected function findClassroomByName($name) {
        return ClassRoom::whereName($name)->first();
    }

    /**
     * Find a teacher by email
     */
    protected function findTeacherByEmail($email) {
        return User::whereEmail($email)
            ->whereHas('roles', function ($query) {
                $query->whereName('teacher');
            })
            ->first();
    }

    /**
     * Parse PDF file and extract structured content
     *
     * @param  string  $filePath  Full path to the PDF file
     * @return array Array containing extracted questions and test cases
     */
    protected function parsePdfContent(string $filePath): array {
        if (!file_exists($filePath)) {
            $this->errors[] = "PDF file not found: {$filePath}";

            return ['questions' => [], 'testCases' => []];
        }

        try {
            // Parse PDF file
            $pdf = $this->pdfParser->parseFile($filePath);
            $text = $pdf->getText();

            // Extract questions section
            $questionsData = $this->extractQuestionsFromPdf($text);

            return $questionsData;
        } catch (\Exception $e) {
            $this->errors[] = 'Error parsing PDF: ' . $e->getMessage();
            Log::error("Error parsing PDF: {$filePath}", ['exception' => $e]);

            return ['questions' => [], 'testCases' => []];
        }
    }

    /**
     * Extract questions and test cases from PDF content
     *
     * @param  string  $pdfText  The text content of the PDF
     * @return array Array of questions with their test cases
     */
    protected function extractQuestionsFromPdf(string $pdfText): array {
        $questions = [];
        $testCases = [];

        // Look for "Pertanyaan Modul" section
        if (preg_match('/Pertanyaan Modul\s*(.*?)(?:\n\s*$|\Z)/s', $pdfText, $questionsSection)) {
            $questionsSectionText = $questionsSection[1];

            // Extract individual questions
            preg_match_all('/Judul:\s*(.*?)\s*Deskripsi:\s*(.*?)\s*Test Case:\s*(.*?)(?=Judul:|$)/s', $questionsSectionText, $matches, PREG_SET_ORDER);

            foreach ($matches as $index => $match) {
                $title = trim($match[1]);
                $description = trim($match[2]);
                $testCaseText = trim($match[3]);

                // Create question array
                $questionData = [
                    'title' => $title,
                    'description' => $description,
                    'order_number' => $index + 1,
                ];
                $questions[] = $questionData;

                // Extract test cases for this question
                $questionTestCases = $this->extractTestCasesFromQuestion($testCaseText, $index);
                $testCases = array_merge($testCases, $questionTestCases);
            }
        }

        return [
            'questions' => $questions,
            'testCases' => $testCases,
        ];
    }

    /**
     * Extract test cases from a question's test case section
     *
     * @param  string  $testCaseText  The test case text from the question
     * @param  int  $questionIndex  The index of the question (for ordering)
     * @return array Array of test cases for the question
     */
    protected function extractTestCasesFromQuestion(string $testCaseText, int $questionIndex): array {
        $testCases = [];

        // Split test case assertions
        $assertions = explode("\n", $testCaseText);
        $assertions = array_filter($assertions, 'trim');

        foreach ($assertions as $index => $assertion) {
            // Clean up the assertion text
            $assertion = trim($assertion);
            if (empty($assertion)) {
                continue;
            }

            // Sanitize list symbols (bullets and numbers with dots)
            // Remove bullet points (•, *, -, etc.)
            $assertion = preg_replace('/^[\s•\*\-\+]+\s*/', '', $assertion);

            // Remove numbered list markers (1., 2., etc.)
            $assertion = preg_replace('/^\d+\.\s*/', '', $assertion);

            // Extract the test code from the assertion
            if (preg_match('/self\.assert(?:In|Equal|True|False)?\((.*)\)/', $assertion, $match)) {
                $testInput = trim($match[0]); // Get the full assertion

                // Create test case
                $testCases[] = [
                    'question_index' => $questionIndex,
                    'description' => 'Test case ' . ($index + 1),
                    'input' => $testInput,
                    'hidden' => false,
                    'order_number' => $index + 1,
                ];
            }
        }

        return $testCases;
    }

    /**
     * Create questions and test cases from extracted PDF content
     *
     * @param  LearningMaterial  $material  The material to associate the questions with
     * @param  array  $extractedContent  The extracted content from the PDF
     */
    protected function createQuestionsFromPdf(LearningMaterial $material, array $extractedContent) {
        $orderNumber = 1;
        $createdQuestions = [];

        // First, create all questions and store them by index
        foreach ($extractedContent['questions'] as $index => $questionData) {
            try {
                // Create question
                $question = LearningMaterialQuestion::create([
                    'learning_material_id' => $material->id,
                    'title' => $questionData['title'],
                    'description' => $questionData['description'] ?? null,
                    'type' => $material->type,
                    'order_number' => $orderNumber++,
                    'active' => true,
                ]);

                // Store for reference by title
                $questionKey = $material->id . '|' . $question->title;
                $this->createdQuestions[$questionKey] = $question->id;

                // Store the created question with its original index (0-based)
                $createdQuestions[$index] = $question;

                $this->successCount['questions']++;
            } catch (\Exception $e) {
                $this->errors[] = "Error creating question from PDF: {$e->getMessage()}";
                Log::error('Error creating question from PDF', ['exception' => $e]);
            }
        }

        // Then, create test cases for each question by matching the original index
        foreach ($extractedContent['testCases'] as $testCaseData) {
            try {
                $questionIndex = $testCaseData['question_index']; // This is the 0-based index

                // Skip if we don't have a question for this index
                if (!isset($createdQuestions[$questionIndex])) {
                    $this->errors[] = "Test case skipped: No question found for index {$questionIndex}";

                    continue;
                }

                // Get the question from our stored array
                $question = $createdQuestions[$questionIndex];

                // Create the test case associated with this specific question
                LearningMaterialQuestionTestCase::create([
                    'learning_material_question_id' => $question->id,
                    'description' => $testCaseData['description'] ?? null,
                    'input' => $testCaseData['input'] ?? null,
                    'hidden' => $testCaseData['hidden'] ?? true,
                    'active' => true,
                    'order_number' => $testCaseData['order_number'] ?? 1,
                ]);

                $this->successCount['testCases']++;
            } catch (\Exception $e) {
                $this->errors[] = "Error creating test case from PDF: {$e->getMessage()}";
                Log::error('Error creating test case from PDF', ['exception' => $e, 'testCaseData' => $testCaseData]);
            }
        }
    }
}
