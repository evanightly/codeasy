# Test Case Excel Import Feature

## Overview

This feature allows bulk import of cognitive level classifications for test cases using Excel files. It uses smart string matching to automatically map test case patterns from the Excel file to actual test cases in the system.

## File Format

The Excel file should contain two columns:
- **test_case_pattern**: The pattern to match against test case inputs
- **cognitive_levels**: Comma-separated cognitive levels (e.g., "C1, C2")

### Example Excel Content

| test_case_pattern | cognitive_levels |
|-------------------|------------------|
| assert 'data_science' in globals() | C1, C2 |
| self.assertIn("read_csv", student_code) | C1, C2 |
| assert isinstance(data, test_np.ndarray) | C1, C2 |
| assert arr.shape == (3, 4) | C3 |

## How It Works

### String Matching Algorithm

The import feature uses a multi-tier matching approach to find the correct test cases:

1. **Exact Match**: First tries to find test cases where the `input` field contains the exact pattern
2. **Fuzzy Match**: If no exact match, it extracts key parts from the pattern and matches against test case inputs
3. **Function Extraction**: As a fallback, it extracts function/method names from quoted strings in the pattern

### Cognitive Level Validation

- Only valid cognitive levels (C1-C6) are accepted
- Invalid cognitive level formats are flagged as failed imports
- Multiple cognitive levels can be assigned to a single test case

## Usage

1. **Download Sample File**: Click "Sample Excel" to download a pre-formatted template
2. **Prepare Your Data**: Edit the Excel file with your test case patterns and cognitive levels
3. **Upload File**: Click "Select Excel File" and choose your .xlsx or .xls file
4. **Review Results**: The system will show successful and failed imports with detailed feedback
5. **Save Changes**: Use the "Save Changes" button to persist the updates to the database

## Import Results

The system provides comprehensive feedback:

- **Successful**: Number of test cases successfully matched and updated
- **Failed**: Number of entries that couldn't be matched or had invalid data
- **Total**: Total number of entries processed from the Excel file

### Detailed Results

For each import attempt, you'll see:
- **Successful matches**: Test case description, matched pattern, and assigned cognitive levels
- **Failed matches**: The entry that failed and the reason for failure

## Frontend-Only Operation

**Important**: This import feature only updates the UI state and doesn't perform any backend data mutations until you click "Save Changes". This allows you to:

- Review all changes before committing them
- Make additional manual adjustments
- Discard changes if needed

## Error Handling

Common error scenarios:
- **Invalid file format**: Only .xlsx and .xls files are accepted
- **No matching test case**: The pattern couldn't be matched to any existing test case
- **Invalid cognitive levels**: The cognitive level format is incorrect (must be C1-C6)
- **File parsing errors**: The Excel file structure is invalid

## Sample Data

The provided sample Excel file contains realistic test case patterns based on:
- Python variable assertions
- Library import checks
- NumPy array operations
- Pandas DataFrame operations
- Function existence and behavior tests
- Data science workflow validations

These patterns are derived from actual test cases used in the system's data science learning modules.
