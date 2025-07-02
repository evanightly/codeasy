/// <reference types="cypress" />

describe('Student Classification Export for SuperAdmin', () => {
    before(() => {
        // Reset database once before all tests
        cy.resetDatabase();
    });

    beforeEach(() => {
        cy.session('superAdminSession', () => {
            // Login as superadmin using the enhanced login command
            cy.login('superAdmin');
        });
    });

    describe('Student Cognitive Classifications Export', () => {
        it('should display student cognitive classifications page', () => {
            cy.visit('/student-cognitive-classifications');
            cy.waitForPageLoad();

            // Check if we're on the correct page
            cy.url().should('include', '/student-cognitive-classifications');

            // Should show page title
            cy.get('body').should('contain.text', 'Student Cognitive Classification');
        });

        it('should show export excel button and be clickable', () => {
            cy.visit('/student-cognitive-classifications');
            cy.waitForPageLoad();

            // Look for export excel button
            cy.get('button').contains('Export Classifications').should('be.visible');
            cy.get('button').contains('Export Classifications').should('not.be.disabled');
        });

        it('should show run classification button and dialog', () => {
            cy.visit('/student-cognitive-classifications');
            cy.waitForPageLoad();

            // Look for run classification button
            cy.get('button').contains('Run Classification').should('be.visible');
            cy.get('button').contains('Run Classification').click();

            // Should show dialog
            cy.get('[role="dialog"]').should('be.visible');
            cy.get('[role="dialog"]').should('contain.text', 'Run Cognitive Classification');
        });

        it('should show export raw data button and dialog', () => {
            cy.visit('/student-cognitive-classifications');
            cy.waitForPageLoad();

            // Look for export raw data button
            cy.get('button').contains('Export Raw Data').should('be.visible');
            cy.get('button').contains('Export Raw Data').click();

            // Should show dialog
            cy.get('[role="dialog"]').should('be.visible');
            cy.get('[role="dialog"]').should('contain.text', 'Export Raw Classification Data');
        });
    });

    describe('Student Course Cognitive Classifications Export', () => {
        it('should display student course cognitive classifications page', () => {
            cy.visit('/student-course-cognitive-classifications');
            cy.waitForPageLoad();

            // Check if we're on the correct page
            cy.url().should('include', '/student-course-cognitive-classifications');

            // Should show page title
            cy.get('body').should('contain.text', 'Student Course Cognitive Classification');
        });

        it('should show view report button and dialog', () => {
            cy.visit('/student-course-cognitive-classifications');
            cy.waitForPageLoad();

            // Look for view report button
            cy.get('button').contains('View Report').should('be.visible');
            cy.get('button').contains('View Report').click();

            // Should show dialog
            cy.get('[role="dialog"]').should('be.visible');
            cy.get('[role="dialog"]').should('contain.text', 'Generate Report');
        });

        it('should show enhanced export button and dialog', () => {
            cy.visit('/student-course-cognitive-classifications');
            cy.waitForPageLoad();

            // Look for enhanced export button
            cy.get('button').contains('Enhanced Export').should('be.visible');
            cy.get('button').contains('Enhanced Export').click();

            // Should show dialog
            cy.get('[role="dialog"]').should('be.visible');
            cy.get('[role="dialog"]').should('contain.text', 'Enhanced Student Scores Export');
        });
    });

    describe('Export Functionality Tests', () => {
        it('should handle export excel click without errors', () => {
            cy.visit('/student-cognitive-classifications');
            cy.waitForPageLoad();

            // Click export excel button
            cy.get('button').contains('Export Classifications').click();

            // Should not show any error dialogs
            cy.get('body').should('not.contain', 'Internal Server Error');

            // Wait a moment for any potential processing
            cy.wait(1000);
        });

        it('should handle export functions in course classifications', () => {
            cy.visit('/student-course-cognitive-classifications');
            cy.waitForPageLoad();

            // Test view report dialog interaction
            cy.get('button').contains('View Report').click();
            cy.get('[role="dialog"]').should('be.visible');

            // Close dialog by clicking outside or escape
            cy.get('body').type('{esc}');
            cy.get('[role="dialog"]').should('not.exist');

            // Close dialog
            cy.get('body').type('{esc}');
            cy.get('[role="dialog"]').should('not.exist');

            // Test enhanced export dialog interaction
            cy.get('button').contains('Enhanced Export').click();
            cy.get('[role="dialog"]').should('be.visible');

            // TODO: need detail steps to download the enhanced export file

            // Close dialog
            cy.get('body').type('{esc}');
            cy.get('[role="dialog"]').should('not.exist');
        });
    });

    describe('Navigation and Access Tests', () => {
        it('should have proper navigation access as superadmin', () => {
            cy.visit('/dashboard');
            cy.waitForPageLoad();

            // Should be able to access both classification pages
            cy.visit('/student-cognitive-classifications');
            cy.waitForPageLoad();
            cy.url().should('include', '/student-cognitive-classifications');

            cy.visit('/student-course-cognitive-classifications');
            cy.waitForPageLoad();
            cy.url().should('include', '/student-course-cognitive-classifications');
        });

        it('should maintain session across page visits', () => {
            cy.visit('/student-cognitive-classifications');
            cy.waitForPageLoad();

            // Should not be redirected to login
            cy.url().should('not.include', '/login');
            cy.get('body').should('not.contain', 'Log in');

            cy.visit('/student-course-cognitive-classifications');
            cy.waitForPageLoad();

            // Should still be authenticated
            cy.url().should('not.include', '/login');
            cy.get('body').should('not.contain', 'Log in');
        });
    });
});
