<?php

namespace App\Services;

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

            // Calculate score based on test case completion percentage
            $calculatedScore = 0;
            if ($score && $score->test_case_total_count > 0) {
                $calculatedScore = round(($score->test_case_complete_count / $score->test_case_total_count) * 100);
            }

            $questionsProgress[] = [
                'id' => $question->id,
                'title' => $question->title,
                'order_number' => $question->order_number,
                'completed' => $isCompleted,
                'score' => $calculatedScore,
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

    /**
     * Get PDF file as base64 encoded string
     *
     * Handles large files intelligently:
     * - Files under 50MB: Full base64 encoding
     * - Files 50MB-200MB: Chunked encoding with memory management
     * - Files over 200MB: Returns fallback to direct URL
     */
    public function getPdfAsBase64(string $filePath): array {
        try {
            // Validate file path to prevent directory traversal
            $cleanPath = str_replace(['../', './'], '', $filePath);
            $fullPath = storage_path('app/public/' . $cleanPath);

            // Check if file exists and is a PDF
            if (!file_exists($fullPath)) {
                return [
                    'success' => false,
                    'message' => 'File not found',
                    'fallback_url' => '/storage/' . $cleanPath,
                ];
            }

            // Verify it's a PDF file
            $mimeType = mime_content_type($fullPath);
            if ($mimeType !== 'application/pdf') {
                return [
                    'success' => false,
                    'message' => 'File is not a PDF',
                    'fallback_url' => '/storage/' . $cleanPath,
                ];
            }

            // Get file size and determine encoding strategy
            $fileSize = filesize($fullPath);
            $fileSizeMB = $fileSize / (1024 * 1024);

            // Size limits (in bytes)
            $maxDirectBase64Size = 50 * 1024 * 1024; // 50MB
            $maxChunkedBase64Size = 200 * 1024 * 1024; // 200MB
            $maxMemoryLimit = ini_get('memory_limit');
            $maxMemoryBytes = $this->convertToBytes($maxMemoryLimit);

            // For very large files (>200MB), return fallback immediately
            if ($fileSize > $maxChunkedBase64Size) {
                return [
                    'success' => false,
                    'message' => "File too large for base64 encoding ({$fileSizeMB}MB). Using direct URL fallback.",
                    'file_size_mb' => round($fileSizeMB, 2),
                    'fallback_url' => '/storage/' . $cleanPath,
                    'reason' => 'file_too_large',
                ];
            }

            // Check if we have enough memory (base64 needs ~133% of original size + working memory)
            $estimatedMemoryNeeded = $fileSize * 2; // Conservative estimate
            if ($estimatedMemoryNeeded > ($maxMemoryBytes * 0.7)) { // Use only 70% of available memory
                return [
                    'success' => false,
                    'message' => 'Insufficient memory for base64 encoding. Using direct URL fallback.',
                    'file_size_mb' => round($fileSizeMB, 2),
                    'estimated_memory_mb' => round($estimatedMemoryNeeded / (1024 * 1024), 2),
                    'available_memory_mb' => round($maxMemoryBytes / (1024 * 1024), 2),
                    'fallback_url' => '/storage/' . $cleanPath,
                    'reason' => 'insufficient_memory',
                ];
            }

            // For small files (<50MB), use direct encoding
            if ($fileSize <= $maxDirectBase64Size) {
                $fileContent = file_get_contents($fullPath);
                if ($fileContent === false) {
                    return [
                        'success' => false,
                        'message' => 'Unable to read file',
                        'fallback_url' => '/storage/' . $cleanPath,
                    ];
                }

                $base64 = base64_encode($fileContent);

                return [
                    'success' => true,
                    'data' => 'data:application/pdf;base64,' . $base64,
                    'filename' => basename($filePath),
                    'file_size_mb' => round($fileSizeMB, 2),
                    'encoding_method' => 'direct',
                ];
            }

            // For medium files (50-200MB), use chunked encoding
            return $this->encodeFileInChunks($fullPath, $cleanPath, $fileSizeMB);

        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Error processing file: ' . $e->getMessage(),
                'fallback_url' => isset($cleanPath) ? '/storage/' . $cleanPath : null,
            ];
        }
    }

    /**
     * Encode large files in chunks to manage memory usage
     */
    private function encodeFileInChunks(string $fullPath, string $cleanPath, float $fileSizeMB): array {
        try {
            $handle = fopen($fullPath, 'rb');
            if (!$handle) {
                throw new \Exception('Cannot open file for reading');
            }

            $chunkSize = 1024 * 1024; // 1MB chunks
            $base64Chunks = [];

            while (!feof($handle)) {
                $chunk = fread($handle, $chunkSize);
                if ($chunk === false) {
                    fclose($handle);
                    throw new \Exception('Error reading file chunk');
                }
                $base64Chunks[] = base64_encode($chunk);
            }

            fclose($handle);

            $base64 = implode('', $base64Chunks);

            return [
                'success' => true,
                'data' => 'data:application/pdf;base64,' . $base64,
                'filename' => basename($cleanPath),
                'file_size_mb' => round($fileSizeMB, 2),
                'encoding_method' => 'chunked',
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Error in chunked encoding: ' . $e->getMessage(),
                'fallback_url' => '/storage/' . $cleanPath,
            ];
        }
    }

    /**
     * Convert PHP memory limit string to bytes
     */
    private function convertToBytes(string $value): int {
        $value = trim($value);
        $last = strtolower($value[strlen($value) - 1]);
        $value = (int) $value;

        switch ($last) {
            case 'g':
                $value *= 1024;
            case 'm':
                $value *= 1024;
            case 'k':
                $value *= 1024;
        }

        return $value;
    }

    /** @var LearningMaterialRepository */
    protected $repository;

    protected function getRepositoryClass(): string {
        return LearningMaterialRepositoryInterface::class;
    }
}
