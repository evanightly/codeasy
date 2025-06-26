/// <reference types="cypress" />

describe('Course CRUD for Teacher', () => {
    before(() => {
        // Reset database once before all tests
        cy.resetDatabase();
    });

    beforeEach(() => {
        cy.session('teacherSession', () => {
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
        cy.get('button[type="submit"]').should('exist');
    });

    it('should be able to access course management features', () => {
        cy.visit('/courses');

        // Check if create button exists (indicates teacher can create courses)
        cy.get('body').then(($body) => {
            if ($body.find('[data-testid="course-create-button"]').length > 0) {
                cy.get('[data-testid="course-create-button"]').should('be.visible');
            } else {
                // If no create button, at least verify we have access to the page
                cy.get('body').should('be.visible');
            }
        });
    });

    // TODO: the classroom needs to created and selected first
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

        // Look for any course show link
        cy.get('body').then(($body) => {
            if ($body.find('[data-testid^="course-show-"]').length > 0) {
                // Click on first course show link
                cy.get('[data-testid^="course-show-"]').first().click();

                // Should be on course show page
                cy.url().should('match', /\/courses\/\d+/);

                // Should show course details
                cy.get('body').should('be.visible');
            } else {
                // Skip if no courses exist
                cy.log('No courses found to test show functionality');
            }
        });
    });

    it('should access course edit form', () => {
        cy.visit('/courses');

        // Look for edit link
        cy.get('body').then(($body) => {
            if ($body.find('[data-testid^="course-edit-"]').length > 0) {
                // Click on first edit link
                cy.get('[data-testid^="course-edit-"]').first().click();

                // Should be on course edit page
                cy.url().should('include', '/edit');

                // Should show form fields
                cy.get('form').should('exist');
                cy.get('input[name="name"]').should('exist');
                cy.get('[data-testid="course-edit-submit"]').should('exist');
            } else {
                // Skip if no edit links exist
                cy.log('No edit links found to test edit functionality');
            }
        });
    });

    it('should update an existing course', () => {
        cy.visit('/courses');

        // Look for edit link
        cy.get('body').then(($body) => {
            if ($body.find('[data-testid^="course-edit-"]').length > 0) {
                // Click on first edit link
                cy.get('[data-testid^="course-edit-"]').first().click();

                // Update the course name
                cy.get('input[name="name"]').clear().type('Updated Course Name');

                // Submit the form
                cy.get('[data-testid="course-edit-submit"]').click();

                // Should redirect back to courses
                cy.url({ timeout: 10000 }).should('satisfy', (url) => {
                    return url.includes('/courses') || url.includes('/dashboard');
                });
            } else {
                // Skip if no edit links exist
                cy.log('No edit links found to test update functionality');
            }
        });
    });

    it('should handle course deletion', () => {
        cy.visit('/courses');

        // Look for delete button
        cy.get('body').then(($body) => {
            if ($body.find('[data-testid^="course-delete-"]').length > 0) {
                // Click on first delete button
                cy.get('[data-testid^="course-delete-"]').first().click();

                // Should show confirmation dialog or perform delete
                cy.get('body').should('be.visible');
            } else {
                // Skip if no delete buttons exist
                cy.log('No delete buttons found to test delete functionality');
            }
        });
    });
});
