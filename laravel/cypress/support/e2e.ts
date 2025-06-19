// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.ts using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Add global configuration
Cypress.config('defaultCommandTimeout', 10000);
Cypress.config('requestTimeout', 10000);
Cypress.config('responseTimeout', 10000);
Cypress.config('pageLoadTimeout', 30000);

// Handle uncaught exceptions
Cypress.on('uncaught:exception', (err, runnable) => {
  // Returning false here prevents Cypress from failing the test
  console.log('Uncaught exception:', err.message);
  return false;
});

// Add custom viewport sizes
Cypress.Commands.add('setMobileViewport', () => {
  cy.viewport(375, 667); // iPhone 6/7/8 size
});

Cypress.Commands.add('setTabletViewport', () => {
  cy.viewport(768, 1024); // iPad size
});

Cypress.Commands.add('setDesktopViewport', () => {
  cy.viewport(1280, 800); // Default desktop size
});
