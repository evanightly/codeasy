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
     * The base directory for test case output files
     *
     * @var string
     */
    protected $baseDirectory = 'learning-material-question-test-cases';

    /**
     * Create a new test case
     */
    public function create(array $data): ?Model {
        // Handle file upload with extension included in filename
        if (isset($data['expected_output_file'])) {
            $extension = $data['expected_output_file']->getClientOriginalExtension();
            $filePath = $this->storeFile($data['expected_output_file'], $this->baseDirectory);

            if ($filePath) {
                $pathInfo = pathinfo($filePath);
                $data['expected_output_file'] = $pathInfo['basename']; // Store filename with extension
                $data['expected_output_file_extension'] = $extension; // Keep for compatibility
            }
        }

        return parent::create($data);
    }

    public function update($keyOrModel, array $data): ?Model {
        // Handle file upload for updates
        if (isset($data['expected_output_file'])) {
            // Get existing record to delete old file if exists
            $existingRecord = $this->repository->find($keyOrModel);
            if ($existingRecord && $existingRecord->expected_output_file) {
                $this->deleteFile($this->baseDirectory . '/' . $existingRecord->expected_output_file);
            }

            $extension = $data['expected_output_file']->getClientOriginalExtension();
            $filePath = $this->storeFile($data['expected_output_file'], $this->baseDirectory);

            if ($filePath) {
                $pathInfo = pathinfo($filePath);
                $data['expected_output_file'] = $pathInfo['basename']; // Store filename with extension
                $data['expected_output_file_extension'] = $extension; // Keep for compatibility
            }
        }

        return parent::update($keyOrModel, $data);
    }

    public function delete($keyOrModel): bool {
        // Get existing record to delete old file if exists
        $existingRecord = $this->repository->find($keyOrModel);
        if ($existingRecord && $existingRecord->expected_output_file) {
            $this->deleteFile($this->baseDirectory . '/' . $existingRecord->expected_output_file);
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
