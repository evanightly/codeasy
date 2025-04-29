<?php

namespace Tests\Feature;

use App\Models\ClassRoom;
use App\Models\Course;
use App\Models\ExecutionResult;
use App\Models\LearningMaterial;
use App\Models\LearningMaterialQuestion;
use App\Models\StudentCognitiveClassification;
use App\Models\StudentScore;
use App\Models\User;
use App\Services\StudentCognitiveClassificationService;
use App\Support\Enums\RoleEnum;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class StudentCognitiveClassificationTest extends TestCase {
    use RefreshDatabase;

    protected Course $course;
    protected array $students;
    protected array $learningMaterials;
    protected StudentCognitiveClassificationService $service;

    protected function setUp(): void {
        parent::setUp();

        // Create the service
        $this->service = app(StudentCognitiveClassificationService::class);

        // Set up test data
        $this->setUpTestData();
    }

    /**
     * Create test data for classification tests
     */
    private function setUpTestData(): void {
        // Create a classroom
        $school = \App\Models\School::factory()->create();
        $classroom = ClassRoom::factory()->create([
            'school_id' => $school->id,
        ]);

        // Create a teacher
        $teacher = User::factory()->create([
            'role' => RoleEnum::TEACHER->value,
        ]);

        // Create a course
        $this->course = Course::factory()->create([
            'class_room_id' => $classroom->id,
            'teacher_id' => $teacher->id,
        ]);

        // Create students
        $this->students = [];
        for ($i = 0; $i < 3; $i++) {
            $student = User::factory()->create([
                'role' => RoleEnum::STUDENT->value,
            ]);
            $classroom->students()->attach($student->id);
            $this->students[] = $student;
        }

        // Create learning materials and questions
        $this->learningMaterials = [];
        for ($m = 0; $m < 2; $m++) {
            $material = LearningMaterial::factory()->create([
                'course_id' => $this->course->id,
                'order_number' => $m + 1,
                'title' => 'Material ' . ($m + 1),
            ]);

            $questions = [];
            for ($q = 0; $q < 3; $q++) {
                $question = LearningMaterialQuestion::factory()->create([
                    'learning_material_id' => $material->id,
                    'order_number' => $q + 1,
                    'title' => 'Question ' . ($q + 1),
                ]);
                $questions[] = $question;
            }

            $this->learningMaterials[] = [
                'material' => $material,
                'questions' => $questions,
            ];
        }

        // Create student scores and execution results
        foreach ($this->students as $studentIndex => $student) {
            foreach ($this->learningMaterials as $materialData) {
                foreach ($materialData['questions'] as $questionIndex => $question) {
                    // Create varying data for each student
                    $completionStatus = $studentIndex > 0 ? 1 : ($questionIndex < 2 ? 1 : 0);
                    $trialStatus = $questionIndex < 2 ? 1 : 0;
                    $compileCount = rand(5, 30);
                    $codingTime = rand(60, 1800); // 1-30 minutes in seconds

                    // Create execution result
                    $executionResult = ExecutionResult::factory()->create([
                        'user_id' => $student->id,
                        'learning_material_question_id' => $question->id,
                        'variable_count' => rand(3, 10),
                        'function_count' => rand(1, 5),
                    ]);

                    // Create student score
                    StudentScore::factory()->create([
                        'user_id' => $student->id,
                        'learning_material_question_id' => $question->id,
                        'completion_status' => $completionStatus,
                        'trial_status' => $trialStatus,
                        'compile_count' => $compileCount,
                        'coding_time' => $codingTime,
                        'completed_execution_result_id' => $completionStatus ? $executionResult->id : null,
                    ]);
                }
            }
        }
    }

    /**
     * Mock the FastAPI classification response
     */
    private function mockFastApiResponse(array $students, string $classificationType = 'topsis'): void {
        $classifications = [];

        foreach ($students as $student) {
            // Create a mock classification result
            $classifications[] = [
                'user_id' => $student->id,
                'level' => $this->mockClassificationLevel($student->id),
                'score' => $this->mockClassificationScore($student->id),
                'raw_data' => [
                    'materials' => [],
                    'method' => $classificationType,
                ],
            ];
        }

        // Mock the FastAPI response
        Http::fake([
            config('services.fastapi.url') . '/classify' => Http::response([
                'classifications' => $classifications,
            ], 200),
        ]);
    }

    /**
     * Mock classification level based on student ID
     */
    private function mockClassificationLevel(int $studentId): string {
        $levels = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'];

        // Use the student ID to deterministically pick a level for consistent testing
        return $levels[$studentId % count($levels)];
    }

    /**
     * Mock classification score based on student ID
     */
    private function mockClassificationScore(int $studentId): float {
        // Generate a score between 0.2 and 0.9 based on student ID
        return round(0.2 + (($studentId % 8) / 10), 2);
    }

    /**
     * Test classifying a single student
     */
    public function test_classify_single_student(): void {
        // Arrange
        $student = $this->students[0];
        $this->mockFastApiResponse([$student]);

        // Act
        $result = $this->service->runClassification([
            'course_id' => $this->course->id,
            'classification_type' => 'topsis',
            'student_id' => $student->id, // Custom parameter for single student
        ]);

        // Assert
        $this->assertEquals('success', $result['status']);
        $this->assertCount(1, $result['data']);

        // Verify the classification was saved
        $classification = StudentCognitiveClassification::where([
            'user_id' => $student->id,
            'course_id' => $this->course->id,
        ])->first();

        $this->assertNotNull($classification);
        $this->assertEquals($this->mockClassificationLevel($student->id), $classification->classification_level);
    }

    /**
     * Test classifying all students in a course
     */
    public function test_classify_all_students_in_course(): void {
        // Arrange
        $this->mockFastApiResponse($this->students);

        // Act
        $result = $this->service->runClassification([
            'course_id' => $this->course->id,
            'classification_type' => 'topsis',
        ]);

        // Assert
        $this->assertEquals('success', $result['status']);
        $this->assertCount(count($this->students), $result['data']);

        // Verify all students got classified
        foreach ($this->students as $student) {
            $classification = StudentCognitiveClassification::where([
                'user_id' => $student->id,
                'course_id' => $this->course->id,
            ])->first();

            $this->assertNotNull($classification);
            $this->assertEquals($this->mockClassificationLevel($student->id), $classification->classification_level);
            $this->assertEquals($this->mockClassificationScore($student->id), $classification->classification_score);
        }
    }

    /**
     * Test data export format
     */
    public function test_export_raw_data_to_excel(): void {
        // Act
        $response = $this->service->exportRawDataToExcel($this->course->id);

        // Assert
        $this->assertNotNull($response);
        $this->assertEquals('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', $response->headers->get('Content-Type'));
        $this->assertStringContainsString('raw_classification_data_course_' . $this->course->id, $response->headers->get('Content-Disposition'));
    }

    /**
     * Test the conversion of time from seconds to minutes
     */
    public function test_coding_time_conversion_to_minutes(): void {
        // Create a student with a known coding time
        $student = $this->students[0];
        $question = $this->learningMaterials[0]['questions'][0];

        // Update to a specific coding time for testing
        $exactSeconds = 150; // 2.5 minutes
        StudentScore::where('user_id', $student->id)
            ->where('learning_material_question_id', $question->id)
            ->update(['coding_time' => $exactSeconds]);

        // Get the student data
        $studentData = $this->invokePrivateMethod($this->service, 'gatherStudentData', [$this->course->id]);

        // Find the specific student and question
        $foundTime = null;
        foreach ($studentData as $data) {
            if ($data['user_id'] == $student->id) {
                foreach ($data['materials'] as $material) {
                    foreach ($material['questions'] as $q) {
                        if ($q['question_id'] == $question->id) {
                            $foundTime = $q['metrics']['coding_time'];
                            break 3;
                        }
                    }
                }
            }
        }

        // Assert the time was converted correctly
        $this->assertEquals(2.5, $foundTime);
    }

    /**
     * Helper method to invoke private methods for testing
     */
    private function invokePrivateMethod($object, $methodName, array $parameters = []) {
        $reflection = new \ReflectionClass(get_class($object));
        $method = $reflection->getMethod($methodName);
        $method->setAccessible(true);

        return $method->invokeArgs($object, $parameters);
    }
}
