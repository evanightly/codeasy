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

                // Process questions for this material
                $this->processQuestionsSheet($material);

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
}
