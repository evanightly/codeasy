<?php

namespace App\Services;

use Adobrovolsky97\LaravelRepositoryServicePattern\Services\BaseCrudService;
use App\Models\LearningMaterial;
use App\Models\StudentScore;
use App\Repositories\LearningMaterialRepository;
use App\Support\Interfaces\Repositories\LearningMaterialRepositoryInterface;
use App\Support\Interfaces\Services\LearningMaterialServiceInterface;
use App\Traits\Services\HandlesFileUpload;
use App\Traits\Services\HandlesPageSizeAll;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;

class LearningMaterialService extends BaseCrudService implements LearningMaterialServiceInterface {
    use HandlesFileUpload, HandlesPageSizeAll;

    /**
     * The base directory for learning material files
     *
     * @var string
     */
    protected $baseDirectory = 'learning-materials';

    /**
     * Create a new learning material with auto-ordering
     */
    public function create(array $data): ?Model {
        // Auto-calculate next order number if not provided or empty
        if (empty($data['order_number'])) {
            $data['order_number'] = $this->calculateNextOrderNumber($data['course_id'] ?? null);
        }

        // Handle file upload - store filename with extension
        if (isset($data['file'])) {
            $extension = $data['file']->getClientOriginalExtension();
            $filePath = $this->storeFile($data['file'], $this->baseDirectory);

            if ($filePath) {
                $pathInfo = pathinfo($filePath);
                $data['file'] = $pathInfo['basename']; // Store filename with extension
                $data['file_extension'] = $extension; // Keep extension field for compatibility
            }
        }

        return parent::create($data);
    }

    public function update($keyOrModel, array $data): ?Model {
        // Handle file upload for updates
        if (isset($data['file'])) {
            // Get existing record to delete old file if exists
            $existingRecord = $this->repository->find($keyOrModel);
            if ($existingRecord && $existingRecord->file) {
                $this->deleteFile($this->baseDirectory . '/' . $existingRecord->file);
            }

            $extension = $data['file']->getClientOriginalExtension();
            $filePath = $this->storeFile($data['file'], $this->baseDirectory);

            if ($filePath) {
                $pathInfo = pathinfo($filePath);
                $data['file'] = $pathInfo['basename']; // Store filename with extension
                $data['file_extension'] = $extension; // Keep extension field for compatibility
            }
        }

        return parent::update($keyOrModel, $data);
    }

    public function delete($keyOrModel): bool {
        // Get existing record to delete old file if exists
        $existingRecord = $this->repository->find($keyOrModel);
        if ($existingRecord && $existingRecord->file) {
            $this->deleteFile($this->baseDirectory . '/' . $existingRecord->file);
        }

        return parent::delete($keyOrModel);
    }

    public function getAllPaginated(array $search = [], int $pageSize = 15): LengthAwarePaginator {
        $this->handlePageSizeAll();

        return parent::getAllPaginated($search, $pageSize);
    }

    /**
     * Calculate the next order number for a course's learning materials
     *
     * @param  int|string|null  $courseId
     */
    protected function calculateNextOrderNumber($courseId): int {
        if (!$courseId) {
            return 1;
        }

        // Use repository methods to get data rather than direct DB access
        $materials = $this->getAll(['course_id' => $courseId]);

        if ($materials->isEmpty()) {
            return 1;
        }

        // Find the maximum order number
        $maxOrder = $materials->max('order_number');

        return (int) $maxOrder + 1;
    }

    /**
     * Get user progress for a learning material
     */
    public function getUserProgress(int $userId, int $materialId): array {
        /** @var LearningMaterial */
        $material = $this->findOrFail($materialId);
        // if (!$material) {
        //     return [
        //         'total' => 0,
        //         'completed' => 0,
        //         'percentage' => 0,
        //         'questions' => [],
        //     ];
        // }

        // Get all questions for this material
        $questions = $material->learning_material_questions()->where('active', true)->orderBy('order_number')->get();

        // Get all student scores for this user and these questions
        $questionIds = $questions->pluck('id')->toArray();
        $scores = StudentScore::where('user_id', $userId)
            ->whereIn('learning_material_question_id', $questionIds)
            ->get()
            ->keyBy('learning_material_question_id');

        $total = $questions->count();
        $completed = 0;
        $questionsProgress = [];

        foreach ($questions as $question) {
            $score = $scores->get($question->id);
            $isCompleted = $score && $score->completion_status;

            if ($isCompleted) {
                $completed++;
            }

            $questionsProgress[] = [
                'id' => $question->id,
                'title' => $question->title,
                'order_number' => $question->order_number,
                'completed' => $isCompleted,
                'score' => $score ? $score->score : 0,
                'coding_time' => $score ? $score->coding_time : 0,
                'trial_status' => $score ? $score->trial_status : false,
            ];
        }

        return [
            'total' => $total,
            'completed' => $completed,
            'percentage' => $total > 0 ? round(($completed / $total) * 100) : 0,
            'questions' => $questionsProgress,
        ];
    }

    /**
     * Get material details with user progress
     */
    public function getMaterialWithUserProgress(int $userId, int $materialId): ?array {
        $material = LearningMaterial::with(['course'])->find($materialId);
        if (!$material) {
            return null;
        }

        $progress = $this->getUserProgress($userId, $materialId);

        return [
            'material' => $material,
            'progress' => $progress,
        ];
    }

    /**
     * Check if a student has access to a learning material
     */
    public function studentHasAccess(int $userId, int $materialId): bool {
        $material = LearningMaterial::with(['course.classroom.students'])->find($materialId);

        if (!$material) {
            return false;
        }

        return $material->course->classroom->students()->where('user_id', $userId)->exists();
    }

    /**
     * Get next and previous question information
     */
    public function getQuestionNavigation(int $materialId, int $currentQuestionId): array {
        /** @var LearningMaterial */
        $material = $this->findOrFail($materialId);
        // if (!$material) {
        //     return ['next' => null, 'previous' => null];
        // }

        $questions = $material->learning_material_questions()
            ->where('active', true)
            ->orderBy('order_number')
            ->get();

        $currentIndex = $questions->search(function ($question) use ($currentQuestionId) {
            return $question->id === $currentQuestionId;
        });

        $previous = $currentIndex > 0 ? $questions[$currentIndex - 1] : null;
        $next = $currentIndex < $questions->count() - 1 ? $questions[$currentIndex + 1] : null;

        return [
            'next' => $next ? [
                'id' => $next->id,
                'title' => $next->title,
                'can_proceed' => true, // This will be overridden in StudentController
            ] : null,
            'previous' => $previous ? [
                'id' => $previous->id,
                'title' => $previous->title,
            ] : null,
        ];
    }

    /** @var LearningMaterialRepository */
    protected $repository;

    protected function getRepositoryClass(): string {
        return LearningMaterialRepositoryInterface::class;
    }
}
