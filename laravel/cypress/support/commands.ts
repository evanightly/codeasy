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
    resetDatabase(): void;
    login(): void;
    setMobileViewport(): void;
    setTabletViewport(): void;
    setDesktopViewport(): void;
    waitForPageLoad(): void;
    elementExists(selector: string): boolean;
    executeCodeInWorkspace(code: string): void;
    navigateToModule(moduleId: number): void;
    checkTestCaseVisible(testCaseId: number): void;
    selectShadcnOption(triggerSelector: string, optionText: string): void;
    checkLoadingState(): void;
    waitForLoadingStateOptional(timeoutMs?: number): void;
    closeHttp500ErrorDialog(): void;
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
    cy.fixture('login').then((credentials) => {
        cy.visit('/');

        // Check if we're already logged in (redirected to dashboard)
        cy.url().then((url) => {
            if (url.includes('/dashboard')) {
                // Already logged in via auto-login
                cy.log('Auto-login successful');
            } else {
                // Need to manually login
                cy.visit('/login');
                cy.waitForPageLoad();

                // Manual login using fixture credentials
                cy.get('input[name="email"]').type(credentials.email);
                cy.get('button').contains('Next').click();

                // Check for loading state within 2 seconds, proceed if none found
                cy.waitForLoadingStateOptional(2000);

                cy.get('input[name="password"]')
                    .should('be.visible')
                    .clear()
                    .type(credentials.password);
                cy.get('button').contains('Sign In').click();

                // Wait for authentication to complete
                cy.url({ timeout: 10000 }).should('include', '/dashboard');
                cy.log('Manual login successful with fixture credentials');
            }
        });
    });
});

// Wait for page to be fully loaded
Cypress.Commands.add('waitForPageLoad', () => {
    // Wait for the document to be ready
    cy.document().should('have.property', 'readyState', 'complete');

    // Wait for any loading spinners to disappear
    cy.get('body').should('not.contain', 'Loading...');

    // Wait for page content to be visible - check for common content containers
    cy.get('body').should('be.visible');

    // Try to find main content areas, but don't fail if they don't exist
    cy.get('body').then(($body) => {
        if ($body.find('main, [role="main"], .main-content').length > 0) {
            cy.get('main, [role="main"], .main-content').should('be.visible');
        } else if ($body.find('form').length > 0) {
            // For auth pages, wait for form to be visible
            cy.get('form').should('be.visible');
        } else if ($body.find('[data-component]').length > 0) {
            // For pages with data-component attribute
            cy.get('[data-component]').should('be.visible');
        } else {
            // Fallback: just ensure body has some content
            cy.get('body').should('not.be.empty');
        }
    });
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

// Custom command to handle ShadCN Select components
Cypress.Commands.add('selectShadcnOption', (triggerSelector: string, optionText: string) => {
    // Click the select trigger
    cy.get(triggerSelector).click();

    // Wait for the dropdown content to be visible
    cy.get('[role="listbox"]', { timeout: 5000 }).should('be.visible');

    // Find and click the option within the listbox
    cy.get('[role="listbox"]').within(() => {
        cy.get('[role="option"]').contains(optionText).click({ force: true });
    });

    // Verify the option is selected by checking the trigger contains the text
    cy.get(triggerSelector).should('contain', optionText);
});

// Simple utility to check for any loading state
Cypress.Commands.add('checkLoadingState', () => {
    cy.get('body').should('satisfy', ($body) => {
        const hasLoadingText = /authenticating|loading|processing/i.test($body.text());
        const hasSpinner = $body.find('.animate-spin, .spinner, [data-loading]').length > 0;
        const hasDisabledButton = $body.find('button:disabled').length > 0;

        return hasLoadingText || hasSpinner || hasDisabledButton;
    });
});

// Conditionally wait for loading state with timeout
Cypress.Commands.add('waitForLoadingStateOptional', (timeoutMs = 2000) => {
    cy.get('body', { timeout: timeoutMs }).then(($body) => {
        const hasLoadingText = /authenticating|loading|processing/i.test($body.text());
        const hasSpinner = $body.find('.animate-spin, .spinner, [data-loading]').length > 0;
        const hasDisabledButton = $body.find('button:disabled').length > 0;

        if (hasLoadingText || hasSpinner || hasDisabledButton) {
            cy.log(`Loading state detected, waiting for it to disappear`);
            // Wait for loading state to disappear
            cy.get('body').should('satisfy', ($body) => {
                const stillLoading =
                    /authenticating|loading|processing/i.test($body.text()) ||
                    $body.find('.animate-spin, .spinner, [data-loading]').length > 0 ||
                    $body.find('button:disabled').length > 0;
                return !stillLoading;
            });
        } else {
            cy.log(`No loading state detected within ${timeoutMs}ms, proceeding directly`);
        }
    });
});

// Close HTTP 500 error dialog if it appears
Cypress.Commands.add('closeHttp500ErrorDialog', () => {
    // the error dialog has "Internal Server Error" text
    // and a close button with text "On It!"
    // using body.contains is preferable because radix has mixed up classes and selectors
    cy.get('body').then(($body) => {
        if (
            $body.find('.radix-dialog').length > 0 &&
            $body.text().includes('Internal Server Error')
        ) {
            cy.get('.radix-dialog').should('be.visible');
            cy.get('.radix-dialog').contains('On It!').click();
            cy.get('.radix-dialog').should('not.exist');
        }
    });
});

// Reset the database to a clean state using migrate:fresh and Cypress seeder
Cypress.Commands.add('resetDatabase', () => {
    cy.log('Resetting database with migrate:fresh and Cypress seeder');

    // Use HTTP endpoint approach which is more reliable in containerized environments
    cy.request({
        method: 'POST',
        url: '/cypress/reset-database',
        headers: {
            'X-Cypress-Test': 'true',
        },
        timeout: 30000, // 30 seconds timeout for database operations
        failOnStatusCode: false, // Don't fail immediately on non-200 status
    }).then((response) => {
        cy.log('Database reset HTTP response:', response.body);

        if (response.status === 200 && response.body && response.body.success) {
            cy.log(`✅ Database reset completed successfully in ${response.body.duration}ms`);
            if (response.body.output) {
                cy.log('Command output:', response.body.output);
            }
            
            // Clear session data after database reset to prevent CSRF token issues
            cy.log('🧹 Clearing session data to prevent CSRF token mismatches...');
            cy.clearCookies();
            cy.clearLocalStorage();
        } else {
            const errorMsg =
                response.body?.message ||
                response.body?.error ||
                `HTTP ${response.status}: Database reset failed`;
            cy.log(`❌ Database reset failed: ${errorMsg}`);
            cy.log(' Please run: ./dc.sh artisan cypress:reset-db before tests');
        }
    });
});
