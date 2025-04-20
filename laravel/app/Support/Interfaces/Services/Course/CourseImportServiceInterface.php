<?php

namespace App\Support\Interfaces\Services\Course;

interface CourseImportServiceInterface {
    /**
     * Import courses from a file.
     */
    public function import(string $filePath);

    /**
     * Preview the content of an import file without committing changes
     */
    public function preview(string $filePath);
}
