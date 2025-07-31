#!/usr/bin/env node

/**
 * Cypress Test Results to Excel Converter
 * Converts Cypress JSON test results to Excel format
 */

import fs from 'fs';

// Simple Excel generation without external dependencies
function generateExcelFromJson(jsonFile, outputFile) {
    try {
        const jsonData = JSON.parse(fs.readFileSync(jsonFile, 'utf8')); // Extract test results from different JSON formats
        const tests = [];

        // Handle mochawesome format (from merged reports)
        if (jsonData.results && Array.isArray(jsonData.results)) {
            jsonData.results.forEach((suite) => {
                // Process nested suites
                const processSuite = (suiteData, parentTitle = '', level = 0) => {
                    // Split suite hierarchy for better CSV structure
                    let mainSuite = '';
                    let testDescribe = '';

                    if (parentTitle) {
                        const parts = `${parentTitle} > ${suiteData.title}`.split(' > ');
                        mainSuite = parts[0] || '';
                        testDescribe = parts.slice(1).join(' > ') || '';
                    } else {
                        mainSuite = suiteData.title || '';
                        testDescribe = '';
                    }

                    // Add tests from this suite
                    if (suiteData.tests && Array.isArray(suiteData.tests)) {
                        suiteData.tests.forEach((test) => {
                            tests.push({
                                title: test.title || 'Unknown Test',
                                suite: mainSuite,
                                describe: testDescribe,
                                state: test.state || 'unknown',
                                duration: test.duration || 0,
                                error: test.err && test.err.message ? test.err.message : '',
                                fullTitle: test.fullTitle || test.title || '',
                                file: suiteData.file || suite.file || '',
                                speed: test.speed || '',
                                pass: test.pass || false,
                                fail: test.fail || false,
                            });
                        });
                    }

                    // Process nested suites recursively
                    if (suiteData.suites && Array.isArray(suiteData.suites)) {
                        suiteData.suites.forEach((nestedSuite) => {
                            const currentTitle = parentTitle
                                ? `${parentTitle} > ${suiteData.title}`
                                : suiteData.title;
                            processSuite(nestedSuite, currentTitle, level + 1);
                        });
                    }
                };

                processSuite(suite);
            });
        }
        // Handle simple test array format
        else if (jsonData.tests && Array.isArray(jsonData.tests)) {
            jsonData.tests.forEach((test) => {
                tests.push({
                    title: test.title ? test.title.join(' > ') : 'Unknown Test',
                    suite: '',
                    describe: '',
                    state: test.state || 'unknown',
                    duration: test.duration || 0,
                    error: test.err ? test.err.message : '',
                    fullTitle: test.fullTitle || '',
                    file: test.file || '',
                });
            });
        } else if (jsonData.results) {
            // Handle different JSON structure
            jsonData.results.forEach((suite) => {
                if (suite.tests) {
                    suite.tests.forEach((test) => {
                        tests.push({
                            title: test.title || 'Unknown Test',
                            suite: suite.title || '',
                            describe: '',
                            state: test.state || 'unknown',
                            duration: test.duration || 0,
                            error: test.err ? test.err.message : '',
                            fullTitle: test.fullTitle || test.title || '',
                            file: suite.file || '',
                        });
                    });
                }
            });
        }

        // Generate CSV (Excel-compatible) content
        let csvContent =
            'Test Suite,Test Describe,Test Title,Status,Duration (ms),Error Message,Full Title,File\n';

        tests.forEach((test) => {
            const row = [
                `"${(test.suite || '').replace(/"/g, '""')}"`,
                `"${(test.describe || '').replace(/"/g, '""')}"`,
                `"${test.title.replace(/"/g, '""')}"`,
                test.state,
                test.duration,
                `"${(test.error || '').replace(/"/g, '""')}"`,
                `"${test.fullTitle.replace(/"/g, '""')}"`,
                `"${test.file.replace(/"/g, '""')}"`,
            ].join(',');
            csvContent += row + '\n';
        });

        // Add summary
        const summary = {
            total: tests.length,
            passed: tests.filter((t) => t.state === 'passed').length,
            failed: tests.filter((t) => t.state === 'failed').length,
            pending: tests.filter((t) => t.state === 'pending').length,
        };

        csvContent += '\n\nSummary:\n';
        csvContent += `Total Tests,${summary.total}\n`;
        csvContent += `Passed,${summary.passed}\n`;
        csvContent += `Failed,${summary.failed}\n`;
        csvContent += `Pending,${summary.pending}\n`;
        csvContent += `Success Rate,${summary.total > 0 ? Math.round((summary.passed / summary.total) * 100) : 0}%\n`;

        fs.writeFileSync(outputFile, csvContent);
        console.log(`✅ Excel report generated: ${outputFile}`);
        console.log(
            `📊 Summary: ${summary.passed}/${summary.total} tests passed (${summary.total > 0 ? Math.round((summary.passed / summary.total) * 100) : 0}%)`,
        );

        return true;
    } catch (error) {
        console.error('❌ Error generating Excel report:', error.message);
        return false;
    }
}

// Main execution
const args = process.argv.slice(2);
if (args.length < 2) {
    console.log('Usage: node json-to-excel.js <input.json> <output.csv>');
    process.exit(1);
}

const [inputFile, outputFile] = args;
generateExcelFromJson(inputFile, outputFile);

export { generateExcelFromJson };
