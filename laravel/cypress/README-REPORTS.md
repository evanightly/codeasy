# Cypress Test Report Generation

This project now supports multiple output formats for Cypress test results:

## Available Output Formats

### 1. JSON Format

- **File**: `cypress/reports/json/test-results.json`
- **Usage**: `./cypress-e2e.sh --json`
- **Description**: Machine-readable JSON format with detailed test results

### 2. HTML Format

- **File**: `cypress/reports/html/test-results.html`
- **Usage**: `./cypress-e2e.sh --html`
- **Description**: Interactive HTML report with charts and detailed test information

### 3. Excel/CSV Format

- **File**: `cypress/reports/excel/test-results.csv`
- **Usage**: `./cypress-e2e.sh --excel`
- **Description**: Excel-compatible CSV file with test results and summary

### 4. All Formats

- **Usage**: `./cypress-e2e.sh --all-formats`
- **Description**: Generates all report formats in one run

## Usage Examples

```bash
# Run tests with default headless mode (no special reports)
./cypress-e2e.sh

# Run tests and generate HTML report
./cypress-e2e.sh --html

# Run tests and generate Excel/CSV report
./cypress-e2e.sh --excel

# Run tests and generate JSON report
./cypress-e2e.sh --json

# Run tests and generate all report formats
./cypress-e2e.sh --all-formats

# Run specific test with HTML report
./cypress-e2e.sh --html --spec "e2e/login.cy.ts"

# Only reset database (no tests)
./cypress-e2e.sh --reset-only

# Open Cypress in interactive mode
./cypress-e2e.sh --open
```

## Report Conversion

You can also convert existing test results or generate reports without running from the main script:

```bash
# Navigate to laravel directory first
cd laravel

# Generate reports by running tests
./cypress-reports.sh --html
./cypress-reports.sh --excel
./cypress-reports.sh --all

# Convert existing JSON results to Excel
./cypress-reports.sh --convert-json cypress/reports/json/test-results.json
```

## Report Structure

### JSON Report

Contains detailed test information including:

- Test titles and descriptions
- Pass/fail status
- Execution duration
- Error messages
- File paths

### HTML Report

Interactive report with:

- Test summary dashboard
- Pass/fail statistics
- Detailed test results
- Screenshots (if enabled)
- Charts and graphs

### Excel/CSV Report

Spreadsheet-compatible format with:

- Test title, status, duration
- Error messages
- Summary statistics
- Success rate calculation

## Directory Structure

```
laravel/cypress/reports/
├── json/
│   └── test-results.json
├── html/
│   ├── test-results.html
│   └── final-report.html
├── excel/
│   └── test-results.csv
└── xml/
    └── test-results-[hash].xml
```

## Dependencies

The following packages are required for report generation:

- `cypress-multi-reporters`
- `mocha-junit-reporter`
- `mochawesome`
- `mochawesome-merge`
- `mochawesome-report-generator`
- `marge`

These are automatically installed when you run the setup.
