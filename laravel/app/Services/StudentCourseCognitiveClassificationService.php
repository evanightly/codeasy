<?php

namespace App\Services;

use App\Models\StudentCognitiveClassification;
use App\Models\StudentCourseCognitiveClassification;
use App\Repositories\StudentCourseCognitiveClassificationRepository;
use App\Support\Interfaces\Repositories\StudentCourseCognitiveClassificationRepositoryInterface;
use App\Support\Interfaces\Services\StudentCognitiveClassificationServiceInterface;
use App\Support\Interfaces\Services\StudentCourseCognitiveClassificationServiceInterface;
use App\Traits\Services\HandlesPageSizeAll;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class StudentCourseCognitiveClassificationService extends BaseCrudService implements StudentCourseCognitiveClassificationServiceInterface {
    use HandlesPageSizeAll;

    /** @var StudentCourseCognitiveClassificationRepository */
    protected $repository;

    public function __construct(
        protected StudentCognitiveClassificationServiceInterface $studentCognitiveClassificationService
    ) {
        parent::__construct();
    }

    public function getAllPaginated(array $search = [], int $pageSize = 15): LengthAwarePaginator {
        $this->handlePageSizeAll();

        return parent::getAllPaginated($search, $pageSize);
    }

    /**
     * Get or create a course-level cognitive classification for a student
     * This syncs with material-level classifications and aggregates the results
     */
    public function getOrCreateCourseClassification(
        int $userId,
        int $courseId,
        string $classificationType = 'topsis'
    ): StudentCourseCognitiveClassification {
        // Get existing material-level classifications
        $materialClassifications = $this->studentCognitiveClassificationService->getMaterialClassificationsForStudent(
            $userId,
            $courseId,
            $classificationType
        );

        // Get existing course-level classification if any
        $courseClassification = $this->studentCognitiveClassificationService->getCourseClassificationForStudent(
            $userId,
            $courseId,
            $classificationType
        );

        if ($materialClassifications->isEmpty()) {
            // No materials classified yet, create an empty classification
            return $this->getOrCreateEmptyCourseClassification($userId, $courseId, $classificationType);
        }

        // If no course-level classification exists or if it needs updating
        if (!$courseClassification || $this->needsUpdating($courseClassification, $materialClassifications)) {
            return $this->createFromMaterialClassifications($userId, $courseId, $classificationType, $materialClassifications);
        }

        // Add course classification to the database if it only exists in StudentCognitiveClassifications but not in StudentCourseCognitiveClassifications
        if ($courseClassification && !$this->modelClass->where([
            'user_id' => $userId,
            'course_id' => $courseId,
            'classification_type' => $classificationType,
        ])->exists()) {
            return $this->createFromCourseClassification($courseClassification);
        }

        // Find the existing record in StudentCourseCognitiveClassification
        return $this->modelClass->where([
            'user_id' => $userId,
            'course_id' => $courseId,
            'classification_type' => $classificationType,
        ])->first();
    }

    /**
     * Get detailed student course cognitive classification with material breakdowns
     */
    public function getDetailedClassification(
        StudentCourseCognitiveClassification $classification
    ): array {
        // Get material level classifications
        $materialClassifications = $this->studentCognitiveClassificationService->getMaterialClassificationsForStudent(
            $classification->user_id,
            $classification->course_id,
            $classification->classification_type
        );

        // Get detailed information for each material classification
        $materialDetails = $materialClassifications->map(function ($materialClassification) {
            return $this->studentCognitiveClassificationService->getClassificationDetails($materialClassification);
        });

        // Structure the response with overall classification and material details
        return [
            'classification' => $classification,
            'materials' => $materialDetails,
            'raw_data' => $classification->raw_data,
            'recommendations' => $classification->raw_data['recommendations'] ?? [],
            'calculation_details' => $classification->raw_data['calculation_details'] ?? null,
        ];
    }

    /**
     * Generate summary report for student course cognitive classifications
     */
    public function getCourseCognitiveReport(
        int $courseId,
        string $classificationType = 'topsis'
    ): array {
        // Get all students in the course
        $courseClassifications = $this->repository->getByCourseId($courseId, $classificationType);

        // Structure by cognitive level
        $levelCounts = [
            'Remember' => 0,
            'Understand' => 0,
            'Apply' => 0,
            'Analyze' => 0,
            'Evaluate' => 0,
            'Create' => 0,
        ];

        // Count students at each level
        foreach ($courseClassifications as $classification) {
            if (isset($levelCounts[$classification->classification_level])) {
                $levelCounts[$classification->classification_level]++;
            }
        }

        return [
            'total_students' => $courseClassifications->count(),
            'level_distribution' => $levelCounts,
            'classifications' => $courseClassifications,
        ];
    }

    /**
     * Determine if a course classification needs updating based on material classifications
     */
    private function needsUpdating(
        StudentCognitiveClassification $courseClassification,
        Collection $materialClassifications
    ): bool {
        // Check if the course classification is older than the newest material classification
        $newestMaterialDate = $materialClassifications->max('updated_at');

        return $courseClassification->updated_at < $newestMaterialDate;
    }

    /**
     * Create a course-level classification from material classifications
     */
    private function createFromMaterialClassifications(
        int $userId,
        int $courseId,
        string $classificationType,
        Collection $materialClassifications
    ): StudentCourseCognitiveClassification {
        // Calculate average score across materials
        $totalScore = $materialClassifications->sum('classification_score');
        $avgScore = $totalScore / $materialClassifications->count();

        // Determine classification level using rule base
        $level = $this->determineClassificationLevel($avgScore);

        // Gather recommendations
        $allRecommendations = [];
        foreach ($materialClassifications as $classification) {
            if (isset($classification->raw_data['recommendations'])) {
                $allRecommendations = array_merge(
                    $allRecommendations,
                    $classification->raw_data['recommendations']
                );
            }
        }

        // Create raw data
        $rawData = [
            'material_classifications' => $materialClassifications->map(function ($classification) {
                return [
                    'id' => $classification->id,
                    'material_id' => $classification->learning_material_id,
                    'material_name' => $classification->learning_material ? $classification->learning_material->title : null,
                    'level' => $classification->classification_level,
                    'score' => $classification->classification_score,
                ];
            })->toArray(),
            'recommendations' => array_slice($allRecommendations, 0, 5), // Limit to top 5 recommendations
            'calculation_details' => [
                'material_count' => $materialClassifications->count(),
                'average_score' => $avgScore,
            ],
        ];

        // Create or update the StudentCourseCognitiveClassification record
        $courseClassification = $this->repository->updateOrCreate(
            [
                'user_id' => $userId,
                'course_id' => $courseId,
                'classification_type' => $classificationType,
            ],
            [
                'user_id' => $userId,
                'course_id' => $courseId,
                'classification_type' => $classificationType,
                'classification_level' => $level,
                'classification_score' => $avgScore,
                'raw_data' => $rawData,
                'classified_at' => Carbon::now(),
            ]
        );

        return $courseClassification;
    }

    /**
     * Create a course-level classification record from an existing StudentCognitiveClassification course-level record
     */
    private function createFromCourseClassification(
        StudentCognitiveClassification $courseClassification
    ): StudentCourseCognitiveClassification {
        return $this->repository->create([
            'user_id' => $courseClassification->user_id,
            'course_id' => $courseClassification->course_id,
            'classification_type' => $courseClassification->classification_type,
            'classification_level' => $courseClassification->classification_level,
            'classification_score' => $courseClassification->classification_score,
            'raw_data' => $courseClassification->raw_data,
            'classified_at' => $courseClassification->classified_at,
        ]);
    }

    /**
     * Create an empty course classification when no material classifications exist
     */
    private function getOrCreateEmptyCourseClassification(
        int $userId,
        int $courseId,
        string $classificationType
    ): StudentCourseCognitiveClassification {
        return $this->repository->updateOrCreate(
            [
                'user_id' => $userId,
                'course_id' => $courseId,
                'classification_type' => $classificationType,
            ],
            [
                'user_id' => $userId,
                'course_id' => $courseId,
                'classification_type' => $classificationType,
                'classification_level' => 'Not Classified',
                'classification_score' => 0,
                'raw_data' => [
                    'material_classifications' => [],
                    'recommendations' => ['Complete some learning materials to receive a cognitive classification.'],
                ],
                'classified_at' => Carbon::now(),
            ]
        );
    }

    /**
     * Determine classification level based on score using the rule base
     */
    private function determineClassificationLevel(float $score): string {
        // Apply the rule base as defined in requirements
        if ($score >= 0.85) {
            return 'Create';
        } elseif ($score >= 0.70) {
            return 'Evaluate';
        } elseif ($score >= 0.55) {
            return 'Analyze';
        } elseif ($score >= 0.40) {
            return 'Apply';
        } elseif ($score >= 0.25) {
            return 'Understand';
        }

        return 'Remember';
    }

    /**
     * Create or update course-level classification from raw data
     */
    public function getOrCreateCourseClassificationsFromRawData(
        int $userId,
        int $courseId,
        string $classificationType,
        string $level,
        float $score,
        array $rawData,
        $classifiedAt = null
    ): StudentCourseCognitiveClassification {
        return $this->repository->updateOrCreate(
            [
                'user_id' => $userId,
                'course_id' => $courseId,
                'classification_type' => $classificationType,
            ],
            [
                'user_id' => $userId,
                'course_id' => $courseId,
                'classification_type' => $classificationType,
                'classification_level' => $level,
                'classification_score' => $score,
                'raw_data' => $rawData,
                'classified_at' => $classifiedAt ?? \Carbon\Carbon::now(),
            ]
        );
    }

    protected function getRepositoryClass(): string {
        return StudentCourseCognitiveClassificationRepositoryInterface::class;
    }
}
