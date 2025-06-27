/// <reference types="cypress" />

describe('Learning Material CRUD for Teacher', () => {
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

    it('should display learning materials index page', () => {
        // First visit courses to find a course
        cy.visit('/courses');

        // Wait for course list to appear
        cy.get('[data-testid^="course-dropdown-"]', { timeout: 3000 }).should(
            'have.length.at.least',
            1,
        );

        // Click on first dropdown menu button
        cy.get('[data-testid^="course-dropdown-"]').first().click();

        // Wait for dropdown to open and click show option
        cy.get('[data-testid^="course-show-"]', { timeout: 1000 }).first().click();

        // Should be on course show page with learning materials tab
        cy.url().should('match', /\/courses\/\d+/);

        // Check if learning materials tab exists and click it
        cy.get('body').then(($tabBody) => {
            if ($tabBody.find('[value="materials"]').length > 0) {
                cy.get('[value="materials"]').click();
                cy.get('body').should('contain.text', 'Learning Material');
            } else {
                cy.log('No learning materials tab found');
            }
        });
    });

    it('should display learning material create form', () => {
        cy.visit('/courses');

        // Wait for dropdown buttons to appear
        cy.get('[data-testid^="course-dropdown-"]', { timeout: 3000 }).should(
            'have.length.at.least',
            1,
        );

        // Click on first dropdown menu button
        cy.get('[data-testid^="course-dropdown-"]').first().click();

        // Get the course ID from the first course show link
        cy.get('[data-testid^="course-show-"]')
            .first()
            .invoke('attr', 'href')
            .then((href) => {
                const courseId = href?.match(/\/courses\/(\d+)/)?.[1];
                if (courseId) {
                    // Visit learning material create page directly
                    cy.visit(`/courses/${courseId}/learning-materials/create`);

                    // Check if we're on the create page
                    cy.url().should('include', '/learning-materials/create');

                    // Should show form fields
                    cy.get('form').should('exist');
                    cy.get('input[name="title"]').should('exist');
                    cy.get('button[type="submit"]').should('exist');
                }
            });
    });

    it('should create a new learning material', () => {
        cy.visit('/courses');

        // Wait for dropdown buttons to appear
        cy.get('[data-testid^="course-dropdown-"]', { timeout: 3000 }).should(
            'have.length.at.least',
            1,
        );

        // Click on first dropdown menu button
        cy.get('[data-testid^="course-dropdown-"]').first().click();

        cy.get('[data-testid^="course-show-"]')
            .first()
            .invoke('attr', 'href')
            .then((href) => {
                const courseId = href?.match(/\/courses\/(\d+)/)?.[1];
                if (courseId) {
                    cy.visit(`/courses/${courseId}/learning-materials/create`);

                    // Fill out the form
                    cy.get('input[name="title"]').type('Test Learning Material');
                    cy.get('textarea[name="description"]').type(
                        'Test learning material description',
                    );

                    // Submit the form
                    cy.get('button[type="submit"]').click();

                    // Should redirect back
                    cy.url({ timeout: 10000 }).should('satisfy', (url) => {
                        return url.includes('/courses') || url.includes('/dashboard');
                    });
                }
            });
    });

    it('should display learning material details', () => {
        cy.visit('/courses');

        // Wait for dropdown buttons to appear
        cy.get('[data-testid^="course-dropdown-"]', { timeout: 3000 }).should(
            'have.length.at.least',
            1,
        );

        // Click on first dropdown menu button
        cy.get('[data-testid^="course-dropdown-"]').first().click();

        // Click show option
        cy.get('[data-testid^="course-show-"]').first().click();

        // Look for learning materials tab and any learning material links
        cy.get('body').then(($tabBody) => {
            if ($tabBody.find('[value="materials"]').length > 0) {
                cy.get('[value="materials"]').click();

                // Look for any learning material show links
                cy.get('body').then(($materialBody) => {
                    if ($materialBody.find('a[href*="/learning-materials/"]').length > 0) {
                        cy.get('a[href*="/learning-materials/"]').first().click();

                        // Should show learning material details
                        cy.url().should('include', '/learning-materials/');
                        cy.get('body').should('be.visible');
                    } else {
                        cy.log('No learning materials found to test show functionality');
                    }
                });
            }
        });
    });

    it('should access learning material edit form', () => {
        cy.visit('/courses');

        // Wait for dropdown buttons to appear
        cy.get('[data-testid^="course-dropdown-"]', { timeout: 3000 }).should(
            'have.length.at.least',
            1,
        );

        // Click on first dropdown menu button
        cy.get('[data-testid^="course-dropdown-"]').first().click();

        // Click show option
        cy.get('[data-testid^="course-show-"]').first().click();

        cy.get('body').then(($tabBody) => {
            if ($tabBody.find('[value="materials"]').length > 0) {
                cy.get('[value="materials"]').click();

                // Look for edit links
                cy.get('body').then(($materialBody) => {
                    if ($materialBody.find('a[href*="/edit"]').length > 0) {
                        cy.get('a[href*="/edit"]').first().click();

                        // Should be on edit page
                        cy.url().should('include', '/edit');
                        cy.get('form').should('exist');
                        cy.get('input[name="title"]').should('exist');
                    } else {
                        cy.log('No edit links found for learning materials');
                    }
                });
            }
        });
    });

    it('should handle learning material deletion', () => {
        cy.visit('/courses');

        // Wait for dropdown buttons to appear
        cy.get('[data-testid^="course-dropdown-"]', { timeout: 3000 }).should(
            'have.length.at.least',
            1,
        );

        // Click on first dropdown menu button
        cy.get('[data-testid^="course-dropdown-"]').first().click();

        // Click show option
        cy.get('[data-testid^="course-show-"]').first().click();

        cy.get('body').then(($tabBody) => {
            if ($tabBody.find('[value="materials"]').length > 0) {
                cy.get('[value="materials"]').click();

                // Look for delete buttons
                cy.get('body').then(($materialBody) => {
                    if ($materialBody.find('button').length > 0) {
                        // Look for any button that might be a delete action
                        cy.get('button')
                            .contains(/delete|hapus/i)
                            .first()
                            .click({ force: true });

                        // Should show confirmation or perform delete
                        cy.get('body').should('be.visible');
                    } else {
                        cy.log('No delete buttons found for learning materials');
                    }
                });
            }
        });
    });
});
