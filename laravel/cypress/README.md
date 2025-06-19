# Cypress E2E Testing Guide for Codeasy

This guide provides comprehensive instructions for running and maintaining E2E tests for the Codeasy autograding application.

## Quick Start

### 1. Start the Cypress E2E Container

```bash
# Start the entire development environment including Cypress
./dc.sh up --build

# Or start only Cypress E2E
./dc.sh up --build cypress-e2e
```

### 2. Access Cypress Interface

#### Option A: VNC Desktop (Recommended for Interactive Testing)
1. Open VNC client (RealVNC, TightVNC, or built-in VNC viewer)
2. Connect to `localhost:5900`
3. Password: `secret`
4. Cypress GUI will open automatically

#### Option B: Web VNC (Browser-based)
1. Open browser and go to `http://localhost:6080`
2. Click "Connect" 
3. Interact with Cypress through web interface

### 3. Run Tests

#### Interactive Mode (with VNC)
```bash
./dc.sh exec cypress-e2e cypress open
```

#### Headless Mode (Chrome)
```bash
./dc.sh exec cypress-e2e cypress run
```

#### Headless Mode (Firefox)
```bash
./dc.sh exec cypress-e2e cypress run --browser firefox
```

#### Specific Test File
```bash
./dc.sh exec cypress-e2e cypress run --spec "cypress/e2e/auth.cy.ts"
```

## Test Structure

### Test Files
- `cypress/e2e/feature_test_cases.cy.ts` - Comprehensive feature tests
- `cypress/e2e/auth.cy.ts` - Authentication and session tests
- `cypress/e2e/workspace.cy.ts` - Code workspace functionality tests
- `cypress/e2e/progressive_revelation.cy.ts` - Progressive revelation and classification tests

### Test Categories

#### 1. Authentication (TC-001 to TC-003)
- Auto-login functionality
- First-time user login
- Session persistence

#### 2. Course Navigation (TC-004 to TC-006)
- Course listing
- Module access
- Progression rules

#### 3. Learning Materials (TC-007 to TC-009)
- Material display
- Attempt tracking
- File support

#### 4. Code Workspace (TC-010 to TC-013)
- Editor functionality
- Code execution
- Student isolation
- Code persistence

#### 5. Test Cases & Progressive Revelation (TC-014 to TC-017)
- SKKNI test display
- Hidden test cases
- Progressive revelation
- Test execution

#### 6. Bloom's Taxonomy (TC-018 to TC-020)
- Classification access
- Rule-based classification
- Data export

#### 7. FastAPI Integration (TC-021 to TC-024)
- Code execution API
- Data analysis
- Image processing
- Error handling

#### 8. UI/UX (TC-025 to TC-028)
- Responsive design
- Navigation consistency
- Loading states
- Accessibility

#### 9. Performance (TC-029 to TC-032)
- Concurrent users
- Execution performance
- Page load times
- Database performance

#### 10. Error Handling (TC-033 to TC-036)
- Invalid code
- Network timeouts
- File uploads
- Browser compatibility

## Configuration

### Environment Variables
```env
CYPRESS_baseUrl=http://laravel:9001
DISPLAY=:99
CYPRESS_CACHE_FOLDER=/root/.cache/Cypress
```

### Test Data
Test data is stored in `cypress/fixtures/test_data.json` including:
- User credentials
- Course information
- Code samples
- CSS selectors
- Timeout values

### Custom Commands
Available custom commands in `cypress/support/commands.ts`:
- `cy.login()` - Handles auto or manual login
- `cy.waitForPageLoad()` - Waits for complete page load
- `cy.elementExists(selector)` - Checks element existence
- `cy.executeCodeInWorkspace(code)` - Executes code in workspace
- `cy.navigateToModule(id)` - Navigates to specific module
- `cy.setMobileViewport()` - Sets mobile viewport
- `cy.setTabletViewport()` - Sets tablet viewport  
- `cy.setDesktopViewport()` - Sets desktop viewport

## Debugging

### View Test Execution
1. Connect via VNC to `localhost:5900` (password: `secret`)
2. Watch tests execute in real-time
3. Interact with Cypress GUI for debugging

### Screenshots and Videos
- Screenshots: `cypress/screenshots/`
- Videos: `cypress/videos/` (if enabled)
- Logs: Available in container logs

### Common Issues

#### Laravel Not Responding
```bash
# Check Laravel container status
./dc.sh ps laravel

# Check Laravel logs
./dc.sh logs laravel

# Restart Laravel container
./dc.sh restart laravel
```

#### VNC Connection Issues
```bash
# Check if VNC server is running
./dc.sh exec cypress-e2e ps aux | grep x11vnc

# Restart Cypress container
./dc.sh restart cypress-e2e
```

#### Test Failures
1. Check application logs: `./dc.sh logs laravel`
2. Check FastAPI logs: `./dc.sh logs fastapi`
3. Review Cypress screenshots in `cypress/screenshots/`
4. Use VNC to debug interactively

## Test Data Setup

### Prerequisites
Ensure the following test data exists in your Laravel application:
1. At least one user account
2. Sample courses with modules
3. Learning materials with questions
4. Test cases for questions

### Database Seeding
```bash
# Run database seeders
./dc.sh exec laravel php artisan db:seed

# Or run specific seeders
./dc.sh exec laravel php artisan db:seed --class=CourseSeeder
./dc.sh exec laravel php artisan db:seed --class=LearningMaterialSeeder
```

## Continuous Integration

### GitHub Actions Example
```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  cypress-run:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: secret
    steps:
      - uses: actions/checkout@v2
      - run: docker-compose up -d laravel fastapi
      - run: docker-compose run cypress-e2e run
```

## Performance Testing

### Load Testing with Cypress
```javascript
// Example: Multiple concurrent executions
describe('Load Testing', () => {
  it('Should handle multiple code executions', () => {
    const promises = [];
    for (let i = 0; i < 5; i++) {
      promises.push(
        cy.executeCodeInWorkspace(`print("Test ${i}")`)
      );
    }
    // Verify all executions complete successfully
  });
});
```

## Test Coverage

### Current Coverage
- ✅ Authentication system
- ✅ Course navigation
- ✅ Workspace functionality  
- ✅ Code execution
- ✅ Progressive revelation
- ✅ Error handling
- ✅ Responsive design

### Future Enhancements
- Visual regression testing
- Performance benchmarking
- API integration tests
- Mobile app testing (if applicable)
- Accessibility testing

## Maintenance

### Regular Updates
1. Update Cypress version in `cypress/package.json`
2. Update Docker image in `docker/cypress.Dockerfile`
3. Review and update test selectors
4. Add tests for new features

### Monitoring
- Monitor test execution times
- Track failure rates
- Review screenshot/video artifacts
- Update test data as needed

## Troubleshooting Commands

```bash
# View all containers
./dc.sh ps

# Check specific container logs
./dc.sh logs cypress-e2e
./dc.sh logs laravel
./dc.sh logs fastapi

# Access container shell
./dc.sh exec cypress-e2e bash

# Restart specific service
./dc.sh restart cypress-e2e

# Rebuild containers
./dc.sh up --build --force-recreate

# Clean up containers and volumes
./dc.sh down -v
```

## Support

For issues or questions:
1. Check container logs first
2. Verify all services are running
3. Ensure test data is properly seeded
4. Review this documentation
5. Contact development team if needed
