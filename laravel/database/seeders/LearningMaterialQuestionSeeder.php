<?php

namespace Database\Seeders;

use App\Models\LearningMaterial;
use App\Models\LearningMaterialQuestion;
use App\Support\Enums\LearningMaterialTypeEnum;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Seeder;

class LearningMaterialQuestionSeeder extends Seeder {
    private const TEST_DATA_COUNT = [
        'questions_per_material' => 2,
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

        $questionTitles = [
            'Write a Function',
            'Calculate Sum',
            'Check Palindrome',
            'Sort an Array',
            'Find Maximum Value',
            'Implement Binary Search',
            'Create a Class',
            'Solve Recursion Problem',
            'Handle File Input/Output',
            'Implement Data Structure',
        ];

        $clues = [
            'Remember to handle edge cases',
            'Consider using a loop to iterate over the data',
            'Think about using helper functions',
            'Consider time and space complexity',
            'Use appropriate data structures',
        ];

        for ($i = 0; $i < self::TEST_DATA_COUNT['questions_per_material']; $i++) {
            $title = $questionTitles[array_rand($questionTitles)];

            $question = LearningMaterialQuestion::create([
                'learning_material_id' => $material->id,
                'title' => "$title",
                'description' => "In this exercise, you need to $title. Write code that solves the problem efficiently.",
                'type' => $material->type,
                'order_number' => $i + 1,
                'clue' => $clues[array_rand($clues)],
                'active' => rand(0, 10) > 1, // 90% chance of being active
            ]);

            $questions->push($question);
        }

        return $questions;
    }
}
