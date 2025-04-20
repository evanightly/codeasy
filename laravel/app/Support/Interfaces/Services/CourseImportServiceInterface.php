<?php

namespace App\Support\Interfaces\Services;

interface CourseImportServiceInterface
{
    /**
     * Preview import data without saving to database
     * 
     * @param string $filePath Path to the uploaded file
     * @return array Preview data with success/error status
     */
    public function preview(string $filePath): array;

    /**
     * Import courses from a file
     * 
     * @param string $filePath Path to the uploaded file
     * @return array Import results with success/error status
     */
    public function import(string $filePath): array;
}