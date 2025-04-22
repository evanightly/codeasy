<?php

namespace App\Support\Interfaces\Services;

use Adobrovolsky97\LaravelRepositoryServicePattern\Services\Contracts\BaseCrudServiceInterface;
use Illuminate\Http\Request;

interface CourseServiceInterface extends BaseCrudServiceInterface {
    /**
     * Import courses from a file.
     */
    public function import(Request $request);

    /**
     * Download a template file for importing courses.
     */
    public function downloadTemplate();

    /**
     * Preview the import file contents
     */
    public function previewImport(Request $request);

    /**
     * Get student progress percentage for each course.
     *
     * @param  array|\Illuminate\Support\Collection  $courses
     */
    public function getStudentCoursesProgress(int $userId, $courses): array;
}
