<?php

namespace App\Support\Interfaces\Services\Course;

interface CourseImportServiceInterface {
    /**
     * Import courses from a file.
     */
    public function import(string $filePath);
}
