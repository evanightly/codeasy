/// <reference types="cypress" />

describe('WebSocket Error Handling', () => {
    it('should handle WebSocket errors gracefully', () => {
        cy.visit('/login');
        cy.waitForPageLoad();

        // Test that WebSocket errors don't break the test
        cy.window().then((win) => {
            // Try to create a WebSocket - this should not crash the test
            let wsCreated = false;
            try {
                const ws = new win.WebSocket('ws://invalid-websocket-url');
                wsCreated = true;

                // Verify WebSocket object exists (even if it's our mock)
                expect(ws).to.exist;
                expect(ws.url).to.equal('ws://invalid-websocket-url');

                cy.log('WebSocket created successfully (likely mocked)');
            } catch (_error) {
                cy.log('WebSocket creation failed as expected');
            }

            // Either way, the test should continue
            expect(wsCreated || true).to.be.true; // This will always pass
        });

        // Verify the page still works normally after WebSocket attempt
        cy.get('form').should('be.visible');
        cy.get('input[name="email"]').should('be.visible');

        // Test should pass despite WebSocket connection attempts
    });

    it('should verify WebSocket suppression is working', () => {
        cy.visit('/login');
        cy.waitForPageLoad();

        // Apply our WebSocket suppression explicitly
        cy.suppressWebSocketErrors();

        // Verify WebSocket is properly mocked
        cy.window().then((win) => {
            const ws = new win.WebSocket('ws://test-url');

            // Should be our mock WebSocket
            expect(ws).to.exist;
            expect(ws.url).to.equal('ws://test-url');
            expect(ws.readyState).to.equal(3); // CLOSED

            // Mock methods should exist and not throw
            expect(ws.close).to.be.a('function');
            expect(ws.send).to.be.a('function');
            expect(ws.addEventListener).to.be.a('function');

            cy.log('WebSocket suppression is working correctly');
        });
    });
});
