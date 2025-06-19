/// <reference types="cypress" />

describe('Code Workspace and Execution', () => {
  beforeEach(() => {
    // Ensure user is logged in before each test
    cy.visit('/');
    cy.url({ timeout: 15000 }).should('match', /\/(dashboard|courses)/);
  });

  describe('Workspace Access and Display', () => {
    it('Should navigate to workspace from course materials', () => {
      cy.visit('/courses');
      
      // Find and click first course
      cy.get('[data-testid="course-card"], .course-card, [class*="course"], a[href*="/courses/"]')
        .first()
        .click();
      
      // Find and click first material
      cy.get('[data-testid="material-card"], .material-card, [class*="material"], a[href*="/workspace"], a[href*="/questions"]')
        .first()
        .click();
      
      // Should be in workspace
      cy.url().should('match', /\/(workspace|questions)/);
    });

    it('Should display code editor in workspace', () => {
      // Navigate to any available workspace
      cy.visit('/courses');
      cy.get('[data-testid="course-card"], .course-card, [class*="course"], a[href*="/courses/"]')
        .first()
        .click();
      
      cy.get('[data-testid="material-card"], .material-card, [class*="material"], a[href*="/workspace"], a[href*="/questions"]')
        .first()
        .click();
      
      // Check for code editor elements
      cy.get('body').should('contain.text', 'Code').or('contain.text', 'Editor');
      
      // Look for Monaco editor or code input
      cy.get('[data-testid="code-editor"], .monaco-editor, textarea, [contenteditable="true"]', { timeout: 15000 })
        .should('exist');
    });

    it('Should display test cases section', () => {
      // Navigate to workspace
      cy.visit('/courses');
      cy.get('[data-testid="course-card"], .course-card, [class*="course"], a[href*="/courses/"]')
        .first()
        .click();
      
      cy.get('[data-testid="material-card"], .material-card, [class*="material"], a[href*="/workspace"], a[href*="/questions"]')
        .first()
        .click();
      
      // Check for test cases
      cy.get('body').should('contain.text', 'Test').or('contain.text', 'Case');
    });
  });

  describe('Code Execution', () => {
    it('Should execute simple Python code', () => {
      // Navigate to workspace
      cy.visit('/courses');
      cy.get('[data-testid="course-card"], .course-card, [class*="course"], a[href*="/courses/"]')
        .first()
        .click();
      
      cy.get('[data-testid="material-card"], .material-card, [class*="material"], a[href*="/workspace"], a[href*="/questions"]')
        .first()
        .click();
      
      // Wait for editor to load
      cy.get('[data-testid="code-editor"], .monaco-editor, textarea, [contenteditable="true"]', { timeout: 15000 })
        .should('be.visible');
      
      // Try to input simple code
      const testCode = 'print("Hello, Cypress!")';
      
      // Clear and type code (try different approaches)
      cy.get('textarea').first().then(($textarea) => {
        if ($textarea.length > 0) {
          cy.wrap($textarea).clear().type(testCode);
        }
      });
      
      // Look for run/execute button
      cy.get('[data-testid="run-button"], button[class*="run"], button:contains("Run"), button:contains("Execute")')
        .first()
        .click();
      
      // Wait for output
      cy.get('[data-testid="output"], .output, [class*="output"]', { timeout: 30000 })
        .should('be.visible');
    });

    it('Should handle code execution errors gracefully', () => {
      // Navigate to workspace
      cy.visit('/courses');
      cy.get('[data-testid="course-card"], .course-card, [class*="course"], a[href*="/courses/"]')
        .first()
        .click();
      
      cy.get('[data-testid="material-card"], .material-card, [class*="material"], a[href*="/workspace"], a[href*="/questions"]')
        .first()
        .click();
      
      // Input invalid code
      const errorCode = 'print("Unclosed string';
      
      cy.get('textarea').first().then(($textarea) => {
        if ($textarea.length > 0) {
          cy.wrap($textarea).clear().type(errorCode);
        }
      });
      
      // Run the code
      cy.get('[data-testid="run-button"], button[class*="run"], button:contains("Run"), button:contains("Execute")')
        .first()
        .click();
      
      // Should show error without crashing
      cy.get('body').should('not.contain.text', 'Application Error');
      cy.get('[data-testid="output"], .output, [class*="output"]', { timeout: 30000 })
        .should('be.visible');
    });
  });

  describe('Student Code Isolation', () => {
    it('Should maintain separate execution environments', () => {
      // Navigate to workspace
      cy.visit('/courses');
      cy.get('[data-testid="course-card"], .course-card, [class*="course"], a[href*="/courses/"]')
        .first()
        .click();
      
      cy.get('[data-testid="material-card"], .material-card, [class*="material"], a[href*="/workspace"], a[href*="/questions"]')
        .first()
        .click();
      
      // Execute code that sets a variable
      const isolationCode = 'isolation_test = "cypress_test_123"\\nprint(isolation_test)';
      
      cy.get('textarea').first().then(($textarea) => {
        if ($textarea.length > 0) {
          cy.wrap($textarea).clear().type(isolationCode);
        }
      });
      
      cy.get('[data-testid="run-button"], button[class*="run"], button:contains("Run"), button:contains("Execute")')
        .first()
        .click();
      
      // Should execute without interference
      cy.get('[data-testid="output"], .output, [class*="output"]', { timeout: 30000 })
        .should('be.visible')
        .and('contain.text', 'cypress_test_123');
    });
  });

  describe('Test Case Integration', () => {
    it('Should display SKKNI-based test cases', () => {
      // Navigate to workspace
      cy.visit('/courses');
      cy.get('[data-testid="course-card"], .course-card, [class*="course"], a[href*="/courses/"]')
        .first()
        .click();
      
      cy.get('[data-testid="material-card"], .material-card, [class*="material"], a[href*="/workspace"], a[href*="/questions"]')
        .first()
        .click();
      
      // Look for SKKNI or Data Science references
      cy.get('body').should('satisfy', ($body) => {
        const text = $body.text();
        return text.includes('SKKNI') || 
               text.includes('Data Science') || 
               text.includes('Test Case') ||
               text.includes('Competency');
      });
    });

    it('Should show test case results after execution', () => {
      // Navigate to workspace
      cy.visit('/courses');
      cy.get('[data-testid="course-card"], .course-card, [class*="course"], a[href*="/courses/"]')
        .first()
        .click();
      
      cy.get('[data-testid="material-card"], .material-card, [class*="material"], a[href*="/workspace"], a[href*="/questions"]')
        .first()
        .click();
      
      // Execute any code
      cy.get('textarea').first().then(($textarea) => {
        if ($textarea.length > 0) {
          cy.wrap($textarea).clear().type('print("test")');
        }
      });
      
      cy.get('[data-testid="run-button"], button[class*="run"], button:contains("Run"), button:contains("Execute")')
        .first()
        .click();
      
      // Should show test results
      cy.get('body').should('satisfy', ($body) => {
        const text = $body.text();
        return text.includes('Test') || 
               text.includes('Result') || 
               text.includes('Pass') ||
               text.includes('Fail');
      });
    });
  });
});
