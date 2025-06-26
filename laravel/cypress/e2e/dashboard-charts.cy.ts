/// <reference types="cypress" />

describe('Dashboard Charts', () => {
    before(() => {
        // Reset database once before all tests
        cy.resetDatabase();
    });

    describe('Student Dashboard', () => {
        beforeEach(() => {
            cy.session('studentSession', () => {
                cy.login('student');
            });
        });

        it('should display student charts', () => {
            cy.visit('/dashboard');

            // Check student title
            cy.contains('Student Dashboard').should('be.visible');

            // Check chart components exist
            cy.get('[data-testid="student-latest-work-progress"]').should('be.visible');
            cy.get('[data-testid="student-classification-section"]').should('be.visible');
            cy.get('[data-testid="student-learning-progress-area-chart"]').should('be.visible');
            cy.get('[data-testid="student-cognitive-level-pie-chart"]').should('be.visible');
            cy.get('[data-testid="student-module-progress-bar-chart"]').should('be.visible');
        });
    });

    describe('Super Admin Dashboard', () => {
        beforeEach(() => {
            cy.session('superAdminSession', () => {
                // Login as super admin using the enhanced login command
                cy.login('superAdmin');
            });
        });

        it('should display admin charts', () => {
            cy.visit('/dashboard');

            // Check admin title
            cy.contains('Admin Overview').should('be.visible');

            // Check chart components exist
            cy.get('[data-testid="admin-users-bar-chart"]').should('be.visible');
            cy.get('[data-testid="admin-roles-pie-chart"]').should('be.visible');
            cy.get('[data-testid="admin-site-visits-line-chart"]').should('be.visible');
            cy.get('[data-testid="admin-radar-chart"]').should('be.visible');
        });
    });

    describe('School Admin Dashboard', () => {
        beforeEach(() => {
            cy.session('schoolAdminSession', () => {
                // Login as school admin using the enhanced login command
                cy.login('schoolAdmin');
            });
        });

        it('should display school admin charts', () => {
            cy.visit('/dashboard');

            // Check school admin title
            cy.contains('School Admin Overview').should('be.visible');

            // Check chart components exist
            cy.get('[data-testid="school-admin-population-bar-chart"]').should('be.visible');
            cy.get('[data-testid="school-admin-facilities-pie-chart"]').should('be.visible');
            cy.get('[data-testid="school-admin-class-development-radar-chart"]').should(
                'be.visible',
            );
            cy.get('[data-testid="school-admin-level-performance-radial-chart"]').should(
                'be.visible',
            );
        });
    });

    describe('Teacher Dashboard', () => {
        beforeEach(() => {
            cy.session('teacherSession', () => {
                // Login as teacher using the enhanced login command
                cy.login('teacher');
            });
        });

        it('should display teacher charts', () => {
            cy.visit('/dashboard');

            // Check teacher title
            cy.contains('Teacher Dashboard').should('be.visible');

            // Check chart components exist
            cy.get('[data-testid="teacher-class-scores-bar-chart"]').should('be.visible');
            cy.get('[data-testid="teacher-module-completion-pie-chart"]').should('be.visible');
            cy.get('[data-testid="teacher-subject-mastery-radar-chart"]').should('be.visible');
            cy.get('[data-testid="teacher-top-students-radial-chart"]').should('be.visible');
            cy.get('[data-testid="teacher-student-progress-section"]').should('be.visible');
        });
    });
});
