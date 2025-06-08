<?php

namespace App\Services\User;

use App\Models\School;
use App\Models\User;
use App\Support\Enums\RoleEnum;
use App\Support\Interfaces\Services\User\StudentImportServiceInterface;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class StudentImportService implements StudentImportServiceInterface {
    protected $spreadsheet;
    protected $errors = [];
    protected $successCount = 0;
    protected $createdStudents = [];

    public function import(string $filePath): array {
        try {
            // Determine file type and load accordingly
            $fileExtension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));

            if ($fileExtension === 'csv') {
                $data = $this->loadCsvFile($filePath);
            } else {
                // Load as Excel file
                $this->spreadsheet = IOFactory::load($filePath);
                $data = null; // Will use spreadsheet processing
            }

            DB::beginTransaction();

            if ($fileExtension === 'csv') {
                $this->processCsvData($data);
            } else {
                $this->processStudentsSheet();
            }

            // If there are errors, throw a validation exception before committing
            if (count($this->errors) > 0) {
                DB::rollBack();
                throw ValidationException::withMessages([
                    'file' => 'Import has errors',
                    'details' => $this->errors,
                ]);
            }

            DB::commit();

            return [
                'success' => true,
                'message' => 'Import completed successfully',
                'stats' => [
                    'students' => $this->successCount,
                ],
                'errors' => $this->errors,
            ];
        } catch (ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Student import failed: ' . $e->getMessage(), ['exception' => $e]);

            return [
                'success' => false,
                'message' => 'Import failed: ' . $e->getMessage(),
                'errors' => $this->errors,
            ];
        }
    }

    public function preview(string $filePath): array {
        try {
            $fileExtension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));

            if ($fileExtension === 'csv') {
                $data = $this->loadCsvFile($filePath);
                $previewData = [
                    'students' => $data,
                    'stats' => [
                        'students' => count($data),
                    ],
                ];
            } else {
                // Load as Excel file
                $spreadsheet = IOFactory::load($filePath);
                $studentsSheet = $spreadsheet->getSheetByName('Students');

                $previewData = [
                    'students' => $studentsSheet ? $this->readSheetToCollection($studentsSheet) : [],
                    'stats' => [
                        'students' => count($studentsSheet ? $this->readSheetToCollection($studentsSheet) : []),
                    ],
                ];
            }

            return [
                'success' => true,
                'preview' => $previewData,
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Preview generation failed: ' . $e->getMessage(),
            ];
        }
    }

    public function generateTemplate() {
        // Create new Spreadsheet object
        $spreadsheet = new Spreadsheet;

        // Generate the Instructions sheet first
        $this->createInstructionsSheet($spreadsheet);

        // Generate the Students sheet
        $this->createStudentsSheet($spreadsheet);

        // Create writer
        $writer = new Xlsx($spreadsheet);

        // Create temp file
        $tempFile = storage_path('app/temp/student_import_template.xlsx');
        if (!file_exists(dirname($tempFile))) {
            mkdir(dirname($tempFile), 0755, true);
        }

        // Save the spreadsheet to the temp file
        $writer->save($tempFile);

        // Set a custom filename with the current date
        $filename = 'student_import_template_' . now()->format('Y-m-d') . '.xlsx';

        return response()->download(
            $tempFile,
            $filename,
            [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            ]
        )->deleteFileAfterSend(true);
    }

    public function generateCsvTemplate() {
        // Create CSV content
        $csvContent = "name,email,nim,phone\n";
        $csvContent .= "John Doe,john.doe@example.com,STD001,+1234567890\n";
        $csvContent .= "Jane Smith,jane.smith@example.com,STD002,+1234567891\n";

        // Create temp file
        $tempFile = storage_path('app/temp/student_import_template.csv');
        if (!file_exists(dirname($tempFile))) {
            mkdir(dirname($tempFile), 0755, true);
        }

        file_put_contents($tempFile, $csvContent);

        // Set a custom filename with the current date
        $filename = 'student_import_template_' . now()->format('Y-m-d') . '.csv';

        return response()->download(
            $tempFile,
            $filename,
            [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            ]
        )->deleteFileAfterSend(true);
    }

    /**
     * Process the Students sheet
     */
    private function processStudentsSheet() {
        $sheet = $this->spreadsheet->getSheetByName('Students');

        if (!$sheet) {
            $this->errors[] = 'Students sheet not found in the Excel file';

            return;
        }

        $highestRow = $sheet->getHighestRow();
        $headers = [];

        // Read headers from row 1
        for ($col = 'A'; $col <= 'Z'; $col++) {
            $value = $sheet->getCell($col . '1')->getValue();
            if ($value) {
                $headers[$col] = $value;
            } else {
                break;
            }
        }

        // Validate required headers
        $requiredHeaders = ['name', 'email', 'nim'];
        $missingHeaders = array_diff($requiredHeaders, array_values($headers));
        if (!empty($missingHeaders)) {
            $this->errors[] = 'Missing required headers: ' . implode(', ', $missingHeaders);

            return;
        }

        // Get current user's school if they are a school admin
        /** @var User $currentUser */
        $currentUser = Auth::user();
        $userSchool = null;
        if ($currentUser && $currentUser->hasRole(RoleEnum::SCHOOL_ADMIN->value)) {
            $userSchool = $currentUser->schools()->first();
            if (!$userSchool) {
                $this->errors[] = 'School admin must be assigned to a school to import students';

                return;
            }
        }

        // Process each row
        for ($row = 2; $row <= $highestRow; $row++) {
            $rowData = [];
            foreach ($headers as $col => $header) {
                $cellValue = $sheet->getCell($col . $row)->getValue();
                $rowData[$header] = $cellValue;
            }

            // Skip empty rows
            if (empty($rowData['name']) && empty($rowData['email']) && empty($rowData['nim'])) {
                continue;
            }

            $this->processStudentRow($rowData, $row, $userSchool);
        }
    }

    /**
     * Process a single student row
     */
    private function processStudentRow(array $rowData, int $rowNumber, ?School $userSchool) {
        try {
            // Validate the row data
            // Convert numeric fields to strings for validation (Excel reads numbers as numeric types)
            if (isset($rowData['nim'])) {
                $rowData['nim'] = (string) $rowData['nim'];
            }
            if (isset($rowData['phone'])) {
                $rowData['phone'] = (string) $rowData['phone'];
            }

            $validator = Validator::make($rowData, [
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'nim' => 'required|string|max:20|unique:users,username',
                'phone' => 'nullable|string|max:20',
            ]);

            if ($validator->fails()) {
                $this->errors[] = "Row {$rowNumber}: " . implode(', ', $validator->errors()->all());

                return;
            }

            // Create the student
            $student = User::create([
                'name' => $rowData['name'],
                'email' => $rowData['email'],
                'username' => $rowData['nim'], // Map nim to username
                'phone' => $rowData['phone'] ?? null,
                'password' => Hash::make('password'), // Default password
            ]);

            // Assign student role using Spatie Permission
            $student->assignRole(RoleEnum::STUDENT->value);

            // Assign to school if available
            if ($userSchool) {
                $student->schools()->attach($userSchool->id, [
                    'role' => RoleEnum::STUDENT->value,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            $this->createdStudents[] = $student;
            $this->successCount++;

            Log::info("Student created: {$student->name} ({$student->email})");

        } catch (\Exception $e) {
            $this->errors[] = "Row {$rowNumber}: " . $e->getMessage();
            Log::error("Failed to create student at row {$rowNumber}: " . $e->getMessage());
        }
    }

    /**
     * Read a sheet and convert to collection
     */
    private function readSheetToCollection($sheet): array {
        $data = [];
        $highestRow = $sheet->getHighestRow();
        $headers = [];

        // Read headers from row 1
        for ($col = 'A'; $col <= 'Z'; $col++) {
            $value = $sheet->getCell($col . '1')->getValue();
            if ($value) {
                $headers[$col] = $value;
            } else {
                break;
            }
        }

        // Read data rows
        for ($row = 2; $row <= $highestRow; $row++) {
            $rowData = [];
            $hasData = false;

            foreach ($headers as $col => $header) {
                $cellValue = $sheet->getCell($col . $row)->getValue();
                $rowData[$header] = $cellValue;
                if (!empty($cellValue)) {
                    $hasData = true;
                }
            }

            if ($hasData) {
                $data[] = $rowData;
            }
        }

        return $data;
    }

    /**
     * Create the Instructions sheet with help text
     */
    private function createInstructionsSheet(Spreadsheet $spreadsheet) {
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Instructions');

        $sheet->setCellValue('A1', 'Student Import Instructions');
        $sheet->setCellValue('A3', '1. Fill out the Students sheet with student information');
        $sheet->setCellValue('A4', '2. Required fields: name, email, nim');
        $sheet->setCellValue('A5', '3. Optional fields: phone');
        $sheet->setCellValue('A7', 'Notes:');
        $sheet->setCellValue('A8', '- Each student will be assigned a default password: "password"');
        $sheet->setCellValue('A9', '- Students should change their password after first login');
        $sheet->setCellValue('A10', '- Email addresses must be unique');
        $sheet->setCellValue('A11', '- NIM (Student ID) must be unique');
        $sheet->setCellValue('A12', '- If you are a school admin, students will be automatically assigned to your school');
        $sheet->setCellValue('A13', '- Superadmins can import students without school assignment');

        // Style the headers
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(14);
        $sheet->getStyle('A7')->getFont()->setBold(true);
    }

    /**
     * Create the Students sheet with headers and sample data
     */
    private function createStudentsSheet(Spreadsheet $spreadsheet) {
        $studentsSheet = $spreadsheet->createSheet();
        $studentsSheet->setTitle('Students');

        // Set headers
        $headers = ['name', 'email', 'nim', 'phone'];
        $col = 'A';
        foreach ($headers as $header) {
            $studentsSheet->setCellValue($col . '1', $header);
            $studentsSheet->getStyle($col . '1')->getFont()->setBold(true);
            $col++;
        }

        // Add sample data
        $studentsSheet->setCellValue('A2', 'John Doe');
        $studentsSheet->setCellValue('B2', 'john.doe@example.com');
        $studentsSheet->setCellValue('C2', 'STD001');
        $studentsSheet->setCellValue('D2', '+1234567890');

        $studentsSheet->setCellValue('A3', 'Jane Smith');
        $studentsSheet->setCellValue('B3', 'jane.smith@example.com');
        $studentsSheet->setCellValue('C3', 'STD002');
        $studentsSheet->setCellValue('D3', '+1234567891');

        // Auto-size columns
        foreach (range('A', 'D') as $col) {
            $studentsSheet->getColumnDimension($col)->setAutoSize(true);
        }

        // Set the active sheet to Instructions
        $spreadsheet->setActiveSheetIndex(0);
    }

    /**
     * Load CSV file and return data as array
     */
    private function loadCsvFile(string $filePath): array {
        $data = [];
        $headers = [];

        if (($handle = fopen($filePath, 'r')) !== false) {
            $rowIndex = 0;

            while (($row = fgetcsv($handle, 1000, ',')) !== false) {
                if ($rowIndex === 0) {
                    // First row contains headers
                    $headers = array_map('trim', $row);
                    $headers = array_map('strtolower', $headers);
                } else {
                    // Data rows
                    if (count($row) >= count($headers)) {
                        $rowData = [];
                        foreach ($headers as $index => $header) {
                            $rowData[$header] = isset($row[$index]) ? trim($row[$index]) : '';
                        }

                        // Skip empty rows
                        if (!empty(array_filter($rowData))) {
                            $data[] = $rowData;
                        }
                    }
                }
                $rowIndex++;
            }

            fclose($handle);
        }

        return $data;
    }

    /**
     * Process CSV data
     */
    private function processCsvData(array $data): void {
        $requiredFields = ['name', 'email', 'nim'];

        foreach ($data as $index => $row) {
            $rowNumber = $index + 2; // +2 because index starts at 0 and we skip header row

            // Validate required fields
            $missingFields = [];
            foreach ($requiredFields as $field) {
                if (empty($row[$field])) {
                    $missingFields[] = $field;
                }
            }

            if (!empty($missingFields)) {
                $this->errors[] = "Row {$rowNumber}: Missing required fields: " . implode(', ', $missingFields);

                continue;
            }

            // Validate email format
            if (!filter_var($row['email'], FILTER_VALIDATE_EMAIL)) {
                $this->errors[] = "Row {$rowNumber}: Invalid email format: {$row['email']}";

                continue;
            }

            // Check if email already exists
            if (User::where('email', $row['email'])->exists()) {
                $this->errors[] = "Row {$rowNumber}: Email already exists: {$row['email']}";

                continue;
            }

            // Check if NIM already exists
            if (User::where('username', $row['nim'])->exists()) {
                $this->errors[] = "Row {$rowNumber}: NIM already exists: {$row['nim']}";

                continue;
            }

            try {
                // Create the user
                $user = User::create([
                    'name' => $row['name'],
                    'email' => $row['email'],
                    'username' => $row['nim'], // Using NIM as username
                    'phone' => $row['phone'] ?? null,
                    'password' => Hash::make('password'), // Default password
                ]);

                // Assign student role
                $user->assignRole(RoleEnum::STUDENT->value);

                // If user is school admin, assign students to their school
                /** @var User $currentUser */
                $currentUser = Auth::user();
                if ($currentUser && $currentUser->hasRole(RoleEnum::SCHOOL_ADMIN->value)) {
                    $adminSchools = $currentUser->schools()->get();

                    foreach ($adminSchools as $school) {
                        $user->schools()->attach($school->id, [
                            'role' => RoleEnum::STUDENT->value,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    }
                }

                $this->createdStudents[] = $user;
                $this->successCount++;

                Log::info('Student created successfully', [
                    'user_id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'nim' => $row['nim'],
                ]);

            } catch (\Exception $e) {
                $this->errors[] = "Row {$rowNumber}: Failed to create student: " . $e->getMessage();
                Log::error('Failed to create student from CSV', [
                    'row' => $row,
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }

    public function previewCsv(\Illuminate\Http\UploadedFile $file): array {
        try {
            // Save uploaded file temporarily
            $tempPath = $file->store('temp', 'local');
            $fullPath = storage_path('app/' . $tempPath);

            $data = $this->loadCsvFile($fullPath);

            // Clean up temp file
            unlink($fullPath);

            return [
                'success' => true,
                'data' => $data, // Show first 10 rows for preview
                'headers' => !empty($data) ? array_keys($data[0]) : [],
                'total_rows' => count($data),
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'CSV preview failed: ' . $e->getMessage(),
            ];
        }
    }

    public function previewExcel(\Illuminate\Http\UploadedFile $file): array {
        try {
            // Save uploaded file temporarily
            $tempPath = $file->store('temp', 'local');
            $fullPath = storage_path('app/' . $tempPath);

            $spreadsheet = IOFactory::load($fullPath);
            $studentsSheet = $spreadsheet->getSheetByName('Students');

            if (!$studentsSheet) {
                return [
                    'success' => false,
                    'message' => 'Students sheet not found in Excel file',
                ];
            }

            $data = $this->readSheetToCollection($studentsSheet);

            // Clean up temp file
            unlink($fullPath);

            return [
                'success' => true,
                'data' => $data, // Show first 10 rows for preview
                'headers' => !empty($data) ? array_keys($data[0]) : [],
                'total_rows' => count($data),
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Excel preview failed: ' . $e->getMessage(),
            ];
        }
    }

    public function generateExcelTemplate() {
        return $this->generateTemplate();
    }
}
