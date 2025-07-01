<?php

namespace App\Support\Interfaces\Services;

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
     * Download a DOCX template file for importing courses.
     */
    public function downloadMaterialTemplate();

    /**
     * Preview the import file contents
     */
    public function previewImport(Request $request);

    /**
     * Get enrolled courses for the current user.
     */
    public function getEnrolledCoursesForCurrentUser(array $search = [], int $pageSize = 15);

    /**
     * Get student progress percentage for each course.
     *
     * @param  array|\Illuminate\Support\Collection  $courses
     */
    public function getStudentCoursesProgress(int $userId, $courses): array;

    /**
     * Get student progress percentage for each material in a course.
     *
     * @param  array|\Illuminate\Support\Collection  $materials
     */
    public function getStudentMaterialsProgress(int $userId, $materials): array;
}
