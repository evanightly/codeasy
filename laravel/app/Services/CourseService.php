<?php

namespace App\Services;

use Adobrovolsky97\LaravelRepositoryServicePattern\Services\BaseCrudService;
use App\Repositories\CourseRepository;
use App\Support\Enums\LearningMaterialTypeEnum;
use App\Support\Enums\ProgrammingLanguageEnum;
use App\Support\Interfaces\Repositories\CourseRepositoryInterface;
use App\Support\Interfaces\Services\Course\CourseImportServiceInterface;
use App\Support\Interfaces\Services\CourseServiceInterface;
use App\Traits\Services\HandlesPageSizeAll;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class CourseService extends BaseCrudService implements CourseServiceInterface {
    use HandlesPageSizeAll;

    public function __construct(protected CourseImportServiceInterface $courseImport) {
        parent::__construct();
    }

    public function getAllPaginated(array $search = [], int $pageSize = 15): LengthAwarePaginator {
        $this->handlePageSizeAll();

        return parent::getAllPaginated($search, $pageSize);
    }

    /** @var CourseRepository */
    protected $repository;

    protected function getRepositoryClass(): string {
        return CourseRepositoryInterface::class;
    }

    public function import(Request $request) {
        try {
            $file = $request->file('excel_file');
            $path = $file->store('temp');
            $fullPath = Storage::path($path);

            try {
                $result = $this->courseImport->import($fullPath);

                // Create a marker file to indicate that Excel import was used
                $this->createExcelImportMarker();

                // Clean up the temporary file
                Storage::delete($path);

                return response()->json([
                    'status' => 'success',
                    'message' => 'Import completed successfully',
                    'stats' => $result['stats'],
                ]);
            } catch (ValidationException $e) {
                // Format validation errors for the frontend
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $e->errors(),
                ], 422); // Use 422 status code for validation errors
            }
        } catch (\Exception $e) {
            // Return a proper error response
            return response()->json([
                'message' => 'Import failed: ' . $e->getMessage(),
                'errors' => ['excel_file' => 'Error processing file: ' . $e->getMessage()],
            ], 422);
        }
    }

    /**
     * Create a marker file to indicate that Excel import was used
     */
    private function createExcelImportMarker() {
        if (!Storage::exists('imports')) {
            Storage::makeDirectory('imports');
        }

        // Copy the uploaded file to the imports directory as a marker
        Storage::put('imports/courses_import.xlsx', 'Excel import was used on ' . now()->toDateTimeString());
    }

    public function downloadTemplate() {
        // Create new Spreadsheet object
        $spreadsheet = new Spreadsheet;

        // Generate the Courses sheet
        $this->createCoursesSheet($spreadsheet);

        // Generate the Materials sheet
        $this->createMaterialsSheet($spreadsheet);

        // Generate the Questions sheet
        $this->createQuestionsSheet($spreadsheet);

        // Generate the TestCases sheet
        $this->createTestCasesSheet($spreadsheet);

        // Create writer
        $writer = new Xlsx($spreadsheet);

        // Create temp file
        $tempFile = storage_path('app/temp/course_import_template.xlsx');
        if (!file_exists(dirname($tempFile))) {
            mkdir(dirname($tempFile), 0755, true);
        }

        // Save the spreadsheet to the temp file
        $writer->save($tempFile);

        // Set a custom filename with the current date
        $filename = 'course_import_template_' . now()->format('Y-m-d') . '.xlsx';

        return response()->download(
            $tempFile,
            $filename,
            [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            ]
        )->deleteFileAfterSend(true);
    }

    /**
     * Create the Courses sheet
     */
    private function createCoursesSheet(Spreadsheet $spreadsheet) {
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Courses');

        // Set header row
        $sheet->setCellValue('A1', 'classroom');
        $sheet->setCellValue('B1', 'teacher_email');
        $sheet->setCellValue('C1', 'name');
        $sheet->setCellValue('D1', 'description');
        $sheet->setCellValue('E1', 'active');

        // Bold and background color for header
        $sheet->getStyle('A1:E1')->getFont()->setBold(true);
        $sheet->getStyle('A1:E1')->getFill()->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)->getStartColor()->setRGB('DDDDDD');

        // Example row
        $sheet->setCellValue('A2', 'Class A');
        $sheet->setCellValue('B2', 'teacher@example.com');
        $sheet->setCellValue('C2', 'Introduction to Python for Data Science');
        $sheet->setCellValue('D2', 'Learn the fundamentals of Python programming for data science, including basic syntax, data types, and libraries.');
        $sheet->setCellValue('E2', '1');

        // Set columns width
        $sheet->getColumnDimension('A')->setWidth(15);
        $sheet->getColumnDimension('B')->setWidth(25);
        $sheet->getColumnDimension('C')->setWidth(40);
        $sheet->getColumnDimension('D')->setWidth(50);
        $sheet->getColumnDimension('E')->setWidth(10);

        // Add notes
        // $sheet->setCellComment('A1', 'Enter the classroom name or code exactly as it appears in the system');
        // $sheet->setCellComment('B1', 'Enter the email address of a teacher account');

        // $sheet->setComments([
        //     'A1' => ['text' => 'Enter the classroom name or code exactly as it appears in the system'],
        //     'B1' => ['text' => 'Enter the email address of a teacher account'],
        // ]);

        // Add validation for active column
        $validation = $sheet->getDataValidation('E2');
        $validation->setType(\PhpOffice\PhpSpreadsheet\Cell\DataValidation::TYPE_LIST)
            ->setErrorStyle(\PhpOffice\PhpSpreadsheet\Cell\DataValidation::STYLE_INFORMATION)
            ->setAllowBlank(false)
            ->setShowInputMessage(true)
            ->setShowErrorMessage(true)
            ->setShowDropDown(true)
            ->setErrorTitle('Input error')
            ->setError('Value is not in list.')
            ->setPromptTitle('Pick from list')
            ->setPrompt('Please pick a value from the drop-down list.')
            ->setFormula1('"1,0"');

        // Apply the same validation to the range E2:E100
        for ($i = 2; $i <= 100; $i++) {
            $sheet->getCell('E' . $i)->setDataValidation(clone $validation);
        }

        // Add some help text at the top
        $sheet = $spreadsheet->createSheet();
        $sheet->setTitle('Instructions');
        $sheet->setCellValue('A1', 'Course Import Instructions');
        $sheet->setCellValue('A3', '1. Fill out the Courses sheet first');
        $sheet->setCellValue('A4', '2. Then fill out the Materials sheet using the course names from the Courses sheet');
        $sheet->setCellValue('A5', '3. Then fill out the Questions sheet using the material titles and course names');
        $sheet->setCellValue('A6', '4. Finally, fill out the TestCases sheet using the question titles, material titles, and course names');
        $sheet->setCellValue('A8', 'Notes:');
        $sheet->setCellValue('A9', '- You can use classroom names/codes instead of IDs');
        $sheet->setCellValue('A10', '- You can use teacher email addresses instead of IDs');
        $sheet->setCellValue('A11', '- Materials must reference a course by name');
        $sheet->setCellValue('A12', '- Questions must reference a material by title and include the course name');
        $sheet->setCellValue('A13', '- Test cases must reference a question by title and include the material title and course name');

        return $spreadsheet;
    }

    /**
     * Create the Materials sheet
     */
    private function createMaterialsSheet($spreadsheet) {
        $sheet = $spreadsheet->createSheet();
        $sheet->setTitle('Materials');

        // Set header row
        $sheet->setCellValue('A1', 'course_name');
        $sheet->setCellValue('B1', 'title');
        $sheet->setCellValue('C1', 'description');
        $sheet->setCellValue('D1', 'type');
        $sheet->setCellValue('E1', 'file');
        $sheet->setCellValue('F1', 'file_extension');
        $sheet->setCellValue('G1', 'active');

        // Bold and background color for header
        $sheet->getStyle('A1:G1')->getFont()->setBold(true);
        $sheet->getStyle('A1:G1')->getFill()->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)->getStartColor()->setRGB('DDDDDD');

        // Example row
        $sheet->setCellValue('A2', 'Introduction to Python for Data Science');
        $sheet->setCellValue('B2', 'Python Basics for Data Science');
        $sheet->setCellValue('C2', 'Learn the fundamentals of Python syntax and basic operations.');
        $sheet->setCellValue('D2', 'live_code');
        $sheet->setCellValue('E2', '');
        $sheet->setCellValue('F2', '');
        $sheet->setCellValue('G2', '1');

        // Set columns width
        $sheet->getColumnDimension('A')->setWidth(40);
        $sheet->getColumnDimension('B')->setWidth(40);
        $sheet->getColumnDimension('C')->setWidth(50);
        $sheet->getColumnDimension('D')->setWidth(15);
        $sheet->getColumnDimension('E')->setWidth(20);
        $sheet->getColumnDimension('F')->setWidth(20);
        $sheet->getColumnDimension('G')->setWidth(10);

        // Add comments
        // $sheet->setCellComment('A1', 'Enter the exact course name from the Courses sheet');
        // $sheet->setCellComment('D1', 'Valid types: ' . implode(', ', LearningMaterialTypeEnum::toArray()));

        // $sheet->setComments([
        //     'A1' => ['text' => 'Enter the exact course name from the Courses sheet'],
        //     'D1' => ['text' => 'Valid types: ' . implode(', ', LearningMaterialTypeEnum::toArray())],
        // ]);

        // Add validation for type column
        $validation = $sheet->getDataValidation('D2');
        $validation->setType(\PhpOffice\PhpSpreadsheet\Cell\DataValidation::TYPE_LIST)
            ->setErrorStyle(\PhpOffice\PhpSpreadsheet\Cell\DataValidation::STYLE_INFORMATION)
            ->setAllowBlank(false)
            ->setShowInputMessage(true)
            ->setShowErrorMessage(true)
            ->setShowDropDown(true)
            ->setErrorTitle('Input error')
            ->setError('Value is not in list.')
            ->setPromptTitle('Pick from list')
            ->setPrompt('Please pick a value from the drop-down list.')
            ->setFormula1('"' . implode(',', LearningMaterialTypeEnum::toArray()) . '"');

        // Apply to range D2:D100
        for ($i = 2; $i <= 100; $i++) {
            $sheet->getCell('D' . $i)->setDataValidation(clone $validation);
        }

        // Add validation for active column
        $validation = $sheet->getDataValidation('G2');
        $validation->setType(\PhpOffice\PhpSpreadsheet\Cell\DataValidation::TYPE_LIST)
            ->setErrorStyle(\PhpOffice\PhpSpreadsheet\Cell\DataValidation::STYLE_INFORMATION)
            ->setAllowBlank(false)
            ->setShowInputMessage(true)
            ->setShowErrorMessage(true)
            ->setShowDropDown(true)
            ->setErrorTitle('Input error')
            ->setError('Value is not in list.')
            ->setPromptTitle('Pick from list')
            ->setPrompt('Please pick a value from the drop-down list.')
            ->setFormula1('"1,0"');

        // Apply to range G2:G100
        for ($i = 2; $i <= 100; $i++) {
            $sheet->getCell('G' . $i)->setDataValidation(clone $validation);
        }

        return $spreadsheet;
    }

    /**
     * Create the Questions sheet
     */
    private function createQuestionsSheet($spreadsheet) {
        $sheet = $spreadsheet->createSheet();
        $sheet->setTitle('Questions');

        // Set header row
        $sheet->setCellValue('A1', 'course_name');
        $sheet->setCellValue('B1', 'material_title');
        $sheet->setCellValue('C1', 'title');
        $sheet->setCellValue('D1', 'description');
        $sheet->setCellValue('E1', 'clue');
        $sheet->setCellValue('F1', 'file');
        $sheet->setCellValue('G1', 'file_extension');
        $sheet->setCellValue('H1', 'active');

        // Bold and background color for header
        $sheet->getStyle('A1:H1')->getFont()->setBold(true);
        $sheet->getStyle('A1:H1')->getFill()->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)->getStartColor()->setRGB('DDDDDD');

        // Example row
        $sheet->setCellValue('A2', 'Introduction to Python for Data Science');
        $sheet->setCellValue('B2', 'Python Basics for Data Science');
        $sheet->setCellValue('C2', 'Create Variables and Print Output');
        $sheet->setCellValue('D2', "Create a variable called `data_science` with the value 'Python for Data Analysis'. Then print the variable and its type using the `print()` and `type()` functions.");
        $sheet->setCellValue('E2', 'Use the print() function twice - once for the variable value and once with type()');
        $sheet->setCellValue('F2', '');
        $sheet->setCellValue('G2', '');
        $sheet->setCellValue('H2', '1');

        // Set columns width
        $sheet->getColumnDimension('A')->setWidth(40);
        $sheet->getColumnDimension('B')->setWidth(40);
        $sheet->getColumnDimension('C')->setWidth(40);
        $sheet->getColumnDimension('D')->setWidth(60);
        $sheet->getColumnDimension('E')->setWidth(50);
        $sheet->getColumnDimension('F')->setWidth(20);
        $sheet->getColumnDimension('G')->setWidth(20);
        $sheet->getColumnDimension('H')->setWidth(10);

        // Add comments
        // $sheet->setCellComment('A1', 'Enter the exact course name from the Courses sheet');
        // $sheet->setCellComment('B1', 'Enter the exact material title from the Materials sheet');

        // $sheet->setComments([
        //     'A1' => ['text' => 'Enter the exact course name from the Courses sheet'],
        //     'B1' => ['text' => 'Enter the exact material title from the Materials sheet'],
        // ]);

        // Add validation for active column
        $validation = $sheet->getDataValidation('H2');
        $validation->setType(\PhpOffice\PhpSpreadsheet\Cell\DataValidation::TYPE_LIST)
            ->setErrorStyle(\PhpOffice\PhpSpreadsheet\Cell\DataValidation::STYLE_INFORMATION)
            ->setAllowBlank(false)
            ->setShowInputMessage(true)
            ->setShowErrorMessage(true)
            ->setShowDropDown(true)
            ->setErrorTitle('Input error')
            ->setError('Value is not in list.')
            ->setPromptTitle('Pick from list')
            ->setPrompt('Please pick a value from the drop-down list.')
            ->setFormula1('"1,0"');

        // Apply to range H2:H100
        for ($i = 2; $i <= 100; $i++) {
            $sheet->getCell('H' . $i)->setDataValidation(clone $validation);
        }

        return $spreadsheet;
    }

    /**
     * Create the TestCases sheet
     */
    private function createTestCasesSheet(Spreadsheet $spreadsheet) {
        $sheet = $spreadsheet->createSheet();
        $sheet->setTitle('TestCases');

        // Set header row
        $sheet->setCellValue('A1', 'course_name');
        $sheet->setCellValue('B1', 'material_title');
        $sheet->setCellValue('C1', 'question_title');
        $sheet->setCellValue('D1', 'description');
        $sheet->setCellValue('E1', 'input');
        $sheet->setCellValue('F1', 'expected_output_file');
        $sheet->setCellValue('G1', 'expected_output_file_extension');
        $sheet->setCellValue('H1', 'language');
        $sheet->setCellValue('I1', 'hidden');
        $sheet->setCellValue('J1', 'active');

        // Bold and background color for header
        $sheet->getStyle('A1:J1')->getFont()->setBold(true);
        $sheet->getStyle('A1:J1')->getFill()->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)->getStartColor()->setRGB('DDDDDD');

        // Example row
        $sheet->setCellValue('A2', 'Introduction to Python for Data Science');
        $sheet->setCellValue('B2', 'Python Basics for Data Science');
        $sheet->setCellValue('C2', 'Create Variables and Print Output');
        $sheet->setCellValue('D2', 'Check if variable is correctly defined');
        $sheet->setCellValue('E2', "import sys\n\n# Student code will be inserted here\n\n# Test case\nassert 'data_science' in globals(), \"Variable 'data_science' was not defined\"\nassert data_science == 'Python for Data Analysis', \"Variable has incorrect value\"");
        $sheet->setCellValue('F2', '');
        $sheet->setCellValue('G2', '');
        $sheet->setCellValue('H2', 'python');
        $sheet->setCellValue('I2', '0');
        $sheet->setCellValue('J2', '1');

        // Set columns width
        $sheet->getColumnDimension('A')->setWidth(40);
        $sheet->getColumnDimension('B')->setWidth(40);
        $sheet->getColumnDimension('C')->setWidth(40);
        $sheet->getColumnDimension('D')->setWidth(40);
        $sheet->getColumnDimension('E')->setWidth(80);
        $sheet->getColumnDimension('F')->setWidth(20);
        $sheet->getColumnDimension('G')->setWidth(20);
        $sheet->getColumnDimension('H')->setWidth(15);
        $sheet->getColumnDimension('I')->setWidth(10);
        $sheet->getColumnDimension('J')->setWidth(10);

        // Add comments
        // $sheet->setCellComment('A1', 'Enter the exact course name from the Courses sheet');
        // $sheet->setCellComment('B1', 'Enter the exact material title from the Materials sheet');
        // $sheet->setCellComment('C1', 'Enter the exact question title from the Questions sheet');
        // $sheet->setCellComment('H1', 'Valid languages: ' . implode(', ', ProgrammingLanguageEnum::toArray()));

        // $sheet->setComments([
        //     'A1' => ['text' => 'Enter the exact course name from the Courses sheet'],
        //     'B1' => ['text' => 'Enter the exact material title from the Materials sheet'],
        //     'C1' => ['text' => 'Enter the exact question title from the Questions sheet'],
        //     'H1' => ['text' => 'Valid languages: ' . implode(', ', ProgrammingLanguageEnum::toArray())],
        // ]);

        // Add validation for language column
        $validation = $sheet->getDataValidation('H2');
        $validation->setType(\PhpOffice\PhpSpreadsheet\Cell\DataValidation::TYPE_LIST)
            ->setErrorStyle(\PhpOffice\PhpSpreadsheet\Cell\DataValidation::STYLE_INFORMATION)
            ->setAllowBlank(false)
            ->setShowInputMessage(true)
            ->setShowErrorMessage(true)
            ->setShowDropDown(true)
            ->setErrorTitle('Input error')
            ->setError('Value is not in list.')
            ->setPromptTitle('Pick from list')
            ->setPrompt('Please pick a value from the drop-down list.')
            ->setFormula1('"' . implode(',', ProgrammingLanguageEnum::toArray()) . '"');

        // Apply to range H2:H100
        for ($i = 2; $i <= 100; $i++) {
            $sheet->getCell('H' . $i)->setDataValidation(clone $validation);
        }

        // Add validation for hidden and active columns
        foreach (['I', 'J'] as $column) {
            $validation = $sheet->getDataValidation($column . '2');
            $validation->setType(\PhpOffice\PhpSpreadsheet\Cell\DataValidation::TYPE_LIST)
                ->setErrorStyle(\PhpOffice\PhpSpreadsheet\Cell\DataValidation::STYLE_INFORMATION)
                ->setAllowBlank(false)
                ->setShowInputMessage(true)
                ->setShowErrorMessage(true)
                ->setShowDropDown(true)
                ->setErrorTitle('Input error')
                ->setError('Value is not in list.')
                ->setPromptTitle('Pick from list')
                ->setPrompt('Please pick a value from the drop-down list.')
                ->setFormula1('"1,0"');

            // Apply to each cell in the range
            for ($i = 2; $i <= 100; $i++) {
                $sheet->getCell($column . $i)->setDataValidation(clone $validation);
            }
        }

        return $spreadsheet;
    }
}
