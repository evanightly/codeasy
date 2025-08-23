<?php

namespace App\Services\LearningMaterialQuestionTestCase;

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class CognitiveLevelsTemplateService {
    /**
     * Generate and return the path to the cognitive levels Excel template
     */
    public function generateTemplate(): string {
        $templatePath = storage_path('app/templates/cognitive-levels-template.xlsx');

        // If template doesn't exist, generate it
        if (!file_exists($templatePath)) {
            $this->createTemplate($templatePath);
        }

        return $templatePath;
    }

    /**
     * Create the cognitive levels Excel template
     */
    private function createTemplate(string $templatePath): void {
        // Ensure templates directory exists
        $templatesDir = dirname($templatePath);
        if (!is_dir($templatesDir)) {
            mkdir($templatesDir, 0755, true);
        }

        // Create a new spreadsheet
        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();

        // Set headers
        $sheet->setCellValue('A1', 'test_case_pattern');
        $sheet->setCellValue('B1', 'cognitive_levels');

        // Style the headers
        $headerStyle = [
            'font' => [
                'bold' => true,
                'size' => 12,
            ],
            'fill' => [
                'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                'startColor' => [
                    'argb' => 'FFE2E8F0',
                ],
            ],
        ];
        $sheet->getStyle('A1:B1')->applyFromArray($headerStyle);

        // Sample data
        $sampleData = $this->getSampleData();

        // Add sample data
        $row = 2;
        foreach ($sampleData as $data) {
            $sheet->setCellValue('A' . $row, $data[0]);
            $sheet->setCellValue('B' . $row, $data[1]);
            $row++;
        }

        // Set column widths
        $sheet->getColumnDimension('A')->setWidth(70);
        $sheet->getColumnDimension('B')->setWidth(20);

        // Save the file
        $writer = new Xlsx($spreadsheet);
        $writer->save($templatePath);
    }

    /**
     * Get sample data for the template
     */
    private function getSampleData(): array {
        return [
            ['self.assertIn("pd.cut", student_code)', 'C1, C2'],
            ['self.assertIn("CGPA", student_code)', 'C1, C2'],
            ['self.assertIn("train_test_split", student_code)', 'C3'],
        ];
    }
}
