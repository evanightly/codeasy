<?php

namespace App\Support\Interfaces\Services;

use Illuminate\Http\Request;

interface LearningMaterialQuestionTestCaseServiceInterface extends BaseCrudServiceInterface {
    /**
     * Import test cases from a file.
     */
    public function import(Request $request);

    /**
     * Download a CSV template file for importing test cases.
     */
    public function downloadTemplate();

    /**
     * Download an Excel template file for importing test cases.
     */
    public function downloadExcelTemplate();

    /**
     * Preview the import file contents
     */
    public function previewImport(Request $request);
}
