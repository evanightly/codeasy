<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\StudentCognitiveClassification>
 */
class StudentCognitiveClassificationFactory extends Factory {
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array {
        return [
            'user_id' => $this->faker->numberBetween(1, 1000),
            'course_id' => $this->faker->numberBetween(1, 1000),
            'classification_level' => $this->faker->sentence(),
            'classification_score' => $this->faker->randomFloat(2, 1, 1000),
            'raw_data' => $this->faker->json_encode(['key' => 'value']),
            'classified_at' => $this->faker->dateTimeThisMonth()->format('Y-m-d H:i:s'),
        ];
    }
}
