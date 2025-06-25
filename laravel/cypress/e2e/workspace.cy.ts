/// <reference types="cypress" />

describe('Workspace Code Execution', () => {
    before(() => {
        // Reset database once before all tests
        cy.resetDatabase();
    });

    beforeEach(function () {
        // Restore session before each test to maintain login state
        cy.session('workspaceSession', () => {
            cy.login();
        });

        // Load workspace fixture data for each test
        cy.fixture('workspace').as('ws');
    });

    it('should load the workspace page and show run button', function () {
        cy.visit(this.ws.url);
        cy.get('[data-testid="code-editor"]').should('be.visible');
        cy.get('[data-testid="run-code-button"]').should('be.enabled');
    });

    it('should show test case failed for invalid code', function () {
        cy.visit(this.ws.url);
        // Wait for workspace to load
        cy.get('[data-testid="code-editor"]').should('be.visible');
        cy.get('[data-testid="run-code-button"]').should('be.enabled');

        // Mock the API response for invalid code execution
        cy.intercept('POST', '**/student/questions/execute', {
            statusCode: 200,
            body: {
                success: false,
                output: [
                    {
                        type: 'test_stats',
                        content: JSON.stringify({
                            passed: 0,
                            failed: 1,
                            total: 1,
                        }),
                    },
                ],
            },
        }).as('executeInvalidCode');

        // Click run button to execute with whatever code is in the editor
        cy.get('[data-testid="run-code-button"]').click();

        // Wait for the API call and verify response
        cy.wait('@executeInvalidCode');

        // Wait for test results and expect failure
        cy.contains('Failed Attempts: 1/3', { timeout: 15000 }).should('be.visible');
    });

    it('should show test case passed for valid code', function () {
        cy.visit(this.ws.url);
        // Wait for workspace to load
        cy.get('[data-testid="code-editor"]').should('be.visible');
        cy.get('[data-testid="run-code-button"]').should('be.enabled');

        // Mock the API response for valid code execution
        cy.intercept('POST', '**/student/questions/execute', {
            statusCode: 200,
            body: {
                success: true,
                output: [
                    {
                        type: 'test_stats',
                        content: JSON.stringify({
                            passed: 1,
                            failed: 0,
                            total: 1,
                        }),
                    },
                ],
            },
        }).as('executeValidCode');

        // Click run button to execute with whatever code is in the editor
        cy.get('[data-testid="run-code-button"]').click();

        // Wait for the API call and verify response
        cy.wait('@executeValidCode');

        // Wait for test results and expect success
        cy.contains('passed successfully', { timeout: 15000 }).should('be.visible');
    });
});
