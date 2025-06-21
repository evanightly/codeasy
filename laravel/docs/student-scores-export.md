# Student Scores Export Feature

## Overview

The Student Scores Export feature allows you to export Excel data showing completion rates for all students across all materials. The completion rate is calculated as the percentage of completed test cases versus total test cases for each material.

## Features

- **Tabular Format**: Students as rows, materials as columns
- **Completion Rates**: Shows percentage completion (completed test cases / total test cases)
- **Color Coding**: Visual indicators for performance levels
    - Green (≥80%): Excellent completion
    - Yellow (≥60%): Good completion
    - Orange (≥40%): Moderate completion
    - Red (>0%): Low completion
    - White (0%): No attempts
- **Filtering**: Support for course_id and learning_material_id filters
- **Auto-sizing**: Columns automatically sized for readability

## Backend Implementation

### Intent Enum

```php
case STUDENT_SCORE_INDEX_EXPORT_TABULAR_DATA = 'STUDENT_SCORE_INDEX_EXPORT_TABULAR_DATA';
```

### Service Method

```php
public function exportTabularDataToExcel(array $filters = []): \Symfony\Component\HttpFoundation\BinaryFileResponse
```

### Controller Handler

The `StudentScoreController@index` method handles the export when the intent parameter is set:

```php
if ($intent === IntentEnum::STUDENT_SCORE_INDEX_EXPORT_TABULAR_DATA->value) {
    return $this->studentScoreService->exportTabularDataToExcel($request->query());
}
```

## Frontend Implementation

### Service Hook

```typescript
const exportMutation = studentScoreServiceHook.useExportTabularData();

// Usage example
const handleExport = () => {
    exportMutation.mutate({
        course_id: 1, // Optional filter
        learning_material_id: 5, // Optional filter
    });
};
```

## API Usage

### Direct URL Access

```
GET /student-scores?intent=STUDENT_SCORE_INDEX_EXPORT_TABULAR_DATA&course_id=1
```

### Frontend Button Example

```tsx
import { studentScoreServiceHook } from '@/Services/studentScoreServiceHook';

function ExportButton({ courseId }: { courseId?: number }) {
    const exportMutation = studentScoreServiceHook.useExportTabularData();

    const handleExport = () => {
        exportMutation.mutate({
            course_id: courseId,
        });
    };

    return (
        <button onClick={handleExport} disabled={exportMutation.isPending}>
            {exportMutation.isPending ? 'Exporting...' : 'Export Excel'}
        </button>
    );
}
```

## Excel File Structure

### Headers

- Column A: Student Name
- Column B: Student ID
- Column C+: Material titles with "(% Complete)" suffix
- Last Column: Overall Average (%)

### Data Format

- Each row represents a student
- Each material column shows completion percentage (e.g., "85.5%")
- Overall average calculated across all materials
- Color coding applied based on completion rates

### Example Output

```
Student Name | Student ID | Material 1 (% Complete) | Material 2 (% Complete) | Overall Average (%)
John Doe     | 123        | 85.5%                   | 92.0%                   | 88.75%
Jane Smith   | 124        | 67.2%                   | 78.9%                   | 73.05%
```

## Filters

### Available Filters

- `course_id`: Filter by specific course
- `learning_material_id`: Filter by specific learning material

### Usage

```php
// Export all data
$service->exportTabularDataToExcel();

// Export for specific course
$service->exportTabularDataToExcel(['course_id' => 1]);

// Export for specific material
$service->exportTabularDataToExcel(['learning_material_id' => 5]);

// Export for specific course and material
$service->exportTabularDataToExcel([
    'course_id' => 1,
    'learning_material_id' => 5
]);
```

## File Output

- **Filename**: `student_scores_tabular_data_YYYY-MM-DD_HH-MM-SS.xlsx`
- **Format**: Excel (.xlsx)
- **Download**: Automatic download with `deleteFileAfterSend`
- **Storage**: Temporary files in `storage/app/temp/`

## Dependencies

- PHPSpreadsheet: Already included in composer.json (`"phpoffice/phpspreadsheet": "^4.2"`)
- Laravel Storage: Uses public disk for temporary file creation

## Security & Performance

- **Permissions**: Controlled by existing StudentScore permissions
- **Memory**: Efficient processing for large datasets
- **Cleanup**: Temporary files automatically deleted after download
- **Validation**: Filters validated through existing request validation

## Testing

To test the export functionality:

1. Ensure you have student scores with test case data
2. Access the export URL with appropriate permissions
3. Verify Excel file downloads with correct data structure
4. Check color coding and formatting

## Error Handling

- Missing data: Shows "Unknown" for missing student/material names
- Empty results: Creates Excel with headers only
- File errors: Proper error responses with meaningful messages
