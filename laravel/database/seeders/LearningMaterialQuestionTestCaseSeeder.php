<?php

namespace Database\Seeders;

use App\Models\LearningMaterialQuestion;
use App\Models\LearningMaterialQuestionTestCase;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Seeder;

class LearningMaterialQuestionTestCaseSeeder extends Seeder {
    private const TEST_DATA_COUNT = [
        'test_cases_per_question' => 3,
    ];

    private const LANGUAGES = ['python', 'javascript', 'java', 'cpp'];

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
        $language = self::LANGUAGES[array_rand(self::LANGUAGES)];

        // Test case input templates based on language
        $inputs = [
            'python' => [
                "def solution(a, b):\n    # Your code here\n    return a + b\n\nprint(solution(5, 3))",
                "def is_palindrome(s):\n    # Your code here\n    return s == s[::-1]\n\nprint(is_palindrome('racecar'))",
                "def find_max(arr):\n    # Your code here\n    return max(arr)\n\nprint(find_max([1, 5, 3, 9, 2]))",
            ],
            'javascript' => [
                "function solution(a, b) {\n    // Your code here\n    return a + b;\n}\n\nconsole.log(solution(5, 3));",
                "function isPalindrome(s) {\n    // Your code here\n    return s === s.split('').reverse().join('');\n}\n\nconsole.log(isPalindrome('racecar'));",
                "function findMax(arr) {\n    // Your code here\n    return Math.max(...arr);\n}\n\nconsole.log(findMax([1, 5, 3, 9, 2]));",
            ],
            'java' => [
                "public class Solution {\n    public static int solution(int a, int b) {\n        // Your code here\n        return a + b;\n    }\n\n    public static void main(String[] args) {\n        System.out.println(solution(5, 3));\n    }\n}",
                "public class Solution {\n    public static boolean isPalindrome(String s) {\n        // Your code here\n        return new StringBuilder(s).reverse().toString().equals(s);\n    }\n\n    public static void main(String[] args) {\n        System.out.println(isPalindrome(\"racecar\"));\n    }\n}",
                "public class Solution {\n    public static int findMax(int[] arr) {\n        // Your code here\n        int max = Integer.MIN_VALUE;\n        for (int num : arr) {\n            max = Math.max(max, num);\n        }\n        return max;\n    }\n\n    public static void main(String[] args) {\n        System.out.println(findMax(new int[]{1, 5, 3, 9, 2}));\n    }\n}",
            ],
            'cpp' => [
                "#include <iostream>\nusing namespace std;\n\nint solution(int a, int b) {\n    // Your code here\n    return a + b;\n}\n\nint main() {\n    cout << solution(5, 3) << endl;\n    return 0;\n}",
                "#include <iostream>\n#include <string>\n#include <algorithm>\nusing namespace std;\n\nbool isPalindrome(string s) {\n    // Your code here\n    string reversed = s;\n    reverse(reversed.begin(), reversed.end());\n    return s == reversed;\n}\n\nint main() {\n    cout << (isPalindrome(\"racecar\") ? \"true\" : \"false\") << endl;\n    return 0;\n}",
                "#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint findMax(vector<int> arr) {\n    // Your code here\n    return *max_element(arr.begin(), arr.end());\n}\n\nint main() {\n    cout << findMax({1, 5, 3, 9, 2}) << endl;\n    return 0;\n}",
            ],
        ];

        // Ensure at least one visible and one hidden test case
        $hasVisible = false;
        $hasHidden = false;

        for ($i = 0; $i < self::TEST_DATA_COUNT['test_cases_per_question']; $i++) {
            $languageInputs = $inputs[$language] ?? $inputs['python'];
            $input = $languageInputs[array_rand($languageInputs)];

            // Determine if test case is hidden
            $hidden = false;
            if ($i === 0 && !$hasVisible) {
                $hidden = false;
                $hasVisible = true;
            } elseif ($i === 1 && !$hasHidden) {
                $hidden = true;
                $hasHidden = true;
            } else {
                $hidden = rand(0, 1) === 1;
            }

            $testCase = LearningMaterialQuestionTestCase::create([
                'learning_material_question_id' => $question->id,
                'description' => 'Test case ' . ($i + 1) . ' for ' . $question->title,
                'input' => $input,
                'language' => $language,
                'hidden' => $hidden,
                'active' => rand(0, 10) > 1, // 90% chance of being active
            ]);

            $testCases->push($testCase);
        }

        return $testCases;
    }
}
