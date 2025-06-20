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
        echo "  --reset-only  : Only reset database, don't run tests"
        echo "  --open        : Open Cypress in interactive mode"
        echo "  --run         : Run tests in browser mode"
        echo "  --headless    : Run tests in headless mode (default)"
        echo "  --spec <file> : Run specific test file"
        echo ""
        print_status "Proceeding with default headless mode..."
        ;;
esac

# Run Cypress
print_status "Executing Cypress tests..."
echo ""

# Use Docker container directly for more reliable execution
# Navigate back to project root for docker-compose
cd ..
if docker compose -f docker-compose.dev.yml exec cypress-e2e sh -c "cd cypress && cypress run --headless --spec '$SPEC_PATTERN'"; then
    echo ""
    print_success "🎉 Cypress tests completed successfully!"
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
echo "  - Test environment is ready for next run"
echo ""
echo "💡 To run again: ./cypress-e2e.sh [options]"
