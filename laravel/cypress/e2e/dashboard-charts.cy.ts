/// <reference types="cypress" />

describe('Dashboard Charts', () => {
    before(() => {
        // Reset database once before all tests
        cy.resetDatabase();
    });

    describe('Student Dashboard', () => {
        beforeEach(() => {
            cy.session('studentSession', () => {
                cy.fixture('credentials').then((creds) => {
                    // Login as student using credentials from fixtures
                    cy.visit('/login');
                    cy.get('input[name="email"]').type(creds.student.email);
                    cy.get('button').contains('Next').click();
                    cy.wait(1000);
                    cy.get('input[name="password"]').type(creds.student.password);
                    cy.get('button').contains('Sign In').click();
                    cy.url({ timeout: 100000 }).should('include', '/dashboard');
                });
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
                cy.fixture('credentials').then((creds) => {
                    // Login as super admin using credentials from fixtures
                    cy.visit('/login');
                    cy.get('input[name="email"]').type(creds.superAdmin.email);
                    cy.get('button').contains('Next').click();
                    cy.wait(1000);
                    cy.get('input[name="password"]').type(creds.superAdmin.password);
                    cy.get('button').contains('Sign In').click();
                    cy.url({ timeout: 100000 }).should('include', '/dashboard');
                });
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
                cy.fixture('credentials').then((creds) => {
                    // Login as school admin using credentials from fixtures
                    cy.visit('/login');
                    cy.get('input[name="email"]').type(creds.schoolAdmin.email);
                    cy.get('button').contains('Next').click();
                    cy.wait(1000);
                    cy.get('input[name="password"]').type(creds.schoolAdmin.password);
                    cy.get('button').contains('Sign In').click();
                    cy.url({ timeout: 100000 }).should('include', '/dashboard');
                });
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
                cy.fixture('credentials').then((creds) => {
                    // Login as teacher using credentials from fixtures
                    cy.visit('/login');
                    cy.get('input[name="email"]').type(creds.teacher.email);
                    cy.wait(1000);
                    cy.get('button').contains('Next').click();
                    cy.wait(1000);
                    cy.get('input[name="password"]').type(creds.teacher.password);
                    cy.get('button').contains('Sign In').click();
                    cy.url({ timeout: 100000 }).should('include', '/dashboard');
                });
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
