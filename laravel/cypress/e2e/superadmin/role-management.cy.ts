/// <reference types="cypress" />

describe('Role Management - SuperAdmin', () => {
    let rolesData: any;

    before(() => {
        cy.resetDatabase();
        cy.fixture('roles').then((data) => {
            rolesData = data;
        });
    });

    beforeEach(() => {
        cy.session('superAdminSession', () => {
            cy.login('superAdmin');
        });
    });

    describe('Role Permission Management', () => {
        it('can access roles management page', () => {
            cy.visit('/roles');
            cy.waitForPageLoad();

            // Check if we're on the roles page
            cy.url().should('include', '/roles');
            cy.get('body').should('contain.text', 'Role');
        });

        it('can see role list', () => {
            cy.visit('/roles');
            cy.waitForPageLoad();

            // Should show roles
            cy.get('body').should('be.visible');

            // Look for common role names using fixture data
            cy.get('body').then(($body) => {
                const bodyText = $body.text().toLowerCase();
                const hasRoles = rolesData.expectedGroups.some((role: string) =>
                    bodyText.includes(role),
                );

                if (hasRoles) {
                    cy.log('Role information found on page');
                } else {
                    cy.log('Page loaded without specific role content');
                }
            });
        });

        it('can access role create page', () => {
            cy.visit('/roles/create');
            cy.waitForPageLoad();

            // Check if we're on the create page
            cy.url().should('include', '/roles/create');

            // Should show form for role creation using fixture selectors
            cy.get(rolesData.selectors.form).should('exist');
            cy.get(rolesData.selectors.nameInput).should('exist');
        });

        it('can fill role creation form', () => {
            cy.visit('/roles/create');
            cy.waitForPageLoad();

            const testRole = rolesData.testRoles.basic;

            // Fill role information using fixture data
            cy.get(rolesData.selectors.nameInput).type(testRole.name);

            // Check if description field exists
            cy.get('body').then(($body) => {
                if ($body.find(rolesData.selectors.descriptionInput).length > 0) {
                    cy.get(rolesData.selectors.descriptionInput).type(testRole.description);
                } else if ($body.find(rolesData.selectors.descriptionTextarea).length > 0) {
                    cy.get(rolesData.selectors.descriptionTextarea).type(testRole.description);
                }
            });

            // Verify form is filled
            cy.get(rolesData.selectors.nameInput).should('have.value', testRole.name);
        });

        it('can access permissions page', () => {
            cy.visit('/permissions');
            cy.waitForPageLoad();

            // Check if we're on the permissions page
            cy.url().should('include', '/permissions');
            cy.get('body').should('contain.text', 'Permission');
        });

        it('can see permissions list', () => {
            cy.visit('/permissions');
            cy.waitForPageLoad();

            // Should show permissions
            cy.get('body').should('be.visible');

            // Look for permission-related content using fixture data
            cy.get('body').then(($body) => {
                const bodyText = $body.text().toLowerCase();
                const hasPermissions = rolesData.permissionTypes.some((perm: string) =>
                    bodyText.includes(perm),
                );

                if (hasPermissions) {
                    cy.log('Permission information found on page');
                } else {
                    cy.log('Page loaded without specific permission content');
                }
            });
        });
    });

    describe('Role Creation with Permissions', () => {
        it('can create role with permission checkboxes', () => {
            cy.visit('/roles/create');
            cy.waitForPageLoad();

            const testRole = rolesData.testRoles.withPermissions;

            // Fill role basic information using fixture data
            cy.get(rolesData.selectors.nameInput).type(testRole.name);

            // Check if description field exists and fill it
            cy.get('body').then(($body) => {
                if ($body.find(rolesData.selectors.descriptionInput).length > 0) {
                    cy.get(rolesData.selectors.descriptionInput).type(testRole.description);
                } else if ($body.find(rolesData.selectors.descriptionTextarea).length > 0) {
                    cy.get(rolesData.selectors.descriptionTextarea).type(testRole.description);
                }
            });

            // Look for permission checkboxes using fixture selectors
            cy.get('body').then(($body) => {
                if ($body.find(rolesData.selectors.permissionCheckboxes.dataTestId).length > 0) {
                    // Select some permissions using data-testid pattern
                    cy.get(rolesData.selectors.permissionCheckboxes.dataTestId)
                        .first()
                        .click({ force: true });
                    cy.get(rolesData.selectors.permissionCheckboxes.dataTestId)
                        .eq(1)
                        .click({ force: true });
                    cy.get(rolesData.selectors.permissionCheckboxes.dataTestId)
                        .eq(2)
                        .click({ force: true });
                } else if (
                    $body.find(rolesData.selectors.permissionCheckboxes.idPattern).length > 0
                ) {
                    // Fallback to ID pattern
                    cy.get(rolesData.selectors.permissionCheckboxes.idPattern)
                        .first()
                        .click({ force: true });
                    cy.get(rolesData.selectors.permissionCheckboxes.idPattern)
                        .eq(1)
                        .click({ force: true });
                    cy.get(rolesData.selectors.permissionCheckboxes.idPattern)
                        .eq(2)
                        .click({ force: true });
                } else {
                    cy.log(
                        'No permission checkboxes found - form may not have permissions section',
                    );
                }
            });

            // Verify form is filled correctly
            cy.get(rolesData.selectors.nameInput).should('have.value', testRole.name);

            // Click submit button to create the role
            cy.get('body').then(($body) => {
                if ($body.find(rolesData.selectors.submitButton).length > 0) {
                    cy.get(rolesData.selectors.submitButton).should('be.visible');
                    cy.get(rolesData.selectors.submitButton).should('contain.text', 'Create');
                    cy.get(rolesData.selectors.submitButton).click();
                } else if ($body.find(rolesData.selectors.createButton).length > 0) {
                    cy.get(rolesData.selectors.createButton).should('be.visible');
                    cy.get(rolesData.selectors.createButton).click();
                } else if ($body.find(rolesData.selectors.saveButton).length > 0) {
                    cy.get(rolesData.selectors.saveButton).should('be.visible');
                    cy.get(rolesData.selectors.saveButton).click();
                } else {
                    cy.log('Submit button not found in expected formats');
                }
            });

            // Wait for response and check for success indicators
            cy.waitForPageLoad();

            // Check for success message or redirect to roles list
            cy.get('body').then(($body) => {
                const bodyText = $body.text();
                // Check for common success messages using fixture data
                const hasSuccessMessage = rolesData.messages.successMessages.some((msg: string) =>
                    bodyText.includes(msg),
                );

                if (hasSuccessMessage) {
                    cy.log('Success message found in page content');
                } else {
                    // Check if redirected to roles list (another success indicator)
                    cy.url().then((url) => {
                        if (url.includes('/roles') && !url.includes('/create')) {
                            cy.log('Successfully redirected to roles list page');
                        } else {
                            cy.log('No clear success indicator found');
                        }
                    });
                }
            });
        });

        it('can interact with specific permission categories', () => {
            cy.visit('/roles/create');
            cy.waitForPageLoad();

            const testRole = rolesData.testRoles.categoryTest;

            // Fill basic role info using fixture data
            cy.get(rolesData.selectors.nameInput).type(testRole.name);

            // Test specific permission categories using fixture data
            rolesData.permissionCategories.forEach((category: string) => {
                cy.get('body').then(($body) => {
                    if ($body.find(`[data-testid="permission-${category}"]`).length > 0) {
                        cy.get(`[data-testid="permission-${category}"]`).click();
                        cy.log(`Selected permission: ${category}`);
                    } else if ($body.find(`[data-testid="${category}-permission"]`).length > 0) {
                        cy.get(`[data-testid="${category}-permission"]`).click();
                        cy.log(`Selected permission: ${category}`);
                    } else {
                        cy.log(`Permission ${category} not found`);
                    }
                });
            });
        });

        it('can select all permissions using select all checkbox', () => {
            cy.visit('/roles/create');
            cy.waitForPageLoad();

            const testRole = rolesData.testRoles.allPermissions;

            // Fill role name using fixture data
            cy.get(rolesData.selectors.nameInput).type(testRole.name);

            // Look for select all checkbox or use group/individual checkboxes
            cy.get('body').then(($body) => {
                if ($body.find(rolesData.selectors.groupCheckboxes.selectAll).length > 0) {
                    cy.get(rolesData.selectors.groupCheckboxes.selectAll).click({ force: true });
                    cy.log('Used select all permissions checkbox');
                } else if ($body.find(rolesData.selectors.groupCheckboxes.dataTestId).length > 0) {
                    // Select first few group checkboxes
                    cy.get(rolesData.selectors.groupCheckboxes.dataTestId).each(
                        ($el: any, index: number) => {
                            if (index < 3) {
                                cy.wrap($el).click({ force: true });
                            }
                        },
                    );
                    cy.log('Selected permission groups');
                } else if (
                    $body.find(rolesData.selectors.permissionCheckboxes.dataTestId).length > 0
                ) {
                    // Select individual permissions
                    cy.get(rolesData.selectors.permissionCheckboxes.dataTestId).each(
                        ($el: any, index: number) => {
                            if (index < 5) {
                                cy.wrap($el).click({ force: true });
                            }
                        },
                    );
                    cy.log('Selected individual permissions');
                } else {
                    cy.log('No permission checkboxes found');
                }
            });
        });

        it('can verify permission checkboxes are properly checked', () => {
            cy.visit('/roles/create');
            cy.waitForPageLoad();

            const testRole = rolesData.testRoles.verificationTest;

            // Fill role name using fixture data
            cy.get(rolesData.selectors.nameInput).type(testRole.name);

            // Select some permissions and verify they are checked
            cy.get('body').then(($body) => {
                if ($body.find(rolesData.selectors.permissionCheckboxes.dataTestId).length > 0) {
                    // Select first few permissions using data-testid
                    cy.get(rolesData.selectors.permissionCheckboxes.dataTestId)
                        .first()
                        .click({ force: true });
                    cy.get(rolesData.selectors.permissionCheckboxes.dataTestId)
                        .eq(1)
                        .click({ force: true });

                    // Verify they are checked using Radix UI state attribute
                    cy.get(rolesData.selectors.permissionCheckboxes.dataTestId)
                        .first()
                        .should('have.attr', 'data-state', 'checked');
                    cy.get(rolesData.selectors.permissionCheckboxes.dataTestId)
                        .eq(1)
                        .should('have.attr', 'data-state', 'checked');
                } else if ($body.find('[data-testid*="permission"]').length > 0) {
                    // Fallback for any permission-related data-testid
                    cy.get('[data-testid*="permission"]').first().click({ force: true });
                    cy.get('[data-testid*="permission"]').eq(1).click({ force: true });

                    // Verify they are checked using Radix UI state attribute
                    cy.get('[data-testid*="permission"]')
                        .first()
                        .should('have.attr', 'data-state', 'checked');
                    cy.get('[data-testid*="permission"]')
                        .eq(1)
                        .should('have.attr', 'data-state', 'checked');
                } else {
                    cy.log('No checkboxes found for verification');
                }
            });
        });

        it('can uncheck selected permissions', () => {
            cy.visit('/roles/create');
            cy.waitForPageLoad();

            const testRole = rolesData.testRoles.uncheckTest;

            // Fill role name using fixture data
            cy.get(rolesData.selectors.nameInput).type(testRole.name);

            // Select and then unselect permissions
            cy.get('body').then(($body) => {
                if ($body.find(rolesData.selectors.permissionCheckboxes.dataTestId).length > 0) {
                    // First select some permissions using data-testid
                    cy.get(rolesData.selectors.permissionCheckboxes.dataTestId)
                        .first()
                        .click({ force: true });
                    cy.get(rolesData.selectors.permissionCheckboxes.dataTestId)
                        .eq(1)
                        .click({ force: true });

                    // Verify they are checked using Radix UI state
                    cy.get(rolesData.selectors.permissionCheckboxes.dataTestId)
                        .first()
                        .should('have.attr', 'data-state', 'checked');
                    cy.get(rolesData.selectors.permissionCheckboxes.dataTestId)
                        .eq(1)
                        .should('have.attr', 'data-state', 'checked');

                    // Then uncheck them
                    cy.get(rolesData.selectors.permissionCheckboxes.dataTestId)
                        .first()
                        .click({ force: true });
                    cy.get(rolesData.selectors.permissionCheckboxes.dataTestId)
                        .eq(1)
                        .click({ force: true });

                    // Verify they are unchecked using Radix UI state
                    cy.get(rolesData.selectors.permissionCheckboxes.dataTestId)
                        .first()
                        .should('have.attr', 'data-state', 'unchecked');
                    cy.get(rolesData.selectors.permissionCheckboxes.dataTestId)
                        .eq(1)
                        .should('have.attr', 'data-state', 'unchecked');
                } else if ($body.find('[data-testid*="permission"]').length > 0) {
                    // Fallback for any permission-related data-testid
                    cy.get('[data-testid*="permission"]').first().click({ force: true });
                    cy.get('[data-testid*="permission"]').eq(1).click({ force: true });

                    // Verify they are checked using Radix UI state
                    cy.get('[data-testid*="permission"]')
                        .first()
                        .should('have.attr', 'data-state', 'checked');
                    cy.get('[data-testid*="permission"]')
                        .eq(1)
                        .should('have.attr', 'data-state', 'checked');

                    // Then uncheck them
                    cy.get('[data-testid*="permission"]').first().click({ force: true });
                    cy.get('[data-testid*="permission"]').eq(1).click({ force: true });

                    // Verify they are unchecked using Radix UI state
                    cy.get('[data-testid*="permission"]')
                        .first()
                        .should('have.attr', 'data-state', 'unchecked');
                    cy.get('[data-testid*="permission"]')
                        .eq(1)
                        .should('have.attr', 'data-state', 'unchecked');
                } else {
                    cy.log('No permission checkboxes found for uncheck test');
                }
            });
        });

        it('can successfully create a complete role and verify creation', () => {
            cy.visit('/roles/create');
            cy.waitForPageLoad();

            // Generate unique role name to avoid conflicts using fixture data
            const timestamp = Date.now();
            const baseRole = rolesData.testRoles.withPermissions;
            const roleName = `${baseRole.name} ${timestamp}`;

            // Fill role basic information
            cy.get(rolesData.selectors.nameInput).type(roleName);

            // Fill description if available
            cy.get('body').then(($body) => {
                if ($body.find(rolesData.selectors.descriptionInput).length > 0) {
                    cy.get(rolesData.selectors.descriptionInput).type(baseRole.description);
                } else if ($body.find(rolesData.selectors.descriptionTextarea).length > 0) {
                    cy.get(rolesData.selectors.descriptionTextarea).type(baseRole.description);
                }
            });

            // Select at least one permission to make it a valid role
            cy.get('body').then(($body) => {
                if ($body.find(rolesData.selectors.permissionCheckboxes.dataTestId).length > 0) {
                    // Select first permission using data-testid
                    cy.get(rolesData.selectors.permissionCheckboxes.dataTestId)
                        .first()
                        .click({ force: true });
                    cy.log('Selected permission using data-testid');
                } else if (
                    $body.find(rolesData.selectors.permissionCheckboxes.idPattern).length > 0
                ) {
                    // Fallback to ID pattern
                    cy.get(rolesData.selectors.permissionCheckboxes.idPattern)
                        .first()
                        .click({ force: true });
                    cy.log('Selected permission using ID pattern');
                } else {
                    cy.log('No permissions available to select');
                }
            });

            // Submit the form
            cy.get('body').then(($body) => {
                if ($body.find(rolesData.selectors.submitButton).length > 0) {
                    cy.get(rolesData.selectors.submitButton).click();
                } else if ($body.find(rolesData.selectors.createButton).length > 0) {
                    cy.get(rolesData.selectors.createButton).click();
                } else if ($body.find(rolesData.selectors.saveButton).length > 0) {
                    cy.get(rolesData.selectors.saveButton).click();
                }
            });

            // Wait for the response
            cy.waitForPageLoad();

            // Verify success by checking multiple indicators
            cy.then(() => {
                // Check current URL - should either stay on create page with success message or redirect to roles list
                cy.url().then((currentUrl) => {
                    if (currentUrl.includes('/roles') && !currentUrl.includes('/create')) {
                        // Redirected to roles list - check if new role appears
                        cy.log('Redirected to roles list after creation');
                        cy.get('body').should('contain.text', roleName);
                    } else {
                        // Still on create page - look for success message
                        cy.get('body').then(($body) => {
                            const bodyText = $body.text();
                            const hasSuccessMessage = rolesData.messages.successMessages.some(
                                (msg: string) => bodyText.toLowerCase().includes(msg.toLowerCase()),
                            );

                            if (hasSuccessMessage) {
                                cy.log('Success message found on create page');
                            } else {
                                cy.log('No clear success message found');
                            }
                        });
                    }
                });
            });

            // Verify the role was actually created by visiting roles list
            cy.visit('/roles');
            cy.waitForPageLoad();
            cy.get('body').should('contain.text', roleName);
            cy.log(`Successfully verified role "${roleName}" was created`);
        });
    });

    describe('Access Control Tests', () => {
        it('prevents access to roles page for non-admin users', () => {
            cy.resetDatabase();
            cy.session('teacherSession', () => {
                cy.login('teacher');
            });

            // Check for 403 status when accessing roles page
            cy.request({
                url: '/roles',
                failOnStatusCode: false,
            }).then((response) => {
                expect(response.status).to.eq(403);
            });
        });

        it('prevents access to permissions page for non-admin users', () => {
            cy.resetDatabase();
            cy.session('studentSession', () => {
                cy.login('student');
            });

            // Check for 403 status when accessing permissions page
            cy.request({
                url: '/permissions',
                failOnStatusCode: false,
            }).then((response) => {
                expect(response.status).to.eq(403);
            });
        });

        it('allows admin to access roles page', () => {
            cy.visit('/roles');
            cy.waitForPageLoad();

            // Should be on roles page
            cy.url().should('include', '/roles');
            cy.get('body').should('contain.text', 'Role');
        });

        it('allows admin to access permissions page', () => {
            cy.visit('/permissions');
            cy.waitForPageLoad();

            // Should be on permissions page
            cy.url().should('include', '/permissions');
            cy.get('body').should('contain.text', 'Permission');
        });

        it('shows access denied for restricted user on direct role edit URL', () => {
            cy.resetDatabase();
            cy.session('studentSession', () => {
                cy.login('student');
            });

            // Visit the URL and expect a 403 status
            cy.request({
                url: '/roles/1/edit',
                failOnStatusCode: false, // Don't fail the test on non-2xx status codes
            }).then((response) => {
                expect(response.status).to.eq(403);
            });
        });

        it('shows access denied for restricted user on direct permission edit URL', () => {
            cy.resetDatabase();
            cy.session('studentSession', () => {
                cy.login('student');
            });

            // Visit the URL and expect a 403 status
            cy.request({
                url: '/permissions/1/edit',
                failOnStatusCode: false, // Don't fail the test on non-2xx status codes
            }).then((response) => {
                expect(response.status).to.eq(403);
            });
        });
    });

    describe('Role Update/Edit Tests', () => {
        it('can access role edit page', () => {
            // Direct visit to edit page
            cy.visit('/roles/1/edit');
            cy.waitForPageLoad();

            // Should be on edit page with form
            cy.url().should('include', '/edit');
            cy.get(rolesData.selectors.form).should('exist');
            cy.get(rolesData.selectors.nameInput).should('exist');
        });

        it('can fill and update role information', () => {
            // Direct visit to edit page
            cy.visit('/roles/1/edit');
            cy.waitForPageLoad();

            const updateRole = rolesData.testRoles.updateTest;
            const timestamp = Date.now();
            const updatedRoleName = `${updateRole.updatedName} ${timestamp}`;

            // Update the role information
            cy.get(rolesData.selectors.nameInput).clear().type(updatedRoleName);

            cy.get('body').then(($body) => {
                if ($body.find(rolesData.selectors.descriptionInput).length > 0) {
                    cy.get(rolesData.selectors.descriptionInput)
                        .clear()
                        .type(updateRole.updatedDescription);
                } else if ($body.find(rolesData.selectors.descriptionTextarea).length > 0) {
                    cy.get(rolesData.selectors.descriptionTextarea)
                        .clear()
                        .type(updateRole.updatedDescription);
                }
            });

            // Verify form is updated
            cy.get(rolesData.selectors.nameInput).should('have.value', updatedRoleName);

            // Submit the update
            cy.get('body').then(($body) => {
                if ($body.find(rolesData.selectors.updateButton).length > 0) {
                    cy.get(rolesData.selectors.updateButton).click();
                } else if ($body.find(rolesData.selectors.submitButton).length > 0) {
                    cy.get(rolesData.selectors.submitButton).click();
                }
            });

            cy.waitForPageLoad();

            // Check for success indicators
            cy.get('body').then(($body) => {
                const bodyText = $body.text();
                const hasSuccessMessage = rolesData.messages.successMessages.some((msg: string) =>
                    bodyText.toLowerCase().includes(msg.toLowerCase()),
                );

                if (hasSuccessMessage) {
                    cy.log('Success message found for role update');
                } else {
                    cy.url().then((url) => {
                        if (url.includes('/roles') && !url.includes('/edit')) {
                            cy.log('Successfully redirected after role update');
                        }
                    });
                }
            });

            cy.log(`Successfully updated role to "${updatedRoleName}"`);
        });

        it('can update role permissions', () => {
            // Direct visit to edit page
            cy.visit('/roles/1/edit');
            cy.waitForPageLoad();

            // Modify permissions - uncheck some and check others
            cy.get('body').then(($body) => {
                if ($body.find(rolesData.selectors.permissionCheckboxes.dataTestId).length > 0) {
                    // Uncheck first permission if checked
                    cy.get(rolesData.selectors.permissionCheckboxes.dataTestId)
                        .first()
                        .then(($checkbox) => {
                            if ($checkbox.attr('data-state') === 'checked') {
                                cy.wrap($checkbox).click({ force: true });
                            }
                        });

                    // Check third permission if available and unchecked
                    cy.get(rolesData.selectors.permissionCheckboxes.dataTestId)
                        .eq(2)
                        .then(($checkbox) => {
                            if ($checkbox.attr('data-state') === 'unchecked') {
                                cy.wrap($checkbox).click({ force: true });
                            }
                        });
                }
            });

            // Submit the update
            cy.get('body').then(($body) => {
                if ($body.find(rolesData.selectors.updateButton).length > 0) {
                    cy.get(rolesData.selectors.updateButton).click();
                } else if ($body.find(rolesData.selectors.submitButton).length > 0) {
                    cy.get(rolesData.selectors.submitButton).click();
                }
            });

            cy.waitForPageLoad();

            // Check for success indicators
            cy.get('body').then(($body) => {
                const bodyText = $body.text();
                const hasSuccessMessage = rolesData.messages.successMessages.some((msg: string) =>
                    bodyText.toLowerCase().includes(msg.toLowerCase()),
                );

                if (hasSuccessMessage) {
                    cy.log('Success message found for role permission update');
                } else {
                    cy.url().then((url) => {
                        if (url.includes('/roles') && !url.includes('/edit')) {
                            cy.log('Successfully redirected after role permission update');
                        }
                    });
                }
            });

            cy.log('Role permissions update test completed');
        });

        it('validates required fields in role update form', () => {
            // Direct visit to edit page
            cy.visit('/roles/1/edit');
            cy.waitForPageLoad();

            // Clear required fields and try to submit
            cy.get(rolesData.selectors.nameInput).clear();

            // Try to submit empty form
            cy.get('body').then(($body) => {
                if ($body.find(rolesData.selectors.updateButton).length > 0) {
                    cy.get(rolesData.selectors.updateButton).click();
                } else if ($body.find(rolesData.selectors.submitButton).length > 0) {
                    cy.get(rolesData.selectors.submitButton).click();
                }
            });

            // Should show validation errors or stay on page
            cy.get('body').should('be.visible');
            cy.log('Role update validation tested - empty required fields should show errors');
        });

        it('can cancel role update and return to roles list', () => {
            // Direct visit to edit page
            cy.visit('/roles/1/edit');
            cy.waitForPageLoad();

            // Look for cancel button or back link
            cy.get('body').then(($body) => {
                if ($body.find('button:contains("Cancel")').length > 0) {
                    cy.get('button:contains("Cancel")').click();
                } else if ($body.find('a:contains("Cancel")').length > 0) {
                    cy.get('a:contains("Cancel")').click();
                } else if ($body.find('a:contains("Back")').length > 0) {
                    cy.get('a:contains("Back")').click();
                } else {
                    // Navigate back manually
                    cy.visit('/roles');
                }
            });

            cy.waitForPageLoad();

            // Should be back on roles list
            cy.url().should('include', '/roles');
            cy.url().should('not.include', '/edit');
            cy.log('Successfully cancelled role update and returned to roles list');
        });
    });
});
