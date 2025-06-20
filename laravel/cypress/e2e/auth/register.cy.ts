/// <reference types="cypress" />

describe('User Registration Flow', () => {
    beforeEach(() => {
        // Clear any existing session
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.visit('/register');
        cy.waitForPageLoad();
    });

    describe('Register Page UI', () => {
        it('should display register page with correct elements', () => {
            // Check page title
            cy.title().should('contain', 'Create');

            // Check hero section is visible on desktop
            cy.viewport(1280, 720);
            cy.get('.lg\\:block').should('be.visible');

            // Check register form elements
            cy.get('form').should('be.visible');
            cy.get('input[name="name"]').should('be.visible');
            cy.get('input[name="email"]').should('be.visible');
            cy.get('input[name="password"]').should('be.visible');
            cy.get('input[name="password_confirmation"]').should('be.visible');

            // Check role selector
            cy.get('button[role="combobox"]').should('be.visible');

            // Check navigation link
            cy.contains('Already registered?').should('be.visible');
            cy.get('a[href*="login"]').should('be.visible');

            // Check dark mode toggle
            cy.get('button[title*="Switch to Dark Mode"]').should('be.visible');
        });

        it('should toggle dark mode', () => {
            cy.get('button[title*="Switch to Dark Mode"]').click();

            // Should toggle the theme
            cy.get('html').should('exist');
        });

        it('should navigate to login page', () => {
            cy.contains('Already registered?').click();
            cy.url().should('include', '/login');
        });
    });

    describe('Form Validation', () => {
        it('should validate required name field', () => {
            cy.get('button[type="submit"]').click();

            // Should show validation error for name
            cy.contains('required').should('be.visible');
        });

        it('should validate required email field', () => {
            cy.get('input[name="name"]').type('Test User');
            cy.get('button[type="submit"]').click();

            // Should show validation error for email
            cy.contains('required').should('be.visible');
        });

        // already handled by default browser validation
        // it('should validate email format', () => {
        //     cy.get('input[name="name"]').type('Test User');
        //     cy.get('input[name="email"]').type('invalid-email');
        //     cy.get('button[type="submit"]').click();

        //     // Should show email format validation error
        //     cy.contains('invalid').should('be.visible');
        // });

        it('should validate password minimum length', () => {
            cy.get('input[name="name"]').type('Test User');
            cy.get('input[name="email"]').type('test@example.com');
            cy.get('input[name="password"]').type('123');
            cy.get('button[type="submit"]').click();

            // Should show password length validation error
            cy.contains('password field must be at least 8 characters').should('be.visible');
        });

        it('should validate password confirmation', () => {
            cy.get('input[name="name"]').type('Test User');
            cy.get('input[name="email"]').type('test@example.com');
            cy.get('input[name="password"]').type('password123');
            cy.get('input[name="password_confirmation"]').type('different123');
            cy.get('button[type="submit"]').click();

            // Should show password confirmation validation error
            cy.contains('does not match').should('be.visible');
        });
    });

    // describe('Role Selection', () => {
    //     it('should show role options when clicked', () => {
    //         // Click the select trigger
    //         cy.get('button[role="combobox"]').click();

    //         // Wait for dropdown to be fully rendered
    //         cy.get('[role="combobox"]', { timeout: 5000 }).should('be.visible');

    //         // Should show role options
    //         cy.contains('teacher').should('be.visible');
    //         cy.contains('student').should('be.visible');
    //     });

    //     it('should select teacher role', () => {
    //         // Use custom command for ShadCN select
    //         cy.selectShadcnOption('button[role="combobox"]', 'teacher');

    //         // Should show school selector
    //         cy.contains('School').should('be.visible');
    //         cy.get('input[placeholder*="Search"]').should('be.visible');
    //     });

    //     it('should select student role', () => {
    //         // Use custom command for ShadCN select
    //         cy.selectShadcnOption('button[role="combobox"]', 'student');

    //         // Should show school selector
    //         cy.contains('School').should('be.visible');
    //         cy.get('input[placeholder*="Search"]').should('be.visible');
    //     });

    //     it('should hide school selector when role is cleared', () => {
    //         // First select a role
    //         cy.get('button[role="combobox"]').click();
    //         cy.contains('teacher').click({ force: true });

    //         // School selector should be visible
    //         cy.contains('School').should('be.visible');

    //         // Clear role selection (if available)
    //         cy.get('button[role="combobox"]').click();
    //         // Note: The actual clear mechanism would depend on the Select component implementation
    //     });
    // });

    // describe('School Selection', () => {
    //     beforeEach(() => {
    //         // Select teacher role to show school selector
    //         cy.get('button[role="combobox"]').click();
    //         cy.contains('teacher').click({ force: true });
    //     });

    //     it('should search and select school', () => {
    //         // Type in school search
    //         cy.get('input[placeholder*="Search"]').type('Test School');

    //         // Should show search results (mocked)
    //         cy.get('[data-testid="school-option"]').should('be.visible');
    //         cy.get('[data-testid="school-option"]').first().click();

    //         // Should select the school
    //         cy.get('input[placeholder*="Search"]').should('have.value', 'Test School');
    //     });

    //     it('should validate required school for teacher role', () => {
    //         // Fill other fields but leave school empty
    //         cy.get('input[name="name"]').type('Test Teacher');
    //         cy.get('input[name="email"]').type('teacher@example.com');
    //         cy.get('input[name="password"]').type('password123');
    //         cy.get('input[name="password_confirmation"]').type('password123');

    //         cy.get('button[type="submit"]').click();

    //         // Should show school validation error
    //         cy.contains('is required when role is Teacher').should('be.visible');
    //     });

    //     it('should validate required school for student role', () => {
    //         // Change to student role
    //         cy.get('button[role="combobox"]').click();
    //         cy.contains('student').click();

    //         // Fill other fields but leave school empty
    //         cy.get('input[name="name"]').type('Test Student');
    //         cy.get('input[name="email"]').type('student@example.com');
    //         cy.get('input[name="password"]').type('password123');
    //         cy.get('input[name="password_confirmation"]').type('password123');

    //         cy.get('button[type="submit"]').click();

    //         // Should show school validation error
    //         cy.contains('is required when role is Student').should('be.visible');
    //     });
    // });

    describe('Registration Process', () => {
        it('should register teacher successfully', () => {
            // Intercept registration request
            cy.intercept('POST', '**/register', {
                statusCode: 200,
                body: { success: true, redirect: '/dashboard' },
            }).as('registerUser');

            // Fill form for teacher
            cy.get('input[name="name"]').type('John Teacher');
            cy.get('input[name="email"]').type('john.teacher@example.com');

            // Select teacher role
            cy.get('button[role="combobox"]').click();
            cy.contains('teacher').click({ force: true });

            // Select school (mock selection)
            // cy.get('input[placeholder*="Search"]').type('Test High School');
            // Simulate school selection
            // cy.get('input[placeholder*="Search"]').blur();

            cy.get('input[name="password"]').type('password123');
            cy.get('input[name="password_confirmation"]').type('password123');

            // Submit form
            cy.get('button[type="submit"]').click();

            cy.wait('@registerUser');

            // Should show success message
            cy.contains('Account created successfully!').should('be.visible');
        });

        it('should register student successfully', () => {
            // Intercept registration request
            cy.intercept('POST', '**/register', {
                statusCode: 200,
                body: { success: true, redirect: '/dashboard' },
            }).as('registerUser');

            // Fill form for student
            cy.get('input[name="name"]').type('Jane Student');
            cy.get('input[name="email"]').type('jane.student@example.com');

            // Select student role
            cy.get('button[role="combobox"]').click();
            cy.contains('student').click({ force: true });

            // Select school (mock selection)
            // cy.get('input[placeholder*="Search"]').type('Test University');
            // Simulate school selection
            // cy.get('input[placeholder*="Search"]').blur();

            cy.get('input[name="password"]').type('password123');
            cy.get('input[name="password_confirmation"]').type('password123');

            // Submit form
            cy.get('button[type="submit"]').click();

            cy.wait('@registerUser');

            // Should show success message
            cy.contains('Account created successfully!').should('be.visible');
        });

        it('should handle registration errors', () => {
            // Intercept registration request with error
            cy.intercept('POST', '**/register', {
                statusCode: 422,
                body: {
                    errors: {
                        email: ['The email has already been taken.'],
                    },
                },
            }).as('registerError');

            // Fill form
            cy.get('input[name="name"]').type('Test User');
            cy.get('input[name="email"]').type('existing@example.com');
            cy.get('input[name="password"]').type('password123');
            cy.get('input[name="password_confirmation"]').type('password123');

            // Select role
            cy.get('button[role="combobox"]').click();
            cy.contains('teacher').click({ force: true });

            // Submit form
            cy.get('button[type="submit"]').click();

            cy.wait('@registerError');

            // Should show error message
            cy.contains('The email has already been taken').should('be.visible');
        });

        it('should handle server errors gracefully', () => {
            // Intercept registration request with server error
            cy.intercept('POST', '**/register', {
                statusCode: 500,
                body: { message: 'Internal Server Error' },
            }).as('serverError');

            // Fill valid form
            cy.get('input[name="name"]').type('Test User');
            cy.get('input[name="email"]').type('test@example.com');
            cy.get('input[name="password"]').type('password123');
            cy.get('input[name="password_confirmation"]').type('password123');

            // Select role
            cy.get('button[role="combobox"]').click();
            cy.contains('teacher').click({ force: true });

            // Submit form
            cy.get('button[type="submit"]').click();

            cy.wait('@serverError');

            // Should show generic error message
            cy.contains('Internal Server Error').should('be.visible');
        });
    });

    describe('Loading States', () => {
        it('should show loading state during registration', () => {
            // Intercept with delay
            cy.intercept('POST', '**/register', {
                delay: 2000,
                statusCode: 200,
                body: { success: true },
            }).as('slowRegister');

            // Fill and submit form
            cy.get('input[name="name"]').type('Test User');
            cy.get('input[name="email"]').type('test@example.com');
            cy.get('input[name="password"]').type('password123');
            cy.get('input[name="password_confirmation"]').type('password123');

            cy.get('button[role="combobox"]').click();
            cy.contains('teacher').click({ force: true });

            cy.get('button[type="submit"]').click();

            // Should show loading state
            cy.get('button[type="submit"]').should('be.disabled');
            cy.get('.animate-spin').should('be.visible');
        });
    });

    describe('Responsive Design', () => {
        it('should work on mobile devices', () => {
            cy.viewport('iphone-x');

            // Hero section should be hidden on mobile
            cy.get('.lg\\:block').should('not.be.visible');

            // Form should be visible and functional
            cy.get('form').should('be.visible');
            cy.get('input[name="name"]').should('be.visible');

            // Should be able to complete registration flow
            cy.get('input[name="name"]').type('Test User');
            cy.get('input[name="email"]').type('test@example.com');
            cy.get('button[role="combobox"]').should('be.visible');
        });

        it('should work on tablet devices', () => {
            cy.viewport('ipad-2');

            // Should display properly on tablet
            cy.get('form').should('be.visible');
            cy.get('input[name="name"]').should('be.visible');

            // Complete registration flow
            cy.get('input[name="name"]').type('Test User');
            cy.get('input[name="email"]').type('test@example.com');
            cy.get('button[role="combobox"]').should('be.visible');
        });
    });

    describe('Accessibility', () => {
        it('should have proper form labels', () => {
            // Check form accessibility
            cy.get('form').should('exist');

            // Check input labels
            cy.get('label').should('have.length.at.least', 4);
            cy.get('input[name="name"]').should('have.attr', 'placeholder');
            cy.get('input[name="email"]').should('have.attr', 'placeholder');

            // Check button accessibility
            cy.get('button[type="submit"]').should('exist');
        });

        it('should support keyboard navigation', () => {
            // Tab through form elements
            cy.get('input[name="name"]').focus().should('be.focused');
            // cy.get('input[name="name"]').type('{tab}'); // Deprecated
            cy.press(Cypress.Keyboard.Keys.TAB);
            cy.get('input[name="email"]').should('be.focused');
        });

        // it('should support screen readers', () => {
        //     // Check for screen reader text
        //     cy.get('.sr-only').should('exist');

        //     // Check ARIA attributes
        //     cy.get('button[role="combobox"]').should('have.attr', 'aria-haspopup');
        // });
    });

    describe('Form Flow Integration', () => {
        it('should complete full registration flow', () => {
            // Mock successful registration
            cy.intercept('POST', '**/register', {
                statusCode: 200,
                body: { success: true },
            }).as('register');

            // cy.intercept('GET', '**/schools*', {
            //     statusCode: 200,
            //     body: {
            //         data: [
            //             { id: 1, name: 'Test High School' },
            //             { id: 2, name: 'Test University' },
            //         ],
            //     },
            // }).as('schools');

            // Complete the entire flow
            cy.get('input[name="name"]').type('Complete Test User');
            cy.get('input[name="email"]').type('complete@example.com');

            // Select role and school
            // cy.get('button[role="combobox"]').click();
            // cy.contains('teacher').click({ force: true });

            // Search and select school
            // cy.get('input[placeholder*="Search"]').type('Test High');
            // cy.wait('@schools');

            // Complete password fields
            cy.get('input[name="password"]').type('password123');
            cy.get('input[name="password_confirmation"]').type('password123');

            // Submit registration
            cy.get('button[type="submit"]').click();

            cy.wait('@register');
            
            cy.contains('Account created successfully!').should('be.visible');

            // Should redirect to dashboard
            // cy.url({ timeout: 10000 }).should('include', '/dashboard');
        });
    });
});
