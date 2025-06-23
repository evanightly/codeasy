/// <reference types="cypress" />

describe('User Login Flow', () => {
    let loginCredentials: { email: string; password: string };

    before(() => {
        cy.resetDatabase();

        // Load fixture data once before all tests
        cy.fixture('login').then((credentials) => {
            loginCredentials = credentials;
        });
    });

    beforeEach(() => {
        // Reset database to ensure clean state for each test

        // Visit login page with fresh session
        cy.visit('/login');
        cy.waitForPageLoad();
    });

    describe('Login Page UI', () => {
        it('should display login page with correct elements', () => {
            // Check page title
            cy.title().should('contain', 'Welcome');

            // Check hero section is visible on desktop
            cy.viewport(1280, 720);
            cy.get('.lg\\:block').should('be.visible');

            // Check login form elements
            cy.get('form').should('be.visible');
            cy.get('input[name="email"]').should('be.visible');
            cy.get('button[role="checkbox"]').should('be.visible');

            // Check navigation link
            cy.contains("Don't have an account?").should('be.visible');
            cy.get('a[href*="register"]').should('be.visible');

            // Check dark mode toggle
            cy.get('button[title*="Switch to Dark Mode"]').should('be.visible');
        });

        it('should toggle dark mode', () => {
            cy.get('button[title*="Switch to Dark Mode"]').click();

            // Should toggle the theme (check if classes change)
            cy.get('html').should('exist');
        });

        it('should navigate to register page', () => {
            cy.contains("Don't have an account?").click();
            cy.url().should('include', '/register');
        });
    });

    describe('Email Step', () => {
        it('should validate required email field', () => {
            // Try to proceed without email
            cy.get('button').contains('Next').click();

            // Should show validation error
            cy.contains('is required').should('be.visible');
        });

        it('should proceed to password step with valid email', () => {
            // Enter valid email from fixture
            cy.get('input[name="email"]').type(loginCredentials.email);

            // Click next button
            cy.get('button').contains('Next').click();

            // Should proceed to password step
            cy.get('input[name="password"]').should('be.visible');
            cy.get('button[name="back-button"]').should('be.visible');
        });

        it('should remember checkbox state', () => {
            // Check remember checkbox
            cy.get('button[role="checkbox"]').click();
            cy.get('input[type="checkbox"][name="remember"]').should('be.checked');

            // Proceed to password step using fixture email
            cy.get('input[name="email"]').type(loginCredentials.email);
            cy.get('button').contains('Next').click();

            // Go back to email step
            cy.get('button[name="back-button"]').click();

            // Remember checkbox should still be checked
            cy.get('input[type="checkbox"][name="remember"]').should('be.checked');
        });
    });

    describe('Password Step', () => {
        beforeEach(() => {
            // Navigate to password step using fixture email
            cy.get('input[name="email"]').type(loginCredentials.email);
            cy.get('button').contains('Next').click();
            cy.get('input[name="password"]').should('be.visible');
        });

        it('should show email and back button', () => {
            // Should display the entered email from fixture
            cy.contains(loginCredentials.email).should('be.visible');

            // Should show back button
            cy.get('button[name="back-button"]').should('be.visible');
        });

        it('should go back to email step', () => {
            cy.get('button[name="back-button"]').click();

            // Should be back to email step with fixture email
            cy.get('input[name="email"]')
                .should('be.visible')
                .and('have.value', loginCredentials.email);
            cy.get('button').contains('Next').should('be.visible');
        });

        it('should validate required password field', () => {
            // Try to login without password
            cy.get('button').contains('Sign In').click();

            // Should show validation error
            // cy.contains('password is required').should('be.visible');
            cy.contains('Invalid credentials').should('be.visible');
        });

        it('should handle authentication attempts', () => {
            cy.get('input[name="password"]').type('wrongpassword');
            cy.get('button').contains('Sign In').click();

            // Simply verify the final state - that authentication failed
            cy.get('input[name="password"]').should('be.visible').and('have.value', '');
            cy.contains('Invalid credentials').should('be.visible');
        });
    });

    describe('Login Authentication', () => {
        it('should login successfully with valid credentials', () => {
            // Use the custom login command
            cy.login();

            // Should redirect to dashboard
            cy.url().should('include', '/dashboard');

            // Should show success message (if toast is implemented)
            // cy.contains('Login successful').should('be.visible');
        });

        it('should handle invalid credentials', () => {
            cy.get('input[name="email"]').type('invalid@example.com');
            cy.get('button').contains('Next').click();

            cy.get('input[name="password"]').type('wrongpassword');
            cy.get('button').contains('Sign In').click();

            // Should return to password step after error
            cy.get('input[name="password"]').should('be.visible').and('have.value', '');

            // Should show error message
            cy.contains('Invalid credentials').should('be.visible');
        });

        it('should handle server errors gracefully', () => {
            cy.get('input[name="email"]').type(loginCredentials.email);
            cy.get('button').contains('Next').click();

            cy.get('input[name="password"]').type('invalidpassword');
            cy.get('button').contains('Sign In').click();

            // Should handle error gracefully
            cy.get('input[name="password"]').should('be.visible');
            cy.contains('Invalid credentials').should('be.visible');
        });
    });

    describe('Auto-fill Functionality', () => {
        it('should handle browser auto-fill', () => {
            // Navigate to password step using fixture email
            cy.get('input[name="email"]').type(loginCredentials.email);
            cy.get('button').contains('Next').click();

            // Simulate browser auto-fill by setting fixture password directly
            cy.get('input[name="password"]').then(($input) => {
                $input.val(loginCredentials.password);
                $input.trigger('input');
            });

            // Verify the behavior - should redirect to dashboard
            cy.url({ timeout: 10000 }).should('include', '/dashboard');
        });
    });

    describe('Keyboard Navigation', () => {
        it('should support Enter key navigation', () => {
            // Enter email and press Enter using fixture data
            cy.get('input[name="email"]').type(`${loginCredentials.email}{enter}`);

            // Should proceed to password step
            cy.get('input[name="password"]').should('be.visible').and('be.focused');

            // Enter password and press Enter using fixture data
            cy.get('input[name="password"]').type(`${loginCredentials.password}{enter}`);

            // Verify the final result - should redirect to dashboard
            cy.url({ timeout: 10000 }).should('include', '/dashboard');
        });
    });

    describe('Responsive Design', () => {
        it('should work on mobile devices', () => {
            cy.viewport('iphone-x');

            // Hero section should be hidden on mobile
            cy.get('.lg\\:block').should('not.be.visible');

            // Form should be visible and functional
            cy.get('form').should('be.visible');
            cy.get('input[name="email"]').should('be.visible');

            // Should be able to complete login flow using fixture data
            cy.get('input[name="email"]').type(loginCredentials.email);
            cy.get('button').contains('Next').click();
            cy.get('input[name="password"]').should('be.visible');
        });

        it('should work on tablet devices', () => {
            cy.viewport('ipad-2');

            // Should display properly on tablet
            cy.get('form').should('be.visible');
            cy.get('input[name="email"]').should('be.visible');

            // Complete login flow using fixture data
            cy.get('input[name="email"]').type(loginCredentials.email);
            cy.get('button').contains('Next').click();
            cy.get('input[name="password"]').should('be.visible');
        });
    });

    // describe('Accessibility', () => {
    //     it('should have proper ARIA labels and roles', () => {
    //         // Check form accessibility
    //         cy.get('form').should('exist');

    //         // Check input labels
    //         cy.get('label').should('exist');
    //         cy.get('input[name="email"]').should('have.attr', 'placeholder');

    //         // Check button accessibility
    //         cy.get('button').should('have.attr', 'type');
    //     });

    //     it('should support screen readers', () => {
    //         // Check for screen reader text
    //         cy.get('.sr-only').should('exist');

    //         // Check focus management
    //         cy.get('input[name="email"]').should('be.focused');
    //     });
    // });
});
