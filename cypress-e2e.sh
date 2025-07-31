#!/bin/bash

# Cypress E2E Test Runner with Database Reset
# This script provides reliable database reset before running Cypress tests

set -e

echo "🚀 Cypress E2E Test Runner with Database Reset"
echo "=============================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "dc.sh" ]; then
    print_error "dc.sh not found. Please run this script from the project root directory."
    exit 1
fi

# Check if Laravel container is running
print_status "Checking Docker containers..."
if ! docker ps --filter "name=codeasy_laravel_dev" --format "{{.Names}}" | grep -q "codeasy_laravel_dev"; then
    print_error "Laravel container is not running. Please start the development environment first:"
    echo "  ./dc.sh dev"
    exit 1
fi

print_success "Laravel container is running"

# Reset database
print_status "Resetting database for clean test environment..."
echo ""

if ./dc.sh artisan cypress:reset-db; then
    print_success "Database reset completed successfully"
else
    print_error "Database reset failed"
    exit 1
fi

echo ""

# Check if Cypress should be run
if [ "$1" = "--reset-only" ]; then
    print_success "Database reset complete. Skipping Cypress execution."
    echo ""
    echo "You can now run Cypress tests with:"
    echo "  cd laravel && npm run cypress:run"
    echo "  cd laravel && npm run cypress:open"
    exit 0
fi

# Navigate to Laravel directory for Cypress
print_status "Changing to Laravel directory for Cypress execution..."
cd laravel

# Check if Cypress is available
if [ ! -f "package.json" ]; then
    print_error "package.json not found in laravel directory"
    exit 1
fi

# Default to running all tests
CYPRESS_COMMAND="cypress:run:headless"
SPEC_PATTERN=""
OUTPUT_FORMAT=""

# Parse command line arguments
case "$1" in
    --open)
        CYPRESS_COMMAND="cypress:open"
        print_status "Opening Cypress in interactive mode..."
        ;;
    --run)
        CYPRESS_COMMAND="cypress:run"
        print_status "Running Cypress tests in browser mode..."
        ;;
    --headless)
        CYPRESS_COMMAND="cypress:run:headless"
        print_status "Running Cypress tests in headless mode..."
        ;;
    --json)
        CYPRESS_COMMAND="cypress:run:json"
        OUTPUT_FORMAT="json"
        print_status "Running Cypress tests with JSON output..."
        ;;
    --html)
        CYPRESS_COMMAND="cypress:run:html"
        OUTPUT_FORMAT="html"
        print_status "Running Cypress tests with HTML output..."
        ;;
    --excel)
        CYPRESS_COMMAND="cypress:run:excel"
        OUTPUT_FORMAT="excel"
        print_status "Running Cypress tests with Excel output..."
        ;;
    --all-formats)
        CYPRESS_COMMAND="cypress:run:all-formats"
        OUTPUT_FORMAT="all"
        print_status "Running Cypress tests with all output formats..."
        ;;
    --spec)
        if [ -z "$2" ]; then
            print_error "Please specify a test file after --spec"
            exit 1
        fi
        SPEC_PATTERN="--spec $2"
        print_status "Running specific test: $2"
        ;;
    "")
        print_status "Running all Cypress tests in headless mode..."
        ;;
    *)
        print_warning "Unknown option: $1"
        print_status "Available options:"
        echo "  --reset-only    : Only reset database, don't run tests"
        echo "  --open          : Open Cypress in interactive mode"
        echo "  --run           : Run tests in browser mode"
        echo "  --headless      : Run tests in headless mode (default)"
        echo "  --json          : Run tests and output results in JSON format"
        echo "  --html          : Run tests and output results in HTML format"
        echo "  --excel         : Run tests and output results in Excel (CSV) format"
        echo "  --all-formats   : Run tests and output results in all formats"
        echo "  --spec <file>   : Run specific test file"
        echo ""
        print_status "Proceeding with default headless mode..."
        ;;
esac

# Run Cypress
print_status "Executing Cypress tests..."
echo ""

# Create reports directories if they don't exist and clean old reports
print_status "Preparing reports directories..."
mkdir -p cypress/reports/{json,xml,html,excel}

# Clear old reports to avoid conflicts
rm -f cypress/reports/html/*.json
rm -f cypress/reports/html/*.html
rm -f cypress/reports/json/*.json
rm -f cypress/reports/excel/*.csv
rm -f cypress/reports/xml/*.xml

print_status "Old reports cleared"

# Navigate back to project root for docker-compose
cd ..

# Build the Cypress command based on output format
case "$OUTPUT_FORMAT" in
    "json")
        CYPRESS_CMD="cypress run --headless --reporter cypress-multi-reporters --reporter-options configFile=reporter-config.json"
        ;;
    "html")
        CYPRESS_CMD="cypress run --headless --reporter cypress-multi-reporters --reporter-options configFile=reporter-config.json"
        ;;
    "excel")
        # Use multi-reporters to get JSON for all tests
        CYPRESS_CMD="cypress run --headless --reporter cypress-multi-reporters --reporter-options configFile=reporter-config.json"
        ;;
    "all")
        # Use multi-reporters for comprehensive reporting
        CYPRESS_CMD="cypress run --headless --reporter cypress-multi-reporters --reporter-options configFile=reporter-config.json"
        ;;
    *)
        # Default with multi-reporters for consistency
        CYPRESS_CMD="cypress run --headless --reporter cypress-multi-reporters --reporter-options configFile=reporter-config.json"
        ;;
esac

# Add spec pattern if specified
if [ -n "$SPEC_PATTERN" ]; then
    CYPRESS_CMD="$CYPRESS_CMD $SPEC_PATTERN"
fi

# Execute Cypress in Docker container
print_status "Running: $CYPRESS_CMD"
if docker compose -f docker-compose.dev.yml exec cypress-e2e sh -c "cd cypress && $CYPRESS_CMD"; then
    echo ""
    print_success "🎉 Cypress tests completed successfully!"
    
    # Handle post-processing for all formats (merge reports and convert)
    cd laravel
    
    # Merge all JSON reports into a single report
    print_status "Merging test reports from all test files..."
    
    if ls cypress/reports/html/*.json 1> /dev/null 2>&1; then
        # Check if mochawesome-merge is available, if not use manual merging
        if command -v npx >/dev/null 2>&1; then
            # Try using mochawesome-merge with proper error handling
            if npx mochawesome-merge "cypress/reports/html/*.json" > cypress/reports/html/merged-report.json 2>/dev/null; then
                print_success "Reports merged with mochawesome-merge!"
            else
                print_warning "mochawesome-merge failed, using manual merging..."
                # Manual merge fallback
                node -e "
                const fs = require('fs');
                const glob = require('glob');
                const path = require('path');
                
                try {
                    const files = glob.sync('cypress/reports/html/*.json');
                    let mergedResults = [];
                    let mergedStats = {
                        suites: 0, tests: 0, passes: 0, pending: 0, failures: 0,
                        start: null, end: null, duration: 0, testsRegistered: 0,
                        passPercent: 0, pendingPercent: 0, other: 0, hasOther: false, skipped: 0, hasSkipped: false
                    };
                    
                    files.forEach(file => {
                        try {
                            const content = JSON.parse(fs.readFileSync(file, 'utf8'));
                            if (content.results) {
                                mergedResults = mergedResults.concat(content.results);
                            }
                            if (content.stats) {
                                mergedStats.suites += content.stats.suites || 0;
                                mergedStats.tests += content.stats.tests || 0;
                                mergedStats.passes += content.stats.passes || 0;
                                mergedStats.pending += content.stats.pending || 0;
                                mergedStats.failures += content.stats.failures || 0;
                                mergedStats.duration += content.stats.duration || 0;
                                mergedStats.testsRegistered += content.stats.testsRegistered || 0;
                                if (!mergedStats.start || (content.stats.start && content.stats.start < mergedStats.start)) {
                                    mergedStats.start = content.stats.start;
                                }
                                if (!mergedStats.end || (content.stats.end && content.stats.end > mergedStats.end)) {
                                    mergedStats.end = content.stats.end;
                                }
                            }
                        } catch (e) {
                            console.log('Skipping invalid JSON file:', file);
                        }
                    });
                    
                    mergedStats.passPercent = mergedStats.tests > 0 ? Math.round((mergedStats.passes / mergedStats.tests) * 100) : 0;
                    mergedStats.pendingPercent = mergedStats.tests > 0 ? Math.round((mergedStats.pending / mergedStats.tests) * 100) : 0;
                    
                    const merged = {
                        stats: mergedStats,
                        results: mergedResults,
                        meta: { mocha: { version: '7.2.0' }, mochawesome: { version: '7.1.3' } }
                    };
                    
                    fs.writeFileSync('cypress/reports/html/merged-report.json', JSON.stringify(merged, null, 2));
                    console.log('Manual merge completed successfully');
                } catch (error) {
                    console.error('Manual merge failed:', error.message);
                    process.exit(1);
                }
                " || print_warning "Manual merge also failed"
            fi
        else
            print_warning "npx not available, skipping merge"
        fi
        
        # Generate final HTML report from merged JSON if it exists
        if [ -f "cypress/reports/html/merged-report.json" ]; then
            print_status "Generating final HTML report..."
            if npx marge cypress/reports/html/merged-report.json --reportDir cypress/reports/html --reportFilename final-report --charts --code 2>/dev/null; then
                print_success "HTML report generated successfully!"
            else
                # Fallback: try without charts option
                if npx marge cypress/reports/html/merged-report.json --reportDir cypress/reports/html --reportFilename final-report 2>/dev/null; then
                    print_success "HTML report generated successfully (without charts)!"
                else
                    print_warning "HTML report generation failed, but JSON merge succeeded"
                fi
            fi
            
            # Also create a consolidated JSON report
            cp cypress/reports/html/merged-report.json cypress/reports/json/consolidated-results.json
            print_success "Reports merged successfully!"
        else
            print_warning "No merged report found to process"
        fi
    else
        print_warning "No JSON reports found to merge"
    fi
    
    # Handle format-specific processing
    case "$OUTPUT_FORMAT" in
        "excel"|"all")
            print_status "Converting merged results to Excel format..."
            if [ -f "cypress/reports/json/consolidated-results.json" ]; then
                node cypress/scripts/json-to-excel.js cypress/reports/json/consolidated-results.json cypress/reports/excel/consolidated-results.csv
                print_status "📊 Excel report generated from all tests"
            else
                print_warning "Consolidated JSON not found for Excel conversion"
            fi
            ;;
    esac
    
    cd ..
    
    # Display output information based on format
    case "$OUTPUT_FORMAT" in
        "json")
            print_status "📄 Individual JSON reports: laravel/cypress/reports/html/*.json"
            print_status "📄 Consolidated JSON report: laravel/cypress/reports/json/consolidated-results.json"
            ;;
        "html")
            print_status "🌐 Final HTML report: laravel/cypress/reports/html/final-report.html"
            print_status "📄 Individual JSON reports: laravel/cypress/reports/html/*.json"
            ;;
        "excel")
            print_status "📊 Excel report (all tests): laravel/cypress/reports/excel/consolidated-results.csv"
            print_status "📄 Consolidated JSON report: laravel/cypress/reports/json/consolidated-results.json"
            ;;
        "all")
            print_status "📊 All format reports generated:"
            echo "  - HTML (all tests): laravel/cypress/reports/html/final-report.html"
            echo "  - JSON (consolidated): laravel/cypress/reports/json/consolidated-results.json"
            echo "  - Excel (all tests): laravel/cypress/reports/excel/consolidated-results.csv"
            echo "  - Individual JSONs: laravel/cypress/reports/html/*.json"
            ;;
        *)
            print_status "📄 Test reports available in: laravel/cypress/reports/"
            print_status "📄 Consolidated JSON report: laravel/cypress/reports/json/consolidated-results.json"
            ;;
    esac
else
    echo ""
    print_error "💥 Cypress tests failed!"
    exit 1
fi

echo ""
print_success "✅ E2E test execution complete!"
echo ""
echo "📊 Summary:"
echo "  - Database was reset with fresh test data"
echo "  - Cypress tests were executed"
if [ -n "$OUTPUT_FORMAT" ]; then
    echo "  - Test reports generated in $OUTPUT_FORMAT format(s)"
fi
echo "  - Test environment is ready for next run"
echo ""
echo "💡 Usage examples:"
echo "  ./cypress-e2e.sh                 # Run tests (default headless mode)"
echo "  ./cypress-e2e.sh --html          # Run tests with HTML report"
echo "  ./cypress-e2e.sh --excel         # Run tests with Excel/CSV report"
echo "  ./cypress-e2e.sh --json          # Run tests with JSON report"
echo "  ./cypress-e2e.sh --all-formats   # Run tests with all report formats"
echo "  ./cypress-e2e.sh --open          # Open Cypress in interactive mode"
