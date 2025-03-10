<?php

namespace Database\Seeders;

use App\Models\LearningMaterial;
use App\Models\LearningMaterialQuestion;
use App\Support\Enums\LearningMaterialTypeEnum;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Seeder;

class LearningMaterialQuestionSeeder extends Seeder {
    private const TEST_DATA_COUNT = [
        'questions_per_material' => 3, // Increasing to provide more practice opportunities
    ];

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
        $materials = LearningMaterial::where('active', true)
            ->where('type', LearningMaterialTypeEnum::LIVE_CODE)
            ->get();

        foreach ($materials as $material) {
            $this->createQuestionsForMaterial($material);
        }
    }

    /**
     * Create questions for a specific learning material
     */
    public function createQuestionsForMaterial(LearningMaterial $material): Collection {
        $questions = new Collection;

        $questionsByMaterialTitle = [
            // Python Basics for Data Science
            'Python Basics for Data Science' => [
                [
                    'title' => 'Create Variables and Print Output',
                    'description' => "Create a variable called `data_science` with the value 'Python for Data Analysis'. Then print the variable and its type using the `print()` and `type()` functions.",
                    'clue' => 'Use the print() function twice - once for the variable value and once with type()',
                ],
                [
                    'title' => 'Working with Lists',
                    'description' => "Create a list called `data_tools` containing the following strings: 'pandas', 'numpy', 'matplotlib', 'scikit-learn'. Then print the second element and the length of the list.",
                    'clue' => 'Remember that lists in Python are zero-indexed, so the second element has index 1',
                ],
                [
                    'title' => 'Writing a Simple Function',
                    'description' => 'Write a function called `calculate_mean` that takes a list of numbers as input and returns their mean (average). Test your function by calculating the mean of [10, 15, 20, 25, 30].',
                    'clue' => 'You can calculate the mean by summing all numbers and dividing by the count',
                ],
            ],

            // Installing and Importing Libraries
            'Installing and Importing Libraries' => [
                [
                    'title' => 'Import Essential Libraries',
                    'description' => "Import the NumPy library as `np`, Pandas library as `pd`, and Matplotlib's pyplot as `plt`.",
                    'clue' => 'Use the import statement with alias: import library as alias',
                ],
                [
                    'title' => 'Check Library Versions',
                    'description' => 'Import NumPy and Pandas, then print their versions using their respective `__version__` attributes.',
                    'clue' => 'After importing, you can access version with library.__version__',
                ],
                [
                    'title' => 'Create and Print a NumPy Array',
                    'description' => 'Import NumPy as np, create a NumPy array called `data` containing the numbers 1 through 5, and print it.',
                    'clue' => 'Use np.array() to create the array',
                ],
            ],

            // Working with NumPy Arrays
            'Working with NumPy Arrays' => [
                [
                    'title' => 'Creating and Reshaping Arrays',
                    'description' => 'Create a NumPy array containing numbers 1 through 12. Then reshape it into a 3×4 matrix and print the result.',
                    'clue' => 'Use np.arange(1, 13) to create the array and then the reshape() method',
                ],
                [
                    'title' => 'Array Operations',
                    'description' => 'Create two NumPy arrays: `array1` with values [1, 2, 3, 4] and `array2` with values [5, 6, 7, 8]. Perform element-wise addition of these arrays and print the result.',
                    'clue' => 'NumPy supports element-wise operations using standard operators like +',
                ],
                [
                    'title' => 'Statistical Functions with NumPy',
                    'description' => 'Create a NumPy array with the values [15, 23, 45, 38, 29, 40]. Calculate and print the mean, median, and standard deviation of this array.',
                    'clue' => 'Use np.mean(), np.median(), and np.std() functions',
                ],
            ],

            // Introduction to Pandas
            'Introduction to Pandas' => [
                [
                    'title' => 'Creating a DataFrame',
                    'description' => "Create a Pandas DataFrame with columns 'Name', 'Age', and 'Score'. Add at least 3 rows of data and print the DataFrame.",
                    'clue' => 'Use pd.DataFrame() with a dictionary where keys are column names and values are lists of data',
                ],
                [
                    'title' => 'Filtering a DataFrame',
                    'description' => "Create a DataFrame with columns 'Name', 'Age', and 'Score'. Add at least 5 rows of data. Then filter the DataFrame to show only rows where 'Score' is greater than 80.",
                    'clue' => "Use boolean indexing with the condition df['Score'] > 80",
                ],
                [
                    'title' => 'Basic Statistics with Pandas',
                    'description' => "Create a DataFrame with columns 'Product', 'Price', and 'Quantity'. Add at least 4 products. Calculate and print the mean price and the total quantity of all products.",
                    'clue' => "Use df['Price'].mean() and df['Quantity'].sum()",
                ],
            ],

            // Basic Data Visualization
            'Basic Data Visualization' => [
                [
                    'title' => 'Creating a Simple Line Plot',
                    'description' => "Import matplotlib.pyplot as plt. Create two lists: x with values [1, 2, 3, 4, 5] and y with values [10, 12, 5, 8, 14]. Create a line plot with these values, add a title 'Simple Line Plot', and label the x and y axes.",
                    'clue' => 'Use plt.plot(x, y), plt.title(), plt.xlabel(), and plt.ylabel()',
                ],
                [
                    'title' => 'Bar Chart Visualization',
                    'description' => "Create a bar chart showing the popularity of programming languages. Use languages = ['Python', 'JavaScript', 'Java', 'C#'] and popularity = [85, 70, 65, 60]. Add appropriate title and axis labels.",
                    'clue' => 'Use plt.bar(languages, popularity) and add title and labels',
                ],
                [
                    'title' => 'Creating a Scatter Plot',
                    'description' => 'Create a scatter plot to visualize the correlation between study hours and exam scores. Use hours = [2, 3, 5, 4, 7, 6, 8] and scores = [65, 70, 85, 75, 90, 88, 95]. Add a title and label the axes.',
                    'clue' => 'Use plt.scatter(hours, scores) and add appropriate labels',
                ],
            ],

            // Data Cleaning with Pandas
            'Data Cleaning with Pandas' => [
                [
                    'title' => 'Handling Missing Values',
                    'description' => "Create a DataFrame with columns 'A', 'B', and 'C' containing some missing values (NaN). Fill missing values in column 'A' with the mean of the column, in 'B' with 0, and drop rows with missing values in column 'C'.",
                    'clue' => "Use pd.DataFrame with some np.nan values, then df['A'].fillna(df['A'].mean()), df['B'].fillna(0), and dropna() for column 'C'",
                ],
                [
                    'title' => 'Removing Duplicates',
                    'description' => "Create a DataFrame with columns 'ID' and 'Value' that contains some duplicate ID entries. Remove the duplicates keeping only the first occurrence and print the result.",
                    'clue' => "Create the DataFrame with duplicate IDs, then use df.drop_duplicates(subset=['ID'])",
                ],
                [
                    'title' => 'String Cleaning and Transformation',
                    'description' => "Create a DataFrame with a column 'Text' containing strings with extra whitespace and mixed case. Clean the strings by stripping whitespace and converting to lowercase.",
                    'clue' => "Use string methods with apply: df['Text'] = df['Text'].apply(lambda x: x.strip().lower())",
                ],
            ],

            // Default questions for other materials
            'default' => [
                [
                    'title' => 'Basic Data Manipulation',
                    'description' => 'Create a pandas DataFrame with 3 columns and 4 rows of sample data. Calculate the mean of one numeric column.',
                    'clue' => 'Use pd.DataFrame() to create the dataframe and .mean() method for the calculation',
                ],
                [
                    'title' => 'Simple Data Visualization',
                    'description' => 'Create a simple bar chart using matplotlib to visualize a dataset of your choice. Include proper title and axis labels.',
                    'clue' => 'Import matplotlib.pyplot as plt, then use plt.bar() function',
                ],
                [
                    'title' => 'Data Analysis Task',
                    'description' => 'Import the necessary libraries and perform a basic analysis on a sample dataset. Find the minimum, maximum and average values.',
                    'clue' => 'Import pandas and numpy, then use descriptive statistics methods',
                ],
            ],
        ];

        // Select questions based on material title or use default
        $questionSet = $questionsByMaterialTitle[$material->title] ?? $questionsByMaterialTitle['default'];
        $questionsToCreate = min(count($questionSet), self::TEST_DATA_COUNT['questions_per_material']);

        for ($i = 0; $i < $questionsToCreate; $i++) {
            $questionData = $questionSet[$i];

            $question = LearningMaterialQuestion::create([
                'learning_material_id' => $material->id,
                'title' => $questionData['title'],
                'description' => $questionData['description'],
                'type' => $material->type,
                'order_number' => $i + 1,
                'clue' => $questionData['clue'],
                'active' => true,
            ]);

            $questions->push($question);
        }

        return $questions;
    }
}
