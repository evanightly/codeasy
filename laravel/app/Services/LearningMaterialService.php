<?php

namespace App\Services;

use Adobrovolsky97\LaravelRepositoryServicePattern\Services\BaseCrudService;
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

    /** @var LearningMaterialRepository */
    protected $repository;

    protected function getRepositoryClass(): string {
        return LearningMaterialRepositoryInterface::class;
    }
}
