<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TestCaseChangeTracker>
 */
class TestCaseChangeTrackerFactory extends Factory {
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array {
        return [
            'test_case_id' => $this->faker->numberBetween(1, 1000),
            'learning_material_question_id' => $this->faker->numberBetween(1, 1000),
            'learning_material_id' => $this->faker->numberBetween(1, 1000),
            'course_id' => $this->faker->numberBetween(1, 1000),
            'change_type' => $this->faker->sentence(),
            'previous_data' => $this->faker->json_encode(['key' => 'value']),
            'affected_student_ids' => $this->faker->json_encode(['key' => 'value']),
            'status' => $this->faker->sentence(),
            'scheduled_at' => $this->faker->dateTimeThisMonth()->format('Y-m-d H:i:s'),
            'completed_at' => $this->faker->dateTimeThisMonth()->format('Y-m-d H:i:s'),
            'execution_details' => $this->faker->json_encode(['key' => 'value']),
        ];
    }
}
