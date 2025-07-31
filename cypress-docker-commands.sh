#!/bin/bash

# Direct Cypress Docker Commands for Manual Execution
# These are the exact commands you can run inside the cypress container

echo "🐳 Cypress Docker Command Reference"
echo "=================================="
echo ""
echo "To run these commands manually:"
echo "1. First, shell into the cypress container:"
echo "   docker compose -f docker-compose.dev.yml exec cypress-e2e sh"
echo ""
echo "2. Navigate to cypress directory:"
echo "   cd cypress"
echo ""
echo "3. Run one of these commands:"
echo ""

echo "📋 Basic Commands:"
echo "# Headless run (no reports)"
echo "cypress run --headless"
echo ""

echo "📄 JSON Report:"
echo "cypress run --headless --reporter json --reporter-options 'reportFilename=reports/json/test-results.json'"
echo ""

echo "🌐 HTML Report:"
echo "cypress run --headless --reporter mochawesome --reporter-options 'reportDir=reports/html,reportFilename=test-results,html=true,json=true,overwrite=false,timestamp=longDate'"
echo ""

echo "🔄 Multi-Reporter (captures ALL test files):"
echo "cypress run --headless --reporter cypress-multi-reporters --reporter-options configFile=reporter-config.json"
echo ""

echo "🔀 Merge Reports (after multi-reporter run):"
echo "# First, create reports directory"
echo "mkdir -p reports/{json,html,xml}"
echo ""
echo "# Run tests with multi-reporter"
echo "cypress run --headless --reporter cypress-multi-reporters --reporter-options configFile=reporter-config.json"
echo ""
echo "# Merge all JSON reports into one"
echo "npx mochawesome-merge 'reports/html/*.json' > reports/html/merged-report.json"
echo ""
echo "# Generate final HTML from merged JSON"
echo "npx marge reports/html/merged-report.json --reportDir reports/html --reportFilename final-report"
echo ""

echo "📊 JUnit XML Report:"
echo "cypress run --headless --reporter mocha-junit-reporter --reporter-options 'mochaFile=reports/xml/test-results-[hash].xml'"
echo ""

echo "🔄 Multiple Reporters:"
echo "cypress run --headless --reporter cypress-multi-reporters --reporter-options configFile=reporter-config.json"
echo ""

echo "🎯 Specific Test:"
echo "cypress run --headless --spec 'e2e/login.cy.ts' --reporter json --reporter-options 'reportFilename=reports/json/login-test.json'"
echo ""

echo "📁 Report Locations (inside container):"
echo "  /e2e/cypress/reports/json/     - JSON reports"
echo "  /e2e/cypress/reports/html/     - HTML reports" 
echo "  /e2e/cypress/reports/xml/      - XML/JUnit reports"
echo ""

echo "📁 Report Locations (on host):"
echo "  laravel/cypress/reports/json/  - JSON reports"
echo "  laravel/cypress/reports/html/  - HTML reports"
echo "  laravel/cypress/reports/xml/   - XML/JUnit reports"
echo ""

echo "💡 Pro Tips:"
echo "- Create reports directory first: mkdir -p reports/{json,html,xml}"
echo "- Use --spec to run specific tests"
echo "- JSON reports can be converted to Excel using the conversion script"
echo "- HTML reports include interactive charts and detailed breakdowns"
