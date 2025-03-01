<?php

namespace App\Services;

use Adobrovolsky97\LaravelRepositoryServicePattern\Services\BaseCrudService;
use App\Repositories\LearningMaterialQuestionRepository;
use App\Support\Interfaces\Repositories\LearningMaterialQuestionRepositoryInterface;
use App\Support\Interfaces\Services\LearningMaterialQuestionServiceInterface;
use App\Traits\Services\HandlesFileUpload;
use App\Traits\Services\HandlesPageSizeAll;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;

class LearningMaterialQuestionService extends BaseCrudService implements LearningMaterialQuestionServiceInterface {
    use HandlesFileUpload, HandlesPageSizeAll;

    /**
     * The base directory for question files
     *
     * @var string
     */
    protected $baseDirectory = 'learning_material_questions';

    public function create(array $data): ?Model {
        // Auto-calculate order_number if not provided or empty
        if (empty($data['order_number'])) {
            $data['order_number'] = $this->calculateNextOrderNumber($data['learning_material_id'] ?? null);
        }

        // Handle file upload directly to the base directory
        if (isset($data['file'])) {
            // Get original extension
            $extension = $data['file']->getClientOriginalExtension();

            // Use the trait method for uploading
            $filePath = $this->uploadFile(
                $data['file'],
                $this->baseDirectory
            );

            // Get just the filename without extension for storage
            $pathParts = pathinfo($filePath);
            $data['file'] = $pathParts['filename']; // Just filename without extension
            $data['file_extension'] = $extension;
        }

        return parent::create($data);
    }

    public function update($keyOrModel, array $data): ?Model {
        // Handle file upload for updates
        if (isset($data['file'])) {
            // Get existing record to delete old file if exists
            $existingRecord = $this->repository->find($keyOrModel);
            if ($existingRecord && $existingRecord->file) {
                $this->deleteFile($this->baseDirectory . '/' .
                    $existingRecord->file . '.' . $existingRecord->file_extension);
            }

            // Get original extension
            $extension = $data['file']->getClientOriginalExtension();

            // Use the trait method for uploading
            $filePath = $this->uploadFile(
                $data['file'],
                $this->baseDirectory
            );

            // Get just the filename without extension for storage
            $pathParts = pathinfo($filePath);
            $data['file'] = $pathParts['filename']; // Just filename without extension
            $data['file_extension'] = $extension;
        }

        return parent::update($keyOrModel, $data);
    }

    public function getAllPaginated(array $search = [], int $pageSize = 15): LengthAwarePaginator {
        $this->handlePageSizeAll();

        return parent::getAllPaginated($search, $pageSize);
    }

    /** @var LearningMaterialQuestionRepository */
    protected $repository;

    protected function getRepositoryClass(): string {
        return LearningMaterialQuestionRepositoryInterface::class;
    }

    /**
     * Calculate the next order number for questions within a learning material
     *
     * @param  int|string|null  $materialId  The learning material ID
     */
    protected function calculateNextOrderNumber($materialId): int {
        if (!$materialId) {
            return 1;
        }

        // Use repository methods to get data through the service pattern
        $questions = $this->repository->getAll(['learning_material_id' => $materialId]);

        if ($questions->isEmpty()) {
            return 1;
        }

        // Find the maximum order number
        $maxOrder = $questions->max('order_number');

        return (int) $maxOrder + 1;
    }

    /**
     * Reorder questions for a learning material
     * Updates all questions to have sequential order_numbers
     *
     * @param  int|string  $materialId
     */
    public function reorderQuestionsForMaterial($materialId): bool {
        $questions = $this->repository->getAll([
            'learning_material_id' => $materialId,
        ]);

        if ($questions->isEmpty()) {
            return true;
        }

        // Sort questions by current order and creation date
        $sortedQuestions = $questions->sortBy([
            ['order_number', 'asc'],
            ['created_at', 'asc'],
        ]);

        // Assign sequential numbers
        $order = 1;
        foreach ($sortedQuestions as $question) {
            $question->order_number = $order++;
            $question->save();
        }

        return true;
    }
}
