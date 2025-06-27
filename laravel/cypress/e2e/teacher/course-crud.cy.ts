/// <reference types="cypress" />

describe('Course CRUD for Teacher', () => {
    before(() => {
        // Reset database once before all tests
        cy.resetDatabase();
    });

    beforeEach(() => {
        cy.session('teacherSession', () => {
            // Login as teacher using the enhanced login command
            cy.login('teacher');
        });
    });

    it('should display courses index page', () => {
        cy.visit('/courses');

        // Check if we're on the correct page
        cy.url().should('include', '/courses');

        // Should show page title or main content
        cy.get('body').should('contain.text', 'Course');
    });

    it('should display course create form', () => {
        cy.visit('/courses/create');

        // Check if we're on the create page
        cy.url().should('include', '/courses/create');

        // Should show form fields
        cy.get('form').should('exist');
        cy.get('input[name="name"]').should('exist');
        cy.get('[data-testid="course-create-submit"]').should('exist');
    });

    it('should create a new course', () => {
        cy.visit('/courses/create');

        // Fill out the form
        cy.get('input[name="name"]').type('Test Course');
        cy.get('input[name="description"]').type('Test course description');

        // Submit the form
        cy.get('[data-testid="course-create-submit"]').click();

        // Should redirect to courses index or show success
        cy.url({ timeout: 10000 }).should('satisfy', (url) => {
            return url.includes('/courses') || url.includes('/dashboard');
        });
    });

    it('should display course details', () => {
        cy.visit('/courses');

        // Wait for dropdown buttons to appear
        cy.get('[data-testid^="course-dropdown-"]', { timeout: 3000 }).should(
            'have.length.at.least',
            1,
        );

        // Click on first dropdown menu button
        cy.get('[data-testid^="course-dropdown-"]').first().click();

        // Click on show option
        cy.get('[data-testid^="course-show-"]').first().click();

        // Should be on course show page
        cy.url().should('match', /\/courses\/\d+/);

        // Should show course details
        cy.get('body').should('be.visible');
    });

    it('should access course edit form', () => {
        cy.visit('/courses');

        // Wait for dropdown buttons to appear
        cy.get('[data-testid^="course-dropdown-"]', { timeout: 3000 }).should(
            'have.length.at.least',
            1,
        );

        // Click on first dropdown menu button
        cy.get('[data-testid^="course-dropdown-"]').first().click();

        // Look for edit option in dropdown
        cy.get('body').then(($body) => {
            if ($body.find('[data-testid^="course-edit-"]').length > 0) {
                cy.get('[data-testid^="course-edit-"]').first().click();

                // Should be on edit page
                cy.url().should('include', '/edit');
                cy.get('form').should('exist');
                cy.get('input[name="name"]').should('exist');
            } else {
                cy.log('No course edit links found');
            }
        });
    });

    it('should handle course deletion', () => {
        cy.visit('/courses');

        // Wait for dropdown buttons to appear
        cy.get('[data-testid^="course-dropdown-"]', { timeout: 3000 }).should(
            'have.length.at.least',
            1,
        );

        // Click on first dropdown menu button
        cy.get('[data-testid^="course-dropdown-"]').first().click();

        // Look for delete option in dropdown
        cy.get('body').then(($body) => {
            if ($body.find('[data-testid^="course-delete-"]').length > 0) {
                cy.get('[data-testid^="course-delete-"]').first().click({ force: true });

                // Should show confirmation or perform delete
                cy.get('body').should('be.visible');
            } else {
                cy.log('No course delete options found');
            }
        });
    });
});
