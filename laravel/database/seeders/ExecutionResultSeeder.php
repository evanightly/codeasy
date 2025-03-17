<?php

namespace Database\Seeders;

use App\Models\ExecutionResult;
use App\Models\StudentScore;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ExecutionResultSeeder extends Seeder {
    public function run(): void {
        if (app()->isProduction()) {
            $this->seedProductionData();

            return;
        }

        $this->seedDevelopmentData();
    }

    private function seedProductionData(): void {
        // Production data would go here if needed
    }

    private function seedDevelopmentData(): void {
        // Get all student scores
        $studentScores = StudentScore::all();

        foreach ($studentScores as $studentScore) {
            $this->createExecutionResultsForStudentScore($studentScore);
        }
    }

    /**
     * Create sample execution results for a student score
     */
    private function createExecutionResultsForStudentScore(StudentScore $studentScore): void {
        // Randomly decide if the student made multiple attempts
        $attempts = rand(1, 5);

        for ($i = 1; $i <= $attempts; $i++) {
            // Generate sample code based on the question type
            $code = $this->generateSampleCode($studentScore);

            // Create execution result
            ExecutionResult::create([
                'student_score_id' => $studentScore->id,
                'code' => $code,
                'compile_count' => $i,
                'compile_status' => $i === $attempts ? true : rand(0, 1),
                'output_image' => null, // No image for seeded data
                'created_at' => now()->subMinutes(($attempts - $i) * 5), // Space out the attempts
            ]);
        }
    }

    /**
     * Generate sample code based on question content
     */
    private function generateSampleCode(StudentScore $studentScore): string {
        $question = $studentScore->question;

        if (!$question) {
            return "# Sample Python code\nprint('Hello, World!')";
        }

        $title = $question->title;

        // Sample code templates based on question titles
        if (Str::contains($title, 'Variables')) {
            return "# Define a variable and print it\ndata_science = 'Python for Data Analysis'\nprint(data_science)\nprint(type(data_science))";
        }

        if (Str::contains($title, 'Lists')) {
            return "# Create a list of data science tools\ndata_tools = ['pandas', 'numpy', 'matplotlib', 'scikit-learn']\nprint(data_tools[1])  # Print second element\nprint(len(data_tools))  # Print list length";
        }

        if (Str::contains($title, 'Function')) {
            return "# Define a function to calculate mean\ndef calculate_mean(numbers):\n    return sum(numbers) / len(numbers)\n\n# Test the function\nnumbers = [10, 15, 20, 25, 30]\nresult = calculate_mean(numbers)\nprint(f'Mean: {result}')";
        }

        if (Str::contains($title, 'Import')) {
            return "# Import essential data science libraries\nimport numpy as np\nimport pandas as pd\nimport matplotlib.pyplot as plt\n\n# Show versions\nprint(f'NumPy version: {np.__version__}')\nprint(f'Pandas version: {pd.__version__}')";
        }

        if (Str::contains($title, 'NumPy')) {
            return "# Working with NumPy arrays\nimport numpy as np\n\n# Create array and perform operations\narray1 = np.array([1, 2, 3, 4])\narray2 = np.array([5, 6, 7, 8])\n\n# Show array addition\nprint(array1 + array2)";
        }

        if (Str::contains($title, 'DataFrame')) {
            return "# Creating a pandas DataFrame\nimport pandas as pd\n\n# Create sample data\ndata = {\n    'Name': ['Alice', 'Bob', 'Charlie', 'David'],\n    'Age': [25, 30, 35, 40],\n    'Score': [85, 92, 78, 96]\n}\n\n# Create DataFrame\ndf = pd.DataFrame(data)\n\n# Display DataFrame\nprint(df)\n\n# Filter by score > 80\nprint('\\nScores greater than 80:')\nprint(df[df['Score'] > 80])";
        }

        if (Str::contains($title, 'Visualization') || Str::contains($title, 'Plot')) {
            return "# Data visualization with Matplotlib\nimport matplotlib.pyplot as plt\nimport numpy as np\n\n# Create data\nx = np.array([1, 2, 3, 4, 5])\ny = np.array([10, 12, 5, 8, 14])\n\n# Create plot\nplt.figure(figsize=(8, 4))\nplt.plot(x, y, 'b-', marker='o')\nplt.title('Simple Line Plot')\nplt.xlabel('X Axis')\nplt.ylabel('Y Axis')\nplt.grid(True)\n\n# Show plot\nplt.show()";
        }

        // Default code for other types of questions
        return "# Python code for data analysis\nimport numpy as np\nimport pandas as pd\nimport matplotlib.pyplot as plt\n\n# Sample data\ndata = np.random.randn(100)\n\n# Calculate statistics\nprint(f'Mean: {np.mean(data):.2f}')\nprint(f'Standard Deviation: {np.std(data):.2f}')\nprint(f'Min: {np.min(data):.2f}')\nprint(f'Max: {np.max(data):.2f}')";
    }
}
