<?php

namespace Database\Seeders;

use App\Models\LearningMaterialQuestion;
use App\Models\LearningMaterialQuestionTestCase;
use App\Support\Enums\ProgrammingLanguageEnum;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Seeder;

class LearningMaterialQuestionTestCaseSeeder extends Seeder {
    private const TEST_DATA_COUNT = [
        'test_cases_per_question' => 3,
    ];

    public function run(): void {
        // Check if we should force development seeding even in production
        $forceDevSeeding = env('FORCE_DEV_SEEDING', false);

        // Use production seeding unless development seeding is forced
        if (app()->isProduction() && !$forceDevSeeding) {
            $this->seedProductionData();

            return;
        }

        // Skip seeding if courses were imported from Excel
        if ($this->wasExcelImportUsed()) {
            $this->info('Skipping test cases seeding as courses were imported from Excel.');

            return;
        }

        $this->seedDevelopmentData();
    }

    private function seedProductionData(): void {
        // Production data would go here if needed
    }

    private function seedDevelopmentData(): void {
        $questions = LearningMaterialQuestion::where('active', true)->get();

        foreach ($questions as $question) {
            $this->createTestCasesForQuestion($question);
        }
    }

    /**
     * Create test cases for a specific question
     */
    public function createTestCasesForQuestion(LearningMaterialQuestion $question): Collection {
        $testCases = new Collection;

        // Get test cases based on question title
        $testCasesByTitle = $this->getTestCasesForTitle($question->title);

        if (empty($testCasesByTitle)) {
            return $testCases;
        }

        $numTestCases = min(count($testCasesByTitle), self::TEST_DATA_COUNT['test_cases_per_question']);

        for ($i = 0; $i < $numTestCases; $i++) {
            $testCaseData = $testCasesByTitle[$i];

            $testCase = LearningMaterialQuestionTestCase::create([
                'learning_material_question_id' => $question->id,
                'description' => $testCaseData['description'],
                'input' => $testCaseData['input'],
                'hidden' => $testCaseData['hidden'] ?? false,
                'active' => true,
                'language' => ProgrammingLanguageEnum::PYTHON,
            ]);

            $testCases->push($testCase);
        }

        return $testCases;
    }

    /**
     * Get test cases based on question title
     */
    private function getTestCasesForTitle(string $title): array {
        $allTestCases = [
            // Python Basics for Data Science
            'Create Variables and Print Output' => [
                [
                    'description' => 'Check if variable is correctly defined',
                    'input' => "import sys\n\n# Student code will be inserted here\n\n# Test case\nassert 'data_science' in globals(), \"Variable 'data_science' was not defined\"\nassert data_science == 'Python for Data Analysis', \"Variable has incorrect value\"",
                    'hidden' => false,
                ],
                [
                    'description' => 'Check output shows variable value and type',
                    'input' => "import sys\nimport io\nfrom contextlib import redirect_stdout\n\nf = io.StringIO()\nwith redirect_stdout(f):\n    # Student code will be inserted here\n    pass\n\noutput = f.getvalue()\nassert \"Python for Data Analysis\" in output, \"Variable value not printed\"\nassert \"<class 'str'>\" in output or \"str\" in output, \"Variable type not printed\"",
                    'hidden' => true,
                ],
                [
                    'description' => 'Verify correct variable type',
                    'input' => "import sys\n\n# Student code will be inserted here\n\n# Test case\nassert isinstance(data_science, str), \"Variable should be a string\"",
                    'hidden' => true,
                ],
            ],

            'Working with Lists' => [
                [
                    'description' => 'Check if list is created correctly',
                    'input' => "import sys\n\n# Student code will be inserted here\n\n# Test case\nassert 'data_tools' in globals(), \"List 'data_tools' was not defined\"\nassert isinstance(data_tools, list), \"'data_tools' must be a list\"\nassert data_tools == ['pandas', 'numpy', 'matplotlib', 'scikit-learn'], \"List has incorrect values\"",
                    'hidden' => false,
                ],
                [
                    'description' => 'Check second element access',
                    'input' => "import sys\nimport io\nfrom contextlib import redirect_stdout\n\nf = io.StringIO()\nwith redirect_stdout(f):\n    # Student code will be inserted here\n    pass\n\noutput = f.getvalue().lower()\nassert \"numpy\" in output, \"Second element (numpy) not printed\"\nassert \"4\" in output, \"List length not printed\"",
                    'hidden' => true,
                ],
                [
                    'description' => 'Test list operations',
                    'input' => "import sys\n\n# Student code will be inserted here\n\n# Test case\nassert data_tools[1] == 'numpy', \"Second element should be 'numpy'\"\nassert len(data_tools) == 4, \"List should have 4 items\"",
                    'hidden' => true,
                ],
            ],

            'Writing a Simple Function' => [
                [
                    'description' => 'Test function exists and returns correct result',
                    'input' => "import sys\n\n# Student code will be inserted here\n\n# Test case\nassert 'calculate_mean' in globals(), \"Function 'calculate_mean' was not defined\"\nassert callable(calculate_mean), \"'calculate_mean' is not a function\"\nassert calculate_mean([10, 15, 20, 25, 30]) == 20.0, \"Function returns incorrect result for [10, 15, 20, 25, 30]\"",
                    'hidden' => false,
                ],
                [
                    'description' => 'Test function with different inputs',
                    'input' => "import sys\n\n# Student code will be inserted here\n\n# Test case\nassert calculate_mean([5, 10, 15]) == 10.0, \"Function returns incorrect result for [5, 10, 15]\"\nassert calculate_mean([100]) == 100.0, \"Function returns incorrect result for [100]\"\nassert calculate_mean([-5, 5]) == 0.0, \"Function returns incorrect result for [-5, 5]\"",
                    'hidden' => true,
                ],
                [
                    'description' => 'Handle edge cases',
                    'input' => "import sys\n\n# Student code will be inserted here\n\n# Test edge cases\ntry:\n    result = calculate_mean([])\n    assert False, \"Function should handle empty list\"\nexcept ZeroDivisionError:\n    pass\nexcept Exception as e:\n    # Other ways of handling empty lists are also acceptable\n    pass",
                    'hidden' => true,
                ],
            ],

            // Installing and Importing Libraries
            'Import Essential Libraries' => [
                [
                    'description' => 'Check if libraries are imported with correct aliases',
                    'input' => "import sys\n\n# Student code will be inserted here\n\n# Test case\nassert 'np' in globals(), \"NumPy is not imported as 'np'\"\nassert 'pd' in globals(), \"Pandas is not imported as 'pd'\"\nassert 'plt' in globals(), \"Matplotlib pyplot is not imported as 'plt'\"",
                    'hidden' => false,
                ],
                [
                    'description' => 'Verify correct imports',
                    'input' => "import sys\n\n# Student code will be inserted here\n\n# Test case\nimport numpy as test_np\nimport pandas as test_pd\nimport matplotlib.pyplot as test_plt\n\nassert np.__name__ == 'numpy', \"'np' is not numpy\"\nassert pd.__name__ == 'pandas', \"'pd' is not pandas\"\nassert plt.__name__ == 'matplotlib.pyplot', \"'plt' is not matplotlib.pyplot\"",
                    'hidden' => true,
                ],
                [
                    'description' => 'Test basic functionality',
                    'input' => "import sys\n\n# Student code will be inserted here\n\n# Test basic usage\ntry:\n    test_array = np.array([1, 2, 3])\n    test_df = pd.DataFrame({'A': [1, 2]})\n    # Create a figure but don't display it\n    test_fig = plt.figure()\n    plt.close()\n    print(\"Libraries imported correctly\")\nexcept Exception as e:\n    assert False, f\"Error using imported libraries: {e}\"",
                    'hidden' => true,
                ],
            ],

            'Check Library Versions' => [
                [
                    'description' => 'Check libraries and version attributes',
                    'input' => "import sys\n\n# Student code will be inserted here\n\n# Test case\nassert 'np' in globals() or 'numpy' in globals(), \"NumPy is not imported\"\nassert 'pd' in globals() or 'pandas' in globals(), \"Pandas is not imported\"\n\nnp_obj = np if 'np' in globals() else numpy\npd_obj = pd if 'pd' in globals() else pandas\n\nassert hasattr(np_obj, '__version__'), \"NumPy version attribute missing\"\nassert hasattr(pd_obj, '__version__'), \"Pandas version attribute missing\"",
                    'hidden' => false,
                ],
                [
                    'description' => 'Check if versions are printed',
                    'input' => "import sys\nimport io\nfrom contextlib import redirect_stdout\n\nf = io.StringIO()\nwith redirect_stdout(f):\n    # Student code will be inserted here\n    pass\n\noutput = f.getvalue()\nnp_obj = np if 'np' in globals() else numpy\npd_obj = pd if 'pd' in globals() else pandas\n\nassert np_obj.__version__ in output, \"NumPy version not printed\"\nassert pd_obj.__version__ in output, \"Pandas version not printed\"",
                    'hidden' => true,
                ],
                [
                    'description' => 'Test proper import syntax',
                    'input' => "import inspect\nimport sys\n\n# Student code will be inserted here\n\n# Check the source code for correct import pattern\nsource = inspect.getsource(inspect.currentframe())\nimport_np = 'import numpy as np' in source or 'import numpy' in source\nimport_pd = 'import pandas as pd' in source or 'import pandas' in source\nassert import_np, \"NumPy import statement not found\"\nassert import_pd, \"Pandas import statement not found\"",
                    'hidden' => true,
                ],
            ],

            'Create and Print a NumPy Array' => [
                [
                    'description' => 'Check if NumPy is imported and array created',
                    'input' => "import sys\n\n# Student code will be inserted here\n\n# Test case\nassert 'np' in globals(), \"NumPy is not imported as 'np'\"\nassert 'data' in globals(), \"Array 'data' is not defined\"\nimport numpy as test_np\nassert isinstance(data, test_np.ndarray), \"'data' is not a NumPy array\"",
                    'hidden' => false,
                ],
                [
                    'description' => 'Check array values',
                    'input' => "import sys\nimport numpy as test_np\n\n# Student code will be inserted here\n\n# Test case\nexpected = test_np.array([1, 2, 3, 4, 5])\nassert test_np.array_equal(data, expected), f\"Array should contain numbers 1-5, but got {data}\"",
                    'hidden' => true,
                ],
                [
                    'description' => 'Check if array is printed',
                    'input' => "import sys\nimport io\nfrom contextlib import redirect_stdout\n\nf = io.StringIO()\nwith redirect_stdout(f):\n    # Student code will be inserted here\n    pass\n\noutput = f.getvalue()\nassert '1' in output and '2' in output and '3' in output and '4' in output and '5' in output, \"Array values not printed\"",
                    'hidden' => true,
                ],
            ],

            // Working with NumPy Arrays
            'Creating and Reshaping Arrays' => [
                [
                    'description' => 'Check array creation and reshaping',
                    'input' => "import sys\nimport numpy as np\n\n# Student code will be inserted here\n\n# Verify the last created array is a reshaped 3x4 matrix\nvariables = list(globals().items())\narray_vars = [(name, var) for name, var in variables if isinstance(var, np.ndarray) and var.size == 12]\nassert len(array_vars) > 0, \"No NumPy arrays with 12 elements found\"\n\n# Find the reshaped array (3x4)\nreshaped_array = None\nfor name, arr in array_vars:\n    if arr.shape == (3, 4):\n        reshaped_array = arr\n        break\n\nassert reshaped_array is not None, \"No 3x4 reshaped array found\"\nassert np.array_equal(np.sort(reshaped_array.flatten()), np.arange(1, 13)), \"Array should contain numbers 1-12\"",
                    'hidden' => false,
                ],
                [
                    'description' => 'Verify reshape method usage',
                    'input' => "import sys\nimport inspect\n\n# Student code will be inserted here\n\n# Check use of reshape method in code\nsource = inspect.getsource(inspect.currentframe())\nassert '.reshape' in source, \"The reshape() method was not used\"",
                    'hidden' => true,
                ],
                [
                    'description' => 'Check printed output',
                    'input' => "import sys\nimport io\nfrom contextlib import redirect_stdout\nimport numpy as np\n\nf = io.StringIO()\nwith redirect_stdout(f):\n    # Student code will be inserted here\n    pass\n\noutput = f.getvalue()\n# Check if output contains array values in a 3x4 pattern\nlines = [line.strip() for line in output.strip().split('\\n') if line.strip()]\narray_lines = []\nfor line in lines:\n    if '[' in line and ']' in line:\n        array_lines.append(line)\n\nassert len(array_lines) > 0, \"No array was printed\"\n\n# Try to identify a 3x4 array output pattern\nmatrix_output = False\nfor i in range(len(array_lines) - 2):\n    if array_lines[i].count('[') > array_lines[i].count(']'):  # Opening line of a matrix\n        if ']]' in array_lines[i+2]:  # Closing line of a matrix\n            matrix_output = True\n            break\n\nassert matrix_output, \"No 3x4 matrix found in printed output\"",
                    'hidden' => true,
                ],
            ],

            'Array Operations' => [
                [
                    'description' => 'Check array creation and addition',
                    'input' => "import sys\nimport numpy as np\n\n# Student code will be inserted here\n\n# Test case\nassert 'array1' in globals(), \"Variable 'array1' is not defined\"\nassert 'array2' in globals(), \"Variable 'array2' is not defined\"\nassert isinstance(array1, np.ndarray), \"array1 is not a NumPy array\"\nassert isinstance(array2, np.ndarray), \"array2 is not a NumPy array\"\n\n# Check array values\nexpected1 = np.array([1, 2, 3, 4])\nexpected2 = np.array([5, 6, 7, 8])\nassert np.array_equal(array1, expected1), f\"array1 should be [1, 2, 3, 4], but got {array1}\"\nassert np.array_equal(array2, expected2), f\"array2 should be [5, 6, 7, 8], but got {array2}\"",
                    'hidden' => false,
                ],
                [
                    'description' => 'Check array addition result',
                    'input' => "import sys\nimport numpy as np\nimport io\nfrom contextlib import redirect_stdout\n\n# Get original stdout\noriginal_stdout = sys.stdout\nf = io.StringIO()\nsys.stdout = f\n\n# Student code will be inserted here\n\n# Reset stdout\nsys.stdout = original_stdout\noutput = f.getvalue()\n\n# Check for array sum in the output\nexpected_sum = np.array([6, 8, 10, 12])\n# Convert any array-like output string to actual values for comparison\noutput_with_arrays = output.strip().split('\\n')\nsum_found = False\nfor line in output_with_arrays:\n    line = line.strip()\n    if '[' in line and ']' in line:\n        # Extract the array values\n        try:\n            array_str = line.split('[')[1].split(']')[0]\n            array_values = [int(x.strip()) for x in array_str.split()]\n            if len(array_values) == 4 and array_values[0] == 6 and array_values[1] == 8 and array_values[2] == 10 and array_values[3] == 12:\n                sum_found = True\n                break\n        except:\n            continue\n\nassert sum_found, \"Sum of arrays [6, 8, 10, 12] not found in output\"",
                    'hidden' => true,
                ],
                [
                    'description' => 'Check element-wise operation',
                    'input' => "import sys\nimport inspect\n\n# Student code will be inserted here\n\n# Check if student used element-wise operation syntax\nsource = inspect.getsource(inspect.currentframe())\n# Look for addition operation pattern\naddition_pattern_found = 'array1 + array2' in source or 'array1+array2' in source\nassert addition_pattern_found, \"Element-wise addition operation not found\"",
                    'hidden' => true,
                ],
            ],

            // Default test cases for other questions
            'default' => [
                [
                    'description' => 'Check for function/variable creation',
                    'input' => "import sys\n\n# Student code will be inserted here\n\n# Basic variable check\nvariables_exist = False\nfor var_name, var_value in globals().items():\n    if var_name not in ['sys', '__name__', '__file__', '__builtins__']:\n        variables_exist = True\n        break\nassert variables_exist, \"No variables or functions were defined\"",
                    'hidden' => false,
                ],
                [
                    'description' => 'Check for common libraries',
                    'input' => "import sys\n\n# Student code will be inserted here\n\n# Check for data science libraries\ntry:\n    import numpy\n    import pandas\nexcept ImportError:\n    pass  # It's okay if the student didn't use these libraries\n\n# Check if student imported libraries\nlibraries_imported = False\nfor var_name, var_value in globals().items():\n    if var_name in ['np', 'pd', 'plt', 'numpy', 'pandas', 'matplotlib']:\n        libraries_imported = True\n        break\n\n# Not making this a hard requirement\nprint(\"Libraries imported successfully\" if libraries_imported else \"No data science libraries were imported\")",
                    'hidden' => true,
                ],
                [
                    'description' => 'Test code execution',
                    'input' => "import sys\nimport io\nfrom contextlib import redirect_stdout\n\nf = io.StringIO()\nwith redirect_stdout(f):\n    # Student code will be inserted here\n    pass\n\noutput = f.getvalue()\nassert len(output.strip()) > 0, \"No output was generated. Make sure to print something!\"",
                    'hidden' => true,
                ],
            ],
        ];

        // First try exact title match
        if (isset($allTestCases[$title])) {
            return $allTestCases[$title];
        }

        // Try partial match
        foreach ($allTestCases as $key => $testCase) {
            if ($key != 'default' && strpos($title, $key) !== false) {
                return $testCase;
            }
        }

        // Return default if no match found
        return $allTestCases['default'];
    }

    /**
     * Check if the courses were imported from Excel
     */
    private function wasExcelImportUsed(): bool {
        // Check for a marker file or environment variable that could be set by CourseSeeder
        $excelPath = storage_path('app/imports/courses_import.xlsx');
        $publicPath = public_path('imports/courses_import.xlsx');

        return file_exists($excelPath) || file_exists($publicPath);
    }

    /**
     * Output info message during seeding
     */
    private function info($message): void {
        $this->command->info($message);
    }
}
