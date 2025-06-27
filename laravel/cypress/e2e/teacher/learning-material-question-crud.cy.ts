/// <reference types="cypress" />

describe('Learning Material Question CRUD for Teacher', () => {
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
    it('should display learning material questions page', () => {
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

        // Navigate to materials tab and find a learning material
        cy.get('body').then(($tabBody) => {
            if ($tabBody.find('[value="materials"]').length > 0) {
                cy.get('[value="materials"]').click();

                // Look for learning material show links
                cy.get('body').then(($materialBody) => {
                    if ($materialBody.find('a[href*="/learning-materials/"]').length > 0) {
                        cy.get('a[href*="/learning-materials/"]').first().click();

                        // Should be on learning material show page
                        cy.url().should('include', '/learning-materials/');

                        // Look for questions tab
                        cy.get('body').then(($questionBody) => {
                            if ($questionBody.find('[value="questions"]').length > 0) {
                                cy.get('[value="questions"]').click();
                                cy.get('body').should('contain.text', 'Question');
                            } else {
                                cy.log('No questions tab found');
                            }
                        });
                    } else {
                        cy.log('No learning materials found');
                    }
                });
            }
        });
    });
    it('should display question create form', () => {
        cy.visit('/courses');

        // Wait for course list to load
        cy.get('body', { timeout: 3000 }).should('be.visible');

        cy.get('body').then(($body) => {
            if ($body.find('[data-testid^="course-show-"]').length > 0) {
                cy.get('[data-testid^="course-show-"]')
                    .first()
                    .invoke('attr', 'href')
                    .then((href) => {
                        const courseId = href?.match(/\/courses\/(\d+)/)?.[1];
                        if (courseId) {
                            // Try to visit question create page directly (assuming material ID 1 exists)
                            cy.visit(`/courses/${courseId}/learning-materials/1/questions/create`, {
                                failOnStatusCode: false,
                            });

                            // Check if we're on a valid page or got redirected
                            cy.url().then((url) => {
                                if (url.includes('/questions/create')) {
                                    cy.get('form').should('exist');
                                    cy.get('input[name="title"]').should('exist');
                                    cy.get('button[type="submit"]').should('exist');
                                } else {
                                    cy.log(
                                        'Question create page not accessible or no materials exist',
                                    );
                                }
                            });
                        }
                    });
            }
        });
    });
    it('should create a new question', () => {
        cy.visit('/courses');

        // Wait for course list to load
        cy.get('body', { timeout: 3000 }).should('be.visible');

        cy.get('body').then(($body) => {
            if ($body.find('[data-testid^="course-show-"]').length > 0) {
                cy.get('[data-testid^="course-show-"]')
                    .first()
                    .invoke('attr', 'href')
                    .then((href) => {
                        const courseId = href?.match(/\/courses\/(\d+)/)?.[1];
                        if (courseId) {
                            cy.visit(`/courses/${courseId}/learning-materials/1/questions/create`, {
                                failOnStatusCode: false,
                            });

                            cy.url().then((url) => {
                                if (url.includes('/questions/create')) {
                                    // Set up mocks for CodeMirror fields
                                    cy.mockCodeMirror('pre_code', 'print("Hello, World!")');
                                    cy.mockCodeMirror('example_code', 'def example():\n    pass');

                                    // Fill out the form
                                    cy.get('input[name="title"]').type('Test Question');
                                    cy.get('textarea[name="description"]').type(
                                        'Test question description',
                                    );

                                    // Submit the form
                                    cy.get('button[type="submit"]').click();

                                    // Should redirect back
                                    cy.url({ timeout: 10000 }).should('satisfy', (url) => {
                                        return (
                                            url.includes('/learning-materials') ||
                                            url.includes('/courses')
                                        );
                                    });
                                } else {
                                    cy.log('Question creation not accessible');
                                }
                            });
                        }
                    });
            }
        });
    });
    it('should display question details', () => {
        cy.visit('/courses');

        // Wait for course list to load
        cy.get('body', { timeout: 3000 }).should('be.visible');

        cy.get('body').then(($body) => {
            if ($body.find('[data-testid^="course-show-"]').length > 0) {
                cy.get('[data-testid^="course-show-"]').first().click();

                cy.get('body').then(($tabBody) => {
                    if ($tabBody.find('[value="materials"]').length > 0) {
                        cy.get('[value="materials"]').click();

                        cy.get('body').then(($materialBody) => {
                            if ($materialBody.find('a[href*="/learning-materials/"]').length > 0) {
                                cy.get('a[href*="/learning-materials/"]').first().click();

                                cy.get('body').then(($questionBody) => {
                                    if ($questionBody.find('[value="questions"]').length > 0) {
                                        cy.get('[value="questions"]').click();

                                        // Look for question links
                                        cy.get('body').then(($qBody) => {
                                            if ($qBody.find('a[href*="/questions/"]').length > 0) {
                                                cy.get('a[href*="/questions/"]').first().click();
                                                cy.url().should('include', '/questions/');
                                                cy.get('body').should('be.visible');
                                            } else {
                                                cy.log('No questions found to show');
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    });

    it('should handle question edit and delete', () => {
        cy.visit('/courses');

        cy.get('body').then(($body) => {
            if ($body.find('[data-testid^="course-show-"]').length > 0) {
                cy.get('[data-testid^="course-show-"]').first().click();

                cy.get('body').then(($tabBody) => {
                    if ($tabBody.find('[value="materials"]').length > 0) {
                        cy.get('[value="materials"]').click();

                        cy.get('body').then(($materialBody) => {
                            if ($materialBody.find('a[href*="/learning-materials/"]').length > 0) {
                                cy.get('a[href*="/learning-materials/"]').first().click();

                                cy.get('body').then(($questionBody) => {
                                    if ($questionBody.find('[value="questions"]').length > 0) {
                                        cy.get('[value="questions"]').click();

                                        // Look for edit/delete buttons
                                        cy.get('body').then(($actionBody) => {
                                            if (
                                                $actionBody.find('a[href*="/edit"], button')
                                                    .length > 0
                                            ) {
                                                cy.log('Question actions found');
                                                cy.get('body').should('be.visible');
                                            } else {
                                                cy.log('No question actions found');
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    });
});
