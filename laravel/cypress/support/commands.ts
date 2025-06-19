// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

/// <reference types="cypress" />

// Export to make this an external module
export {};

// Extend Cypress interface using interface merging
interface CustomCommands {
    login(): void;
    setMobileViewport(): void;
    setTabletViewport(): void;
    setDesktopViewport(): void;
    waitForPageLoad(): void;
    elementExists(selector: string): boolean;
    executeCodeInWorkspace(code: string): void;
    navigateToModule(moduleId: number): void;
    checkTestCaseVisible(testCaseId: number): void;
}

// eslint-disable-next-line @typescript-eslint/prefer-namespace-keyword
declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
        // eslint-disable-next-line @typescript-eslint/no-empty-interface
        interface Chainable extends CustomCommands {}
    }
}

// Login command - handles auto-login or manual login
Cypress.Commands.add('login', () => {
    cy.visit('/');

    // Check if we're already logged in (redirected to dashboard)
    cy.url().then((url) => {
        if (url.includes('/dashboard')) {
            // Already logged in via auto-login
            cy.log('Auto-login successful');
        } else {
            // Need to manually login
            cy.visit('/login');

            // Check if login form exists
            cy.get('body').then(($body) => {
                if ($body.find('input[name="email"]').length > 0) {
                    // Manual login required
                    cy.get('input[name="email"]').type('admin@codeasy.local');
                    cy.get('input[name="password"]').type('password123');
                    cy.get('button[type="submit"]').click();
                    cy.url().should('include', '/dashboard');
                    cy.log('Manual login successful');
                } else {
                    // Check if we're redirected to dashboard automatically
                    cy.url().should('include', '/dashboard');
                    cy.log('Auto-redirect to dashboard');
                }
            });
        }
    });
});

// Wait for page to be fully loaded
Cypress.Commands.add('waitForPageLoad', () => {
    // Wait for the document to be ready
    cy.document().should('have.property', 'readyState', 'complete');

    // Wait for any loading spinners to disappear
    cy.get('body').should('not.contain', 'Loading...');

    // Wait for main content area to be visible
    cy.get('main, [role="main"], .main-content').should('be.visible');
});

// Check if element exists without failing
Cypress.Commands.add('elementExists', (selector: string) => {
    cy.get('body').then(($body) => {
        const exists = $body.find(selector).length > 0;
        cy.wrap(exists);
    });
});

// Execute code in workspace
Cypress.Commands.add('executeCodeInWorkspace', (code: string) => {
    // Clear existing code and type new code
    cy.get('[data-testid="code-editor"]', { timeout: 10000 }).should('be.visible');
    cy.get('[data-testid="code-editor"] .monaco-editor').click();
    cy.get('[data-testid="code-editor"]').type('{ctrl+a}' + code);

    // Click run button
    cy.get('[data-testid="run-code-button"]').click();

    // Wait for execution to complete
    cy.get('[data-testid="output-panel"]', { timeout: 30000 }).should('be.visible');
    cy.get('[data-testid="run-code-button"]').should('not.be.disabled');
});

// Navigate to specific module
Cypress.Commands.add('navigateToModule', (moduleId: number) => {
    cy.visit(`/modules/${moduleId}`);
    cy.waitForPageLoad();
});

// Check if test case is visible
Cypress.Commands.add('checkTestCaseVisible', (testCaseId: number) => {
    cy.get(`[data-testid="test-case-${testCaseId}"]`).should('be.visible');
    cy.get(`[data-testid="test-case-${testCaseId}"]`).should('not.contain', 'Lock');
});
