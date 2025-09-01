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
use setasign\Fpdi\Fpdi;
use Smalot\PdfParser\Parser as PdfParser; // Import FPDI for PDF manipulation
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
        // Directory to store the file
        $storageDirectory = "public/{$targetDirectory}";

        // Always generate a UUID filename base (so cut/full use same UUID)
        $filename = Str::uuid() . '.' . $extension;

        if (strtolower($extension) === 'pdf' && $targetDirectory === 'learning-materials') {
            // Process PDF section cutting and create both cut and full versions with UUID base
            $this->processPdfSectionCuttingForFile($fullPath, $storageDirectory, $filename);
        } else {
            // Copy file to storage normally
            $storagePath = Storage::putFileAs(
                $storageDirectory,
                $fullPath,
                $filename
            );
            $this->uploadedFiles[] = $storagePath;
        }

        // Return just the generated filename and extension
        return [$filename, $extension];
    }

    /**
     * Process PDF section cutting during file resolution
     *
     * @param  string  $sourcePath  Path to the source PDF file
     * @param  string  $storageDirectory  Storage directory path
     * @param  string  $baseFilename  Base filename to use
     */
    protected function processPdfSectionCuttingForFile(string $sourcePath, string $storageDirectory, string $baseFilename): void {
        try {
            // Parse PDF and extract pages
            $pdfDocument = $this->pdfParser->parseFile($sourcePath);
            $pages = method_exists($pdfDocument, 'getPages') ? $pdfDocument->getPages() : [];
            // Detect page where "Pertanyaan" section starts
            $pertanyaanPage = null;
            foreach ($pages as $index => $page) {
                $text = $page->getText();
                if (stripos($text, 'Pertanyaan') !== false && $this->isValidSectionHeader($text, 0)) {
                    $pertanyaanPage = $index + 1;
                    break;
                }
            }
            // Prepare filenames
            $extension = pathinfo($sourcePath, PATHINFO_EXTENSION);
            // Derive the original base name (UUID) from baseFilename
            $baseName = pathinfo($baseFilename, PATHINFO_FILENAME);
            // Generate cut PDF containing pages before the Pertanyaan section
            if ($pertanyaanPage !== null && $pertanyaanPage > 1) {
                $fpdi = new Fpdi;
                $totalPages = $fpdi->setSourceFile($sourcePath);
                for ($i = 1; $i < $pertanyaanPage; $i++) {
                    $tplId = $fpdi->importPage($i);
                    $fpdi->addPage();
                    $fpdi->useTemplate($tplId);
                }
                // Use the original UUID for cut PDF
                $cuttedFilename = $baseName . '.' . $extension;
                $pdfStream = $fpdi->Output('', 'S');
                // Store the cut PDF under the same base name
                Storage::put("{$storageDirectory}/{$cuttedFilename}", $pdfStream);
                $this->uploadedFiles[] = "{$storageDirectory}/{$cuttedFilename}";
            } else {
                // No valid split point, fallback to storing original PDF as cut version
                $cuttedFilename = $baseName . '.' . $extension;
                $storagePath = Storage::putFileAs(
                    $storageDirectory,
                    $sourcePath,
                    $cuttedFilename
                );
                $this->uploadedFiles[] = $storagePath;
            }
            // Always store full original version with "_full" suffix using the same base
            $fullFilename = $baseName . '_full.' . $extension;
            $fullPath = Storage::putFileAs(
                $storageDirectory,
                $sourcePath,
                $fullFilename
            );
            $this->uploadedFiles[] = $fullPath;
            Log::info('Processed PDF cutting', [
                'source' => $sourcePath,
                'cutted' => $cuttedFilename,
                'full' => $fullFilename,
                'pertanyaan_page' => $pertanyaanPage,
            ]);
        } catch (\Exception $e) {
            // On failure, fallback to normal storage
            $this->errors[] = "Error processing PDF cutting for file: {$e->getMessage()}";
            Log::error('Error processing PDF cutting', ['exception' => $e, 'sourcePath' => $sourcePath]);
            $storagePath = Storage::putFileAs(
                $storageDirectory,
                $sourcePath,
                $baseFilename
            );
            $this->uploadedFiles[] = $storagePath;
        }
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

                    // Get the original path in the extracted directory before it was copied to storage
                    $originalPath = $this->extractDir . DIRECTORY_SEPARATOR . str_replace(['\\', '/'], DIRECTORY_SEPARATOR, $materialData['file']);

                    // Use the full PDF version for question extraction
                    $baseName = pathinfo($materialData['file'], PATHINFO_FILENAME);
                    $fullFilename = $baseName . '_full.' . $materialData['file_extension'];
                    $fullPdfPath = storage_path('app/public/learning-materials/' . $fullFilename);
                    // Fallback to cut PDF if full version does not exist
                    if (!file_exists($fullPdfPath)) {
                        $fallbackCut = storage_path('app/public/learning-materials/' . $materialData['file']);
                        if (file_exists($fallbackCut)) {
                            $fullPdfPath = $fallbackCut;
                        }
                    }
                    // Parse the selected PDF to extract questions and test cases
                    $extractedContent = $this->parsePdfContent($fullPdfPath);

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

            // Extract questions section from text (section cutting is handled during file resolution)
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
     * @return array Array of questions with their test cases, pre-code, and example code
     */
    protected function extractQuestionsFromPdf(string $pdfText): array {
        $questions = [];
        $testCases = [];

        $pertanyaanPosition = $this->findPertanyaanSectionPosition($pdfText);

        Log::info('PDF section extraction started', [
            'pertanyaan_position' => $pertanyaanPosition,
            'total_text_length' => strlen($pdfText),
        ]);

        if ($pertanyaanPosition !== false) {
            // Extract content from the Pertanyaan section onwards
            $questionsSectionText = substr($pdfText, $pertanyaanPosition);

            // Clean up section text by removing the "Pertanyaan" header itself
            $questionsSectionText = preg_replace('/^.*?Pertanyaan[^\n]*\n/i', '', $questionsSectionText);

            // Split questions by looking for "Judul:" patterns, but capture everything between them
            $questionBlocks = preg_split('/(?=\d+\.\s*Judul:)/i', $questionsSectionText, -1, PREG_SPLIT_NO_EMPTY);

            $validQuestionIndex = 0; // Track the actual valid question index for test case mapping

            foreach ($questionBlocks as $blockIndex => $questionBlock) {
                if (trim($questionBlock) === '') {
                    continue;
                }

                // Extract title and description using more flexible patterns
                if (preg_match('/Judul:\s*(.*?)(?:\s*Deskripsi:\s*(.*?))?(?=(?:Pre-code:|Contoh Kode:|Test Case:|$))/s', $questionBlock, $titleMatch)) {
                    $title = trim($titleMatch[1]);
                    $description = isset($titleMatch[2]) ? trim($titleMatch[2]) : '';

                    // Skip if title contains code indicators (likely false positive)
                    if ($this->containsCodeIndicators($title)) {
                        continue;
                    }

                    // Extract Pre-code and Contoh Kode from this specific question block
                    $preCode = $this->extractPreCodeSection($questionBlock);
                    $contohKode = $this->extractContohKodeSection($questionBlock);

                    // Extract test case content
                    $testCaseText = '';
                    if (preg_match('/Test Case:\s*(.*?)(?=\d+\.\s*Judul:|$)/s', $questionBlock, $testMatch)) {
                        $testCaseText = trim($testMatch[1]);
                    }

                    Log::info('Question extraction results', [
                        'block_index' => $blockIndex + 1,
                        'valid_question_index' => $validQuestionIndex,
                        'title' => $title,
                        'description_length' => strlen($description),
                        'pre_code_found' => !is_null($preCode),
                        'contoh_kode_found' => !is_null($contohKode),
                        'pre_code_length' => $preCode ? strlen($preCode) : 0,
                        'contoh_kode_length' => $contohKode ? strlen($contohKode) : 0,
                        'test_case_length' => strlen($testCaseText),
                    ]);

                    // Create question array with Pre-code and Contoh Kode from this question
                    $questionData = [
                        'title' => $title,
                        'description' => $description,
                        'order_number' => $validQuestionIndex + 1,
                        'pre_code' => $preCode,
                        'example_code' => $contohKode,
                    ];
                    $questions[] = $questionData;

                    // Extract test cases for this question using the valid question index
                    if (!empty($testCaseText)) {
                        $questionTestCases = $this->extractTestCasesFromQuestion($testCaseText, $validQuestionIndex);
                        $testCases = array_merge($testCases, $questionTestCases);
                    }

                    // Increment the valid question index only after successfully adding a question
                    $validQuestionIndex++;
                }
            }
        }

        return [
            'questions' => $questions,
            'testCases' => $testCases,
        ];
    }

    /**
     * Check if text contains code indicators
     *
     * @param  string  $text  Text to check
     * @return bool True if contains code indicators
     */
    protected function containsCodeIndicators(string $text): bool {
        $codeIndicators = [
            'def ',
            'class ',
            'import ',
            'from ',
            'print(',
            'return ',
            '# ',
            '//',
            '/*',
            '*/',
        ];

        foreach ($codeIndicators as $indicator) {
            if (stripos($text, $indicator) !== false) {
                return true;
            }
        }

        return false;
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
                    'hidden' => true,
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
                // Create question with Pre-code and Example code
                $question = LearningMaterialQuestion::create([
                    'learning_material_id' => $material->id,
                    'title' => $questionData['title'],
                    'description' => $questionData['description'] ?? null,
                    'type' => $material->type,
                    'order_number' => $orderNumber++,
                    'pre_code' => $questionData['pre_code'] ?? null,
                    'example_code' => $questionData['example_code'] ?? null,
                    'active' => true,
                ]);

                Log::info('Question created from PDF with code sections', [
                    'question_id' => $question->id,
                    'title' => $question->title,
                    'has_pre_code' => !empty($question->pre_code),
                    'has_example_code' => !empty($question->example_code),
                    'pre_code_length' => $question->pre_code ? strlen($question->pre_code) : 0,
                    'example_code_length' => $question->example_code ? strlen($question->example_code) : 0,
                ]);

                // Store for reference by title
                $questionKey = $material->id . '|' . $question->title;
                $this->createdQuestions[$questionKey] = $question->id;

                // Store the created question with its original index (0-based)
                $createdQuestions[$index] = $question;

                $this->successCount['questions']++;
            } catch (\Exception $e) {
                $this->errors[] = "Error creating question from PDF: {$e->getMessage()}";
                Log::error('Error creating question from PDF', ['exception' => $e, 'questionData' => $questionData]);
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

    /**
     * Find the position of "Pertanyaan" section in PDF text
     *
     * @param  string  $pdfText  The PDF content text
     * @return int|false Position of the section or false if not found
     */
    protected function findPertanyaanSectionPosition(string $pdfText): int|false {
        // First, look for the specific DBSR line pattern
        $dbsrPattern = '/------------------ DBSR Line ------------------\s*(?:\n|\r\n?)\s*Pertanyaan\s*(?:\n|\r\n?)/mi';
        if (preg_match($dbsrPattern, $pdfText, $matches, PREG_OFFSET_CAPTURE)) {
            // Find the position of "Pertanyaan" after the DBSR line
            $dbsrLineEnd = $matches[0][1] + strlen($matches[0][0]);
            $pertanyaanPosition = strpos($pdfText, 'Pertanyaan', $matches[0][1]);
            if ($pertanyaanPosition !== false) {
                return $pertanyaanPosition;
            }
        }

        // Fallback to enhanced pattern matching
        // Look for "Pertanyaan" that's likely a section header (not in code comments)
        $patterns = [
            '/(?:^|\n)\s*(?:Pertanyaan\s*Modul|Pertanyaan)\s*(?:\n|$)/mi',
            '/(?:^|\n)\s*(?:\d+\.\s*)?Pertanyaan\s*(?:\n|$)/mi',
            '/(?:^|\n)\s*(?:##\s*)?Pertanyaan\s*(?:\n|$)/mi',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $pdfText, $matches, PREG_OFFSET_CAPTURE)) {
                // Additional validation to ensure this isn't in a code section
                $position = $matches[0][1];
                if ($this->isValidSectionHeader($pdfText, $position)) {
                    return $position;
                }
            }
        }

        return false;
    }

    /**
     * Validate if the found position is a valid section header (not in code)
     *
     * @param  string  $pdfText  The PDF content text
     * @param  int  $position  Position to validate
     * @return bool True if valid section header
     */
    protected function isValidSectionHeader(string $pdfText, int $position): bool {
        // Get context around the position
        $contextStart = max(0, $position - 200);
        $contextEnd = min(strlen($pdfText), $position + 50);
        $context = substr($pdfText, $contextStart, $contextEnd - $contextStart);

        // Check if we're in a code section by looking for code indicators
        $codeIndicators = [
            'Pre-code',
            'Contoh Kode',
            'def ',
            'class ',
            'import ',
            'from ',
            '```',
            '    #',  // Indented comment
            'print(',
        ];

        $linesBeforePosition = explode("\n", substr($pdfText, $contextStart, $position - $contextStart));
        $recentLines = array_slice($linesBeforePosition, -5); // Last 5 lines before position

        foreach ($recentLines as $line) {
            foreach ($codeIndicators as $indicator) {
                if (stripos($line, $indicator) !== false) {
                    return false; // Likely in a code section
                }
            }
        }

        return true;
    }

    /**
     * Extract content before "Pertanyaan" section
     *
     * @param  string  $pdfText  The PDF content text
     * @param  int  $position  Position where "Pertanyaan" section starts
     * @return string Content before the section
     */
    protected function extractContentBeforePertanyaan(string $pdfText, int $position): string {
        return trim(substr($pdfText, 0, $position));
    }

    /**
     * Create a cutted version of the PDF (without Pertanyaan section)
     *
     * @param  string  $originalPath  Path to original PDF
     * @param  string  $cuttedContent  Content without Pertanyaan section
     * @param  string  $fileName  Original filename without extension
     * @param  string  $extension  File extension
     */
    protected function createCuttedPdfVersion(string $originalPath, string $cuttedContent, string $fileName, string $extension): void {
        try {
            // Generate unique filename for cutted version
            $cuttedFileName = Str::uuid() . '.' . $extension;
            $storageDirectory = 'public/learning-materials';

            // Create a text file with the cutted content for now
            // Note: In a production environment, you might want to use a PDF library
            // like TCPDF or FPDF to create a proper PDF from the cutted content
            $cuttedTextFileName = Str::uuid() . '_cutted.txt';
            $textFilePath = Storage::put(
                $storageDirectory . '/' . $cuttedTextFileName,
                $cuttedContent
            );

            // For the actual PDF file, we'll copy the original and mark it as cutted
            // In production, you would generate a new PDF with only the cutted content
            $cuttedPath = Storage::putFileAs(
                $storageDirectory,
                $originalPath,
                $cuttedFileName
            );

            $this->uploadedFiles[] = $cuttedPath;

            Log::info('Created cutted PDF version', [
                'original' => $originalPath,
                'cutted' => $cuttedPath,
                'cutted_text' => $textFilePath,
                'content_length' => strlen($cuttedContent),
            ]);

        } catch (\Exception $e) {
            $this->errors[] = "Error creating cutted PDF version: {$e->getMessage()}";
            Log::error('Error creating cutted PDF version', ['exception' => $e]);
        }
    }

    /**
     * Create a full version of the PDF with "_full" postfix
     *
     * @param  string  $originalPath  Path to original PDF
     * @param  string  $fileName  Original filename without extension
     * @param  string  $extension  File extension
     */
    protected function createFullPdfVersion(string $originalPath, string $fileName, string $extension): void {
        try {
            // Generate unique filename for full version with "_full" postfix
            $fullFileName = Str::uuid() . '_full.' . $extension;
            $storageDirectory = 'public/learning-materials';

            // Copy original file as full version
            $fullPath = Storage::putFileAs(
                $storageDirectory,
                $originalPath,
                $fullFileName
            );

            $this->uploadedFiles[] = $fullPath;

            Log::info('Created full PDF version', [
                'original' => $originalPath,
                'full' => $fullPath,
            ]);

        } catch (\Exception $e) {
            $this->errors[] = "Error creating full PDF version: {$e->getMessage()}";
            Log::error('Error creating full PDF version', ['exception' => $e]);
        }
    }

    /**
     * Extract Pre-code section from PDF content
     *
     * @param  string  $pdfText  The PDF content text
     * @return string|null Pre-code content or null if not found
     */
    public function extractPreCodeSection(string $pdfText): ?string {
        // Enhanced patterns to find "Pre-code" section - stop at next section boundary
        $patterns = [
            // Stop at Contoh Kode, Test Case, or next numbered item
            '/(?:^|\n)\s*(?:Pre-code|pre-code|PRE-CODE)\s*[:\-]?\s*\n(.*?)(?=\n\s*(?:Contoh\s+Kode|Test\s+Case|(?:\d+\.\s*)?(?:Judul|Pre-code|Contoh\s+Kode|Test\s+Case)|$))/si',
            '/(?:^|\n)\s*(?:\d+\.?\s*)?(?:Pre-code|pre-code|PRE-CODE)\s*[:\-]?\s*\n(.*?)(?=\n\s*(?:Contoh\s+Kode|Test\s+Case|(?:\d+\.\s*)?(?:Judul|Pre-code|Contoh\s+Kode|Test\s+Case)|$))/si',
            '/(?:^|\n)\s*(?:##\s*)?(?:Pre-code|pre-code|PRE-CODE)\s*[:\-]?\s*\n(.*?)(?=\n\s*(?:Contoh\s+Kode|Test\s+Case|(?:\d+\.\s*)?(?:Judul|Pre-code|Contoh\s+Kode|Test\s+Case)|$))/si',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $pdfText, $matches)) {
                $preCode = trim($matches[1]);

                // Clean up the extracted code
                $preCode = $this->cleanExtractedCode($preCode);

                // Additional filtering to remove test case content if it got included
                $preCode = $this->removeTestCaseContent($preCode);

                // Only return if we have substantial content
                if (strlen($preCode) > 10) {
                    Log::info('Pre-code section extracted', [
                        'length' => strlen($preCode),
                        'preview' => substr($preCode, 0, 100),
                    ]);

                    return $preCode;
                }
            }
        }

        Log::info('No Pre-code section found in PDF');

        return null;
    }

    /**
     * Extract Contoh Kode (Example Code) section from PDF content
     *
     * @param  string  $pdfText  The PDF content text
     * @return string|null Example code content or null if not found
     */
    public function extractContohKodeSection(string $pdfText): ?string {
        // Enhanced patterns to find "Contoh Kode" section - stop at next section boundary
        $patterns = [
            // Stop at Test Case or next numbered item
            '/(?:^|\n)\s*(?:Contoh\s+Kode|contoh\s+kode|CONTOH\s+KODE|Example\s+Code)\s*[:\-]?\s*\n(.*?)(?=\n\s*(?:Test\s+Case|(?:\d+\.\s*)?(?:Judul|Pre-code|Contoh\s+Kode|Test\s+Case)|$))/si',
            '/(?:^|\n)\s*(?:\d+\.?\s*)?(?:Contoh\s+Kode|contoh\s+kode|CONTOH\s+KODE|Example\s+Code)\s*[:\-]?\s*\n(.*?)(?=\n\s*(?:Test\s+Case|(?:\d+\.\s*)?(?:Judul|Pre-code|Contoh\s+Kode|Test\s+Case)|$))/si',
            '/(?:^|\n)\s*(?:##\s*)?(?:Contoh\s+Kode|contoh\s+kode|CONTOH\s+KODE|Example\s+Code)\s*[:\-]?\s*\n(.*?)(?=\n\s*(?:Test\s+Case|(?:\d+\.\s*)?(?:Judul|Pre-code|Contoh\s+Kode|Test\s+Case)|$))/si',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $pdfText, $matches)) {
                $contohKode = trim($matches[1]);

                // Clean up the extracted code
                $contohKode = $this->cleanExtractedCode($contohKode);

                // Additional filtering to remove test case content if it got included
                $contohKode = $this->removeTestCaseContent($contohKode);

                // Only return if we have substantial content
                if (strlen($contohKode) > 10) {
                    Log::info('Contoh Kode section extracted', [
                        'length' => strlen($contohKode),
                        'preview' => substr($contohKode, 0, 100),
                    ]);

                    return $contohKode;
                }
            }
        }

        Log::info('No Contoh Kode section found in PDF');

        return null;
    }

    /**
     * Remove test case content from extracted code
     *
     * @param  string  $code  Raw extracted code that might contain test cases
     * @return string Cleaned code without test cases
     */
    protected function removeTestCaseContent(string $code): string {
        // Remove test case patterns that might have been included
        $testCasePatterns = [
            // Remove content that starts with test case indicators
            '/(?:^|\n)\s*(?:Test\s+Case|TEST\s+CASE|test\s+case)\s*[:\-]?\s*.*$/mi',
            '/(?:^|\n)\s*(?:assert|assertEqual|assertTrue|assertFalse|print\(|test_)\s*.*$/mi',
            '/(?:^|\n)\s*(?:Input|Output|Expected)\s*[:\-].*$/mi',
            '/(?:^|\n)\s*(?:Hasil|Result)\s*[:\-].*$/mi',
            // Remove lines that look like test assertions
            '/(?:^|\n)\s*(?:self\.assert|assert\s+|# Test|#.*test.*|\/\/.*test.*)\s*.*$/mi',
        ];

        foreach ($testCasePatterns as $pattern) {
            $code = preg_replace($pattern, '', $code);
        }

        // Clean up extra whitespace after removal
        $lines = explode("\n", $code);
        $cleanedLines = [];

        foreach ($lines as $line) {
            $trimmedLine = trim($line);
            // Skip lines that are clearly test-related
            if (!empty($trimmedLine) &&
                !preg_match('/^(?:test|assert|expected|input|output|hasil|result)/i', $trimmedLine)) {
                $cleanedLines[] = $line;
            }
        }

        return implode("\n", $cleanedLines);
    }

    /**
     * Clean extracted code by removing extra whitespace and formatting
     *
     * @param  string  $code  Raw extracted code
     * @return string Cleaned code
     */
    protected function cleanExtractedCode(string $code): string {
        // Remove excessive whitespace while preserving code structure
        $lines = explode("\n", $code);
        $cleanedLines = [];

        foreach ($lines as $line) {
            // Skip empty lines at the beginning and end, but keep them in the middle
            $trimmedLine = rtrim($line);
            if (!empty($cleanedLines) || !empty($trimmedLine)) {
                $cleanedLines[] = $trimmedLine;
            }
        }

        // Remove trailing empty lines
        while (!empty($cleanedLines) && empty(end($cleanedLines))) {
            array_pop($cleanedLines);
        }

        $cleanedCode = implode("\n", $cleanedLines);

        // Remove common PDF artifacts
        $cleanedCode = preg_replace('/\s*```\s*/', '', $cleanedCode); // Remove code block markers
        $cleanedCode = preg_replace('/^\s*(?:python|py)\s*\n/i', '', $cleanedCode); // Remove language indicators

        return trim($cleanedCode);
    }
}
