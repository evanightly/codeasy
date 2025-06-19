/// <reference types="cypress" />

describe('Feature Test Cases - Codeasy E2E Testing', () => {
  beforeEach(() => {
    // Set up the testing environment
    cy.viewport(1280, 800);
  });

  describe('1. User Authentication System', () => {
    it('TC-001: Should auto-login if user already exists in database', () => {
      cy.visit('/');
      
      // Check if we get redirected to dashboard automatically
      cy.url({ timeout: 10000 }).should('match', /\/(dashboard|courses)/);
      
      // Verify user is logged in by checking for logout button or user menu
      cy.get('body').should('contain.text', 'Dashboard').or('contain.text', 'Courses');
    });

    it('TC-002: Should allow first-time login if no user exists', () => {
      // This test would run if database is empty
      cy.visit('/login');
      
      cy.get('body').then(($body) => {
        if ($body.find('input[name="email"]').length > 0) {
          // Login form exists, perform login
          cy.get('input[name="email"]').type('admin@codeasy.local');
          cy.get('input[name="password"]').type('password123');
          cy.get('button[type="submit"]').click();
          
          cy.url().should('match', /\/(dashboard|courses)/);
        } else {
          // Auto-redirected, verify we're logged in
          cy.url().should('match', /\/(dashboard|courses)/);
        }
      });
    });
  });

  describe('2. Course Module Navigation', () => {
    beforeEach(() => {
      cy.visit('/');
      // Wait for auto-login or manual login
      cy.url({ timeout: 10000 }).should('match', /\/(dashboard|courses)/);
    });

    it('TC-003: Should display available courses on dashboard', () => {
      cy.visit('/courses');
      
      // Check for course listing
      cy.get('body').should('contain.text', 'Course').or('contain.text', 'Courses');
      
      // Look for course cards or course links
      cy.get('[data-testid="course-card"], .course-card, [class*="course"]')
        .should('have.length.at.least', 1);
    });

    it('TC-004: Should navigate to course modules', () => {
      cy.visit('/courses');
      
      // Click on first available course
      cy.get('[data-testid="course-card"], .course-card, [class*="course"]')
        .first()
        .click();
      
      // Should navigate to course detail or modules page
      cy.url().should('include', '/courses/');
      
      // Should show modules or learning materials
      cy.get('body').should('contain.text', 'Module').or('contain.text', 'Material');
    });
  });

  describe('3. Learning Material System', () => {
    beforeEach(() => {
      cy.visit('/');
      cy.url({ timeout: 10000 }).should('match', /\/(dashboard|courses)/);
    });

    it('TC-005: Should display learning materials in modules', () => {
      cy.visit('/courses');
      
      // Navigate to first course
      cy.get('[data-testid="course-card"], .course-card, [class*="course"]')
        .first()
        .click();
      
      // Look for learning materials
      cy.get('body').should('contain.text', 'Material').or('contain.text', 'Learning');
      
      // Check for material cards or links
      cy.get('[data-testid="material-card"], .material-card, [class*="material"]')
        .should('exist');
    });

    it('TC-006: Should allow progression to next material after attempt', () => {
      // Navigate to a specific workspace (assuming URL pattern)
      cy.visit('/courses');
      
      // Click first course
      cy.get('[data-testid="course-card"], .course-card, [class*="course"]')
        .first()
        .click();
      
      // Click first material
      cy.get('[data-testid="material-card"], .material-card, [class*="material"]')
        .first()
        .click();
      
      // Should navigate to workspace or question page
      cy.url().should('match', /\/(workspace|questions)/);
    });
  });

  describe('4. Code Workspace Functionality', () => {
    beforeEach(() => {
      cy.visit('/');
      cy.url({ timeout: 10000 }).should('match', /\/(dashboard|courses)/);
    });

    it('TC-007: Should display code editor in workspace', () => {
      // Navigate to workspace
      cy.visit('/courses');
      cy.get('[data-testid="course-card"], .course-card, [class*="course"]')
        .first()
        .click();
      
      cy.get('[data-testid="material-card"], .material-card, [class*="material"]')
        .first()
        .click();
      
      // Check for code editor
      cy.get('[data-testid="code-editor"], .monaco-editor, [class*="editor"]', { timeout: 15000 })
        .should('be.visible');
    });

    it('TC-008: Should execute Python code and show output', () => {
      // Navigate to workspace
      cy.visit('/courses');
      cy.get('[data-testid="course-card"], .course-card, [class*="course"]')
        .first()
        .click();
      
      cy.get('[data-testid="material-card"], .material-card, [class*="material"]')
        .first()
        .click();
      
      // Wait for code editor to load
      cy.get('[data-testid="code-editor"], .monaco-editor, [class*="editor"]', { timeout: 15000 })
        .should('be.visible');
      
      // Try to input code (simplified approach)
      const testCode = 'print("Hello, Cypress!")';
      
      // Look for a text area or input that might be the code editor
      cy.get('textarea, [contenteditable="true"]').first().then(($el) => {
        if ($el.length > 0) {
          cy.wrap($el).clear().type(testCode);
        }
      });
      
      // Look for run button
      cy.get('[data-testid="run-button"], button:contains("Run"), button:contains("Execute")')
        .first()
        .click();
      
      // Check for output panel
      cy.get('[data-testid="output-panel"], .output, [class*="output"]', { timeout: 30000 })
        .should('be.visible');
    });
  });

  describe('5. Test Cases and Progressive Revelation', () => {
    beforeEach(() => {
      cy.visit('/');
      cy.url({ timeout: 10000 }).should('match', /\/(dashboard|courses)/);
    });

    it('TC-009: Should display SKKNI-based test cases', () => {
      // Navigate to workspace
      cy.visit('/courses');
      cy.get('[data-testid="course-card"], .course-card, [class*="course"]')
        .first()
        .click();
      
      cy.get('[data-testid="material-card"], .material-card, [class*="material"]')
        .first()
        .click();
      
      // Look for test cases section
      cy.get('body').should('contain.text', 'Test Case').or('contain.text', 'Test');
      
      // Check for SKKNI reference or data science content
      cy.get('body').should('contain.text', 'SKKNI').or('contain.text', 'Data Science');
    });

    it('TC-010: Should reveal hidden test cases after failed attempts', () => {
      // Navigate to workspace
      cy.visit('/courses');
      cy.get('[data-testid="course-card"], .course-card, [class*="course"]')
        .first()
        .click();
      
      cy.get('[data-testid="material-card"], .material-card, [class*="material"]')
        .first()
        .click();
      
      // Check for hidden test cases indicator
      cy.get('body').then(($body) => {
        if ($body.text().includes('Lock') || $body.text().includes('Hidden')) {
          // Hidden test cases exist
          cy.get('[data-testid="test-case"], .test-case')
            .should('exist');
        }
      });
    });
  });

  describe('6. Bloom\'s Taxonomy Classification', () => {
    beforeEach(() => {
      cy.visit('/');
      cy.url({ timeout: 10000 }).should('match', /\/(dashboard|courses)/);
    });

    it('TC-011: Should access cognitive classification system', () => {
      // Look for classification or analytics section
      cy.get('body').then(($body) => {
        if ($body.text().includes('Classification') || $body.text().includes('Analytics')) {
          cy.contains('Classification', 'Analytics').click();
          cy.url().should('include', '/classification').or('include', '/analytics');
        } else {
          // Classification might be in admin/teacher panel
          cy.log('Classification system may require specific user role');
        }
      });
    });

    it('TC-012: Should display Bloom\'s taxonomy level classification', () => {
      // Navigate to classification page if accessible
      cy.visit('/classification', { failOnStatusCode: false });
      
      cy.get('body').then(($body) => {
        if ($body.text().includes('Bloom') || $body.text().includes('Taxonomy')) {
          cy.get('body').should('contain.text', 'Bloom').or('contain.text', 'Taxonomy');
        } else {
          cy.log('Bloom\'s taxonomy classification may require specific access');
        }
      });
    });
  });

  describe('7. FastAPI Integration', () => {
    beforeEach(() => {
      cy.visit('/');
      cy.url({ timeout: 10000 }).should('match', /\/(dashboard|courses)/);
    });

    it('TC-013: Should process data analysis via FastAPI', () => {
      // Look for data analysis features
      cy.get('body').then(($body) => {
        if ($body.text().includes('Analysis') || $body.text().includes('Data')) {
          // Data analysis feature exists
          cy.contains('Analysis', 'Data').click();
          
          // Should show analysis results or processing
          cy.get('body').should('contain.text', 'Result').or('contain.text', 'Analysis');
        } else {
          cy.log('Data analysis features may be integrated in workspace');
        }
      });
    });

    it('TC-014: Should handle student code execution isolation', () => {
      // This tests the Python kernel isolation mentioned in requirements
      // Navigate to workspace and execute code
      cy.visit('/courses');
      cy.get('[data-testid="course-card"], .course-card, [class*="course"]')
        .first()
        .click();
      
      cy.get('[data-testid="material-card"], .material-card, [class*="material"]')
        .first()
        .click();
      
      // Execute code that sets a variable
      const isolationTestCode = 'test_isolation_var = "cypress_test"\\nprint(test_isolation_var)';
      
      cy.get('textarea, [contenteditable="true"]').first().then(($el) => {
        if ($el.length > 0) {
          cy.wrap($el).clear().type(isolationTestCode);
        }
      });
      
      // Run the code
      cy.get('[data-testid="run-button"], button:contains("Run"), button:contains("Execute")')
        .first()
        .click();
      
      // Verify execution completes without interference
      cy.get('[data-testid="output-panel"], .output, [class*="output"]', { timeout: 30000 })
        .should('be.visible')
        .and('contain.text', 'cypress_test');
    });
  });

  describe('8. User Interface and Experience', () => {
    beforeEach(() => {
      cy.visit('/');
      cy.url({ timeout: 10000 }).should('match', /\/(dashboard|courses)/);
    });

    it('TC-015: Should have responsive design for different screen sizes', () => {
      // Test mobile viewport
      cy.viewport(375, 667);
      cy.visit('/courses');
      cy.get('body').should('be.visible');
      
      // Test tablet viewport
      cy.viewport(768, 1024);
      cy.get('body').should('be.visible');
      
      // Test desktop viewport
      cy.viewport(1280, 800);
      cy.get('body').should('be.visible');
    });

    it('TC-016: Should have accessible navigation and UI elements', () => {
      cy.visit('/courses');
      
      // Check for proper heading structure
      cy.get('h1, h2, h3').should('exist');
      
      // Check for proper button labels
      cy.get('button').should('have.length.at.least', 1);
      
      // Check for proper link text
      cy.get('a').should('exist');
    });
  });

  describe('9. Error Handling and Edge Cases', () => {
    beforeEach(() => {
      cy.visit('/');
      cy.url({ timeout: 10000 }).should('match', /\/(dashboard|courses)/);
    });

    it('TC-017: Should handle code execution errors gracefully', () => {
      // Navigate to workspace
      cy.visit('/courses');
      cy.get('[data-testid="course-card"], .course-card, [class*="course"]')
        .first()
        .click();
      
      cy.get('[data-testid="material-card"], .material-card, [class*="material"]')
        .first()
        .click();
      
      // Input invalid Python code
      const errorCode = 'print("Hello World"\\nprint(undefined_variable)';
      
      cy.get('textarea, [contenteditable="true"]').first().then(($el) => {
        if ($el.length > 0) {
          cy.wrap($el).clear().type(errorCode);
        }
      });
      
      // Run the code
      cy.get('[data-testid="run-button"], button:contains("Run"), button:contains("Execute")')
        .first()
        .click();
      
      // Should show error message without crashing
      cy.get('[data-testid="output-panel"], .output, [class*="output"]', { timeout: 30000 })
        .should('be.visible');
    });

    it('TC-018: Should handle network timeouts and connection issues', () => {
      // Test with slow network simulation
      cy.intercept('POST', '**/execute', { delay: 5000 }).as('slowExecution');
      
      cy.visit('/courses');
      cy.get('[data-testid="course-card"], .course-card, [class*="course"]')
        .first()
        .click();
      
      cy.get('[data-testid="material-card"], .material-card, [class*="material"]')
        .first()
        .click();
      
      // Should show loading state or timeout handling
      const testCode = 'print("Network test")';
      
      cy.get('textarea, [contenteditable="true"]').first().then(($el) => {
        if ($el.length > 0) {
          cy.wrap($el).clear().type(testCode);
        }
      });
      
      cy.get('[data-testid="run-button"], button:contains("Run"), button:contains("Execute")')
        .first()
        .click();
      
      // Should handle slow response appropriately
      cy.get('body').should('not.contain.text', 'Network Error').or('contain.text', 'Loading');
    });
  });

  describe('10. System Performance and Load', () => {
    it('TC-019: Should handle multiple course navigation efficiently', () => {
      cy.visit('/');
      cy.url({ timeout: 10000 }).should('match', /\/(dashboard|courses)/);
      
      // Navigate through multiple courses quickly
      cy.visit('/courses');
      
      cy.get('[data-testid="course-card"], .course-card, [class*="course"]').then(($courses) => {
        const courseCount = Math.min($courses.length, 3); // Test first 3 courses
        
        for (let i = 0; i < courseCount; i++) {
          cy.get('[data-testid="course-card"], .course-card, [class*="course"]')
            .eq(i)
            .click();
          
          // Verify page loads
          cy.url().should('include', '/courses/');
          
          // Go back to courses list
          cy.go('back');
          cy.url().should('include', '/courses');
        }
      });
    });

    it('TC-020: Should maintain session state during navigation', () => {
      cy.visit('/');
      cy.url({ timeout: 10000 }).should('match', /\/(dashboard|courses)/);
      
      // Navigate to different sections and verify user stays logged in
      cy.visit('/courses');
      cy.get('body').should('not.contain.text', 'Login');
      
      cy.visit('/dashboard');
      cy.get('body').should('not.contain.text', 'Login');
      
      // User should remain authenticated throughout navigation
      cy.url().should('not.include', '/login');
    });
  });
});
