<?php

namespace App\Support\Interfaces\Services\User;

interface StudentImportServiceInterface {
    /**
     * Import students from an Excel or CSV file
     */
    public function import(string $filePath): array;

    /**
     * Preview the content of an import file without committing changes
     */
    public function preview(string $filePath): array;

    /**
     * Preview the content of a CSV file
     */
    public function previewCsv(\Illuminate\Http\UploadedFile $file): array;

    /**
     * Preview the content of an Excel file
     */
    public function previewExcel(\Illuminate\Http\UploadedFile $file): array;

    /**
     * Generate a template Excel file for student import
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function generateExcelTemplate();

    /**
     * Generate a template CSV file for student import
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function generateCsvTemplate();
}
