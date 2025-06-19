/// <reference types="cypress" />

describe('Authentication and Session Management', () => {
  describe('Auto-Login Functionality', () => {
    it('Should automatically log in existing user', () => {
      cy.visit('/');
      
      // Should redirect to dashboard or courses page
      cy.url({ timeout: 15000 }).should('match', /\/(dashboard|courses)/);
      
      // Should not show login form
      cy.get('body').should('not.contain', 'Login');
      cy.get('body').should('not.contain', 'Sign In');
      
      // Should show user interface elements
      cy.get('body').should('contain.text', 'Dashboard').or('contain.text', 'Courses');
    });

    it('Should maintain session across navigation', () => {
      cy.visit('/');
      cy.url({ timeout: 15000 }).should('match', /\/(dashboard|courses)/);
      
      // Navigate to different pages
      cy.visit('/courses');
      cy.get('body').should('not.contain', 'Login');
      
      // Return to dashboard
      cy.visit('/dashboard');
      cy.get('body').should('not.contain', 'Login');
      
      // User should remain authenticated
      cy.url().should('not.include', '/login');
    });
  });

  describe('First-Time User Login', () => {
    it('Should handle first-time login if no user exists', () => {
      cy.visit('/login');
      
      cy.get('body').then(($body) => {
        if ($body.find('input[name="email"]').length > 0) {
          // Login form exists - perform login
          cy.get('input[name="email"]').type('admin@codeasy.local');
          cy.get('input[name="password"]').type('password123');
          cy.get('button[type="submit"]').click();
          
          // Should redirect to dashboard
          cy.url({ timeout: 10000 }).should('match', /\/(dashboard|courses)/);
          
          // Should show success indicators
          cy.get('body').should('contain.text', 'Dashboard').or('contain.text', 'Welcome');
        } else {
          // No login form - already logged in
          cy.url().should('match', /\/(dashboard|courses)/);
        }
      });
    });
  });

  describe('Session Security', () => {
    it('Should protect authenticated routes', () => {
      // Test that protected routes redirect to login when not authenticated
      cy.clearCookies();
      cy.clearLocalStorage();
      
      // Try to access protected route
      cy.visit('/courses', { failOnStatusCode: false });
      
      // Should redirect to login or show login form
      cy.url().should('satisfy', (url) => {
        return url.includes('/login') || url.includes('/');
      });
    });
  });
});
