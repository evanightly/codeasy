#!/bin/bash

# Cypress Test Report Converter
# Convert existing Cypress test results to different formats

set -e

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

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo "📊 Cypress Test Report Converter"
echo "================================"

# Check if we're in the Laravel directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the laravel directory."
    exit 1
fi

# Create reports directories
mkdir -p cypress/reports/{json,xml,html,excel}

case "$1" in
    --json)
        print_status "Generating JSON report..."
        npm run cypress:run:json
        print_success "JSON report generated at: cypress/reports/json/test-results.json"
        ;;
    --html)
        print_status "Generating HTML report..."
        npm run cypress:run:html
        print_success "HTML report generated at: cypress/reports/html/test-results.html"
        ;;
    --excel)
        print_status "Generating Excel report..."
        npm run cypress:run:excel
        print_success "Excel report generated at: cypress/reports/excel/test-results.csv"
        ;;
    --all)
        print_status "Generating all report formats..."
        npm run cypress:run:all-formats
        print_success "All reports generated:"
        echo "  - HTML: cypress/reports/html/final-report.html"
        echo "  - JSON: cypress/reports/json/test-results.json"  
        echo "  - Excel: cypress/reports/excel/test-results.csv"
        ;;
    --convert-json)
        if [ -z "$2" ]; then
            print_error "Please specify the JSON file to convert"
            echo "Usage: $0 --convert-json <json-file>"
            exit 1
        fi
        
        if [ ! -f "$2" ]; then
            print_error "JSON file not found: $2"
            exit 1
        fi
        
        OUTPUT_FILE="cypress/reports/excel/converted-$(basename "$2" .json).csv"
        print_status "Converting JSON to Excel format..."
        
        if node cypress/scripts/json-to-excel.js "$2" "$OUTPUT_FILE"; then
            print_success "Excel report converted: $OUTPUT_FILE"
        else
            print_error "Failed to convert JSON to Excel"
            exit 1
        fi
        ;;
    *)
        echo "Usage: $0 [option]"
        echo ""
        echo "Options:"
        echo "  --json               Generate JSON report by running tests"
        echo "  --html               Generate HTML report by running tests"
        echo "  --excel              Generate Excel report by running tests"
        echo "  --all                Generate all report formats by running tests"
        echo "  --convert-json <file> Convert existing JSON file to Excel format"
        echo ""
        echo "Examples:"
        echo "  $0 --html"
        echo "  $0 --excel"
        echo "  $0 --all"
        echo "  $0 --convert-json cypress/reports/json/test-results.json"
        ;;
esac
