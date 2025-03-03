<?php

namespace App\Services;

use Adobrovolsky97\LaravelRepositoryServicePattern\Services\BaseCrudService;
use App\Repositories\LearningMaterialQuestionTestCaseRepository;
use App\Support\Interfaces\Repositories\LearningMaterialQuestionTestCaseRepositoryInterface;
use App\Support\Interfaces\Services\LearningMaterialQuestionTestCaseServiceInterface;
use App\Traits\Services\HandlesFileUpload;
use App\Traits\Services\HandlesPageSizeAll;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;

class LearningMaterialQuestionTestCaseService extends BaseCrudService implements LearningMaterialQuestionTestCaseServiceInterface {
    use HandlesFileUpload, HandlesPageSizeAll;

    /**
     * The base directory for learning material files
     *
     * @var string
     */
    protected $baseDirectory = 'learning-material-question-test-cases';

    /**
     * Create a new learning material with auto-ordering
     */
    public function create(array $data): ?Model {
        // Handle file upload - store directly in base directory
        if (isset($data['expected_output_file'])) {
            // Get original extension
            $extension = $data['expected_output_file']->getClientOriginalExtension();

            // Use the trait method for uploading
            $filePath = $this->uploadFile(
                $data['expected_output_file'],
                $this->baseDirectory
            );

            // Get just the filename without extension for storage
            $pathParts = pathinfo($filePath);
            $data['expected_output_file'] = $pathParts['filename']; // Just filename without extension
            $data['expected_output_file_extension'] = $extension;
        }

        return parent::create($data);
    }

    public function update($keyOrModel, array $data): ?Model {
        // Handle file upload for updates
        if (isset($data['expected_output_file'])) {
            // Get existing record to delete old file if exists
            $existingRecord = $this->repository->find($keyOrModel);
            if ($existingRecord && $existingRecord->expectedOutputFile) {
                $this->deleteFile($this->baseDirectory . '/' .
                    $existingRecord->expectedOutputFile . '.' . $existingRecord->expected_output_file_extension);
            }

            // Get original extension
            $extension = $data['expected_output_file']->getClientOriginalExtension();

            // Use the trait method for uploading
            $filePath = $this->uploadFile(
                $data['expected_output_file'],
                $this->baseDirectory
            );

            // Get just the filename without extension for storage
            $pathParts = pathinfo($filePath);
            $data['expected_output_file'] = $pathParts['filename']; // Just filename without extension
            $data['expected_output_file_extension'] = $extension;
        }

        return parent::update($keyOrModel, $data);
    }

    public function delete($keyOrModel): bool {
        // Get existing record to delete old file if exists
        $existingRecord = $this->repository->find($keyOrModel);
        if ($existingRecord && $existingRecord->expectedOutputFile) {
            $this->deleteFile($this->baseDirectory . '/' .
                $existingRecord->expectedOutputFile . '.' . $existingRecord->expected_output_file_extension);
        }

        return parent::delete($keyOrModel);
    }

    public function getAllPaginated(array $search = [], int $pageSize = 15): LengthAwarePaginator {
        $this->handlePageSizeAll();

        return parent::getAllPaginated($search, $pageSize);
    }

    /** @var LearningMaterialQuestionTestCaseRepository */
    protected $repository;

    protected function getRepositoryClass(): string {
        return LearningMaterialQuestionTestCaseRepositoryInterface::class;
    }
}
