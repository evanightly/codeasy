/// <reference types="cypress" />

describe('Welcome Page', () => {
    describe('Does Welcome Page Exist?', () => {
        it('Should display the hero text', () => {
            cy.visit('/');

            // Should not show login form
            cy.get('body').should('contain', 'Powered by Machine Learning');
        });
    });
});
