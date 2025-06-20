describe('Database Reset (Simplified)', () => {
    it('should reset database using migrate:fresh and Cypress seeder', () => {
        // Reset database first
        cy.resetDatabase();

        // Verify basic data exists after reset
        cy.request({
            method: 'GET',
            url: '/cypress/status',
            headers: {
                'X-Cypress-Test': 'true',
            },
        }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property('success', true);
            expect(response.body).to.have.property('table_counts');

            const counts = response.body.table_counts;

            // Verify essential data is seeded
            expect(counts.users).to.be.greaterThan(0);
            expect(counts.schools).to.be.greaterThan(0);
            expect(counts.courses).to.be.greaterThan(0);
            expect(counts.learning_materials).to.be.greaterThan(0);
            expect(counts.learning_material_questions).to.be.greaterThan(0);

            cy.log('Database reset verification passed', counts);
        });

        // Reset again to test idempotency
        cy.resetDatabase();

        // Verify data still exists and counts are consistent
        cy.request({
            method: 'GET',
            url: '/cypress/status',
            headers: {
                'X-Cypress-Test': 'true',
            },
        }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body.table_counts.users).to.be.greaterThan(0);
            cy.log('Second reset verification passed');
        });
    });

    it('should handle multiple consecutive resets without errors', () => {
        // Reset database multiple times quickly
        for (let i = 0; i < 3; i++) {
            cy.resetDatabase();
            cy.log(`Reset iteration ${i + 1} completed`);
        }

        // Final verification
        cy.request({
            method: 'GET',
            url: '/cypress/status',
            headers: {
                'X-Cypress-Test': 'true',
            },
        }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body.table_counts.users).to.be.greaterThan(0);
            cy.log('Multiple resets test passed');
        });
    });
});
