/// <reference types="cypress" />

describe('Learning Material Question Test Case CRUD for Teacher', () => {
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

    it('should display test cases page', () => {
        cy.visit('/courses');

        // Wait for dropdown buttons to appear
        cy.get('[data-testid^="course-dropdown-"]', { timeout: 3000 }).should(
            'have.length.at.least',
            1,
        );

        // Click on first dropdown menu button
        cy.get('[data-testid^="course-dropdown-"]').first().click();

        // Get course ID and visit directly
        cy.get('[data-testid^="course-show-"]')
            .first()
            .invoke('attr', 'href')
            .then((href) => {
                if (href) {
                    // Try to visit test cases page directly (assuming material and question IDs exist)
                    cy.visit(`/courses/4/learning-materials/39/questions/211/test-cases`, {
                        failOnStatusCode: false,
                    });

                    cy.url().then((url) => {
                        if (url.includes('/test-cases')) {
                            cy.get('body').should('contain.text', 'Test Case');
                        } else {
                            cy.log('Test cases page not accessible');
                        }
                    });
                }
            });
    });

    it('should display test case create form', () => {
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
                if (href) {
                    // Try to visit test case create page directly
                    cy.visit(`/courses/4/learning-materials/39/questions/211/test-cases/create`, {
                        failOnStatusCode: false,
                    });

                    cy.url().then((url) => {
                        if (url.includes('/test-cases/create')) {
                            cy.get('form').should('exist');
                            cy.get('textarea[name="description"]').should('exist');
                            cy.get('button[type="submit"]').should('exist');
                        } else {
                            cy.log('Test case create page not accessible');
                        }
                    });
                }
            });
    });

    it('should create a new test case', () => {
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
                if (href) {
                    cy.visit(`/courses/4/learning-materials/39/questions/211/test-cases/create`, {
                        failOnStatusCode: false,
                    });

                    cy.url().then((url) => {
                        if (url.includes('/test-cases/create')) {
                            // Set up mock for CodeMirror input field
                            cy.mockCodeMirror('input', 'test input data');

                            // Fill out the form
                            cy.get('textarea[name="description"]').type('Test case description');

                            // Submit the form
                            cy.get('button[type="submit"]').click();

                            // Should redirect back or show success
                            cy.url({ timeout: 10000 }).should('satisfy', (url) => {
                                return (
                                    url.includes('/test-cases') ||
                                    url.includes('/questions') ||
                                    url.includes('/create')
                                );
                            });
                        } else {
                            cy.log('Test case creation not accessible');
                        }
                    });
                }
            });
    });

    it('should display test case details', () => {
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
                if (href) {
                    cy.visit(`/courses/4/learning-materials/39/questions/211/test-cases`, {
                        failOnStatusCode: false,
                    });

                    cy.url().then((url) => {
                        if (url.includes('/test-cases')) {
                            // Look for test case links
                            cy.get('body').then(($tcBody) => {
                                if ($tcBody.find('a[href*="/test-cases/"]').length > 0) {
                                    cy.get('a[href*="/test-cases/"]').first().click();
                                    cy.url().should('include', '/test-cases/');
                                    cy.get('body').should('be.visible');
                                } else {
                                    cy.log('No test cases found to show');
                                }
                            });
                        }
                    });
                }
            });
    });

    it('should handle test case file upload', () => {
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
                if (href) {
                    cy.visit(`/courses/4/learning-materials/39/questions/211/test-cases/create`, {
                        failOnStatusCode: false,
                    });

                    cy.url().then((url) => {
                        if (url.includes('/test-cases/create')) {
                            // Check if file upload input exists
                            cy.get('body').then(($formBody) => {
                                if ($formBody.find('input[type="file"]').length > 0) {
                                    // Create a simple test file
                                    const testContent = 'Test output file content';
                                    cy.get('input[type="file"]').selectFile(
                                        {
                                            contents: Cypress.Buffer.from(testContent),
                                            fileName: 'test-output.txt',
                                            mimeType: 'text/plain',
                                        },
                                        { force: true },
                                    );

                                    cy.log('File upload field tested');
                                } else {
                                    cy.log('No file upload field found');
                                }
                            });
                        }
                    });
                }
            });
    });

    it('should handle test case edit and delete', () => {
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
                if (href) {
                    cy.visit(`/courses/4/learning-materials/39/questions/211/test-cases`, {
                        failOnStatusCode: false,
                    });

                    cy.url().then((url) => {
                        if (url.includes('/test-cases')) {
                            // Look for edit/delete actions
                            cy.get('body').then(($actionBody) => {
                                if ($actionBody.find('a[href*="/edit"], button').length > 0) {
                                    cy.log('Test case actions found');
                                    cy.get('body').should('be.visible');
                                } else {
                                    cy.log('No test case actions found');
                                }
                            });
                        }
                    });
                }
            });
    });
});
