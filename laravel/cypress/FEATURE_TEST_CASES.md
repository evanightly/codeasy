# Feature Test Case Table - Codeasy E2E Testing

This document outlines comprehensive E2E test cases for the Codeasy autograding application based on Bloom's taxonomy and SKKNI standards.

## Test Environment Setup

- **Base URL**: `http://laravel:9001` (Docker internal network)
- **VNC Access**: `localhost:5900` (password: secret)
- **Container**: `cypress/included:13.15.2` with VNC support
- **Browsers**: Chrome, Firefox (pre-installed)

## Feature Test Cases

### 1. Authentication System
| Test ID | Test Case | Description | Expected Result | Priority |
|---------|-----------|-------------|-----------------|----------|
| TC-001 | Auto-login functionality | System should automatically log in user if database contains one user | User redirected to dashboard without login form | High |
| TC-002 | First-time login | System should show login form only for first user registration | Login form appears, successful authentication leads to dashboard | High |
| TC-003 | Session persistence | User session should persist across page navigation | User remains logged in during application usage | Medium |

### 2. Course Module Navigation
| Test ID | Test Case | Description | Expected Result | Priority |
|---------|-----------|-------------|-----------------|----------|
| TC-004 | Course listing display | Dashboard should display available courses | Course cards/list visible with proper course information | High |
| TC-005 | Course module access | Users should be able to navigate to course modules | Clicking course leads to module/material listing | High |
| TC-006 | Module progression rules | Users can only access next module after attempting previous | Navigation follows defined progression rules | High |

### 3. Learning Material System
| Test ID | Test Case | Description | Expected Result | Priority |
|---------|-----------|-------------|-----------------|----------|
| TC-007 | Learning material display | Modules should display 6 materials/questions as specified | Each module contains exactly 6 learning materials | High |
| TC-008 | Material attempt tracking | System tracks when students attempt materials | Attempt status recorded, enables progression | High |
| TC-009 | Material file support | System should display PDF, code, and other learning materials | Materials render correctly in appropriate viewers | Medium |

### 4. Code Workspace Functionality
| Test ID | Test Case | Description | Expected Result | Priority |
|---------|-----------|-------------|-----------------|----------|
| TC-010 | Code editor display | Workspace should display Python code editor | Monaco editor loads with Python syntax highlighting | High |
| TC-011 | Code execution | Students can execute Python code and see output | Code runs successfully, output displayed in results panel | High |
| TC-012 | Student code isolation | Each student gets isolated Python kernel | No interference between concurrent student sessions | Critical |
| TC-013 | Code persistence | Student code should be saved and restored | Code persists across sessions and page reloads | Medium |

### 5. Test Cases and Progressive Revelation
| Test ID | Test Case | Description | Expected Result | Priority |
|---------|-----------|-------------|-----------------|----------|
| TC-014 | SKKNI test case display | Questions should show SKKNI-based data science test cases | Test cases reference Indonesian National Work Competency Standards | High |
| TC-015 | Hidden test case system | Some test cases should be initially hidden | Hidden test cases indicated with lock icon or similar | High |
| TC-016 | Progressive revelation trigger | Failed attempts should reveal hidden test cases | After configured failed attempts, hidden test cases become visible | High |
| TC-017 | Test case execution | Students can run their code against visible test cases | Test results show pass/fail status for each test case | High |

### 6. Bloom's Taxonomy Classification
| Test ID | Test Case | Description | Expected Result | Priority |
|---------|-----------|-------------|-----------------|----------|
| TC-018 | Classification system access | System should provide cognitive classification features | Classification interface accessible to appropriate users | Medium |
| TC-019 | Rule-based classification | System classifies student understanding using Bloom's taxonomy rules | Students categorized into appropriate cognitive levels | High |
| TC-020 | Classification data export | System allows export of classification results | Data exportable in Excel or similar format | Low |

### 7. FastAPI Integration
| Test ID | Test Case | Description | Expected Result | Priority |
|---------|-----------|-------------|-----------------|----------|
| TC-021 | Code execution API | Python code execution handled by FastAPI backend | Code executes through FastAPI service, results returned | High |
| TC-022 | Data analysis processing | System processes SIAKAD academic data for analysis | FastAPI handles data science computations correctly | Medium |
| TC-023 | Image processing support | System supports image processing tasks if applicable | Images processed correctly through FastAPI | Low |
| TC-024 | API error handling | System gracefully handles FastAPI communication errors | Appropriate error messages shown, system remains stable | Medium |

### 8. User Interface and Experience
| Test ID | Test Case | Description | Expected Result | Priority |
|---------|-----------|-------------|-----------------|----------|
| TC-025 | Responsive design | Interface should work on different screen sizes | Layout adapts properly to mobile, tablet, and desktop | Medium |
| TC-026 | Navigation consistency | Navigation elements should be consistent across pages | Uniform navigation experience throughout application | Medium |
| TC-027 | Loading states | System should show appropriate loading indicators | Loading spinners or messages during operations | Low |
| TC-028 | Accessibility features | Interface should follow accessibility guidelines | Proper heading structure, button labels, keyboard navigation | Low |

### 9. Performance and Scalability
| Test ID | Test Case | Description | Expected Result | Priority |
|---------|-----------|-------------|-----------------|----------|
| TC-029 | Concurrent user support | System should handle multiple students simultaneously | No performance degradation with concurrent users | High |
| TC-030 | Code execution performance | Python code should execute within reasonable time limits | Code execution completes within acceptable timeframes | Medium |
| TC-031 | Page load performance | Application pages should load quickly | Page load times within acceptable limits | Medium |
| TC-032 | Database performance | System should handle data operations efficiently | Database queries perform within acceptable limits | Medium |

### 10. Error Handling and Edge Cases
| Test ID | Test Case | Description | Expected Result | Priority |
|---------|-----------|-------------|-----------------|----------|
| TC-033 | Invalid code handling | System should handle Python syntax errors gracefully | Clear error messages, system remains stable | High |
| TC-034 | Network timeout handling | System should handle API timeouts appropriately | Timeout messages shown, retry options available | Medium |
| TC-035 | File upload error handling | System should handle file upload failures | Appropriate error messages for upload failures | Medium |
| TC-036 | Browser compatibility | System should work across different browsers | Consistent functionality in Chrome, Firefox, Safari | Medium |

## Test Data Requirements

### Sample Users
- **Primary User**: admin@codeasy.local / password123
- **Test Student**: student@test.local / student123

### Sample Courses
- **Data Science Fundamentals**: Based on SKKNI standards
- **Python Programming**: With 6 modules, each containing 6 materials
- **Machine Learning Basics**: Advanced data science concepts

### Sample Learning Materials
- PDF documents with learning content
- Python code files with examples
- Test cases with input/output specifications
- SKKNI-based competency assessments

## Test Environment Configuration

### Docker Compose Setup
```yaml
cypress-e2e:
  build:
    context: .
    dockerfile: docker/cypress.Dockerfile
  container_name: codeasy_cypress_e2e
  ports:
    - "5900:5900"   # VNC access
    - "6080:6080"   # noVNC web access
  environment:
    - CYPRESS_baseUrl=http://laravel:9001
    - DISPLAY=:99
  networks:
    - app-network
  depends_on:
    laravel:
      condition: service_healthy
    fastapi:
      condition: service_started
```

### VNC Access
- **VNC URL**: `vnc://localhost:5900`
- **Password**: `secret`
- **Web VNC**: `http://localhost:6080` (if configured)

## Execution Commands

### Interactive Mode (with VNC)
```bash
./dc.sh up --build cypress-e2e
# Connect via VNC to localhost:5900
```

### Headless Mode
```bash
./dc.sh run --rm cypress-e2e run
```

### Specific Browser
```bash
./dc.sh run --rm cypress-e2e run --browser firefox
```

## Test Data Validation

### Before Running Tests
1. Ensure Laravel application is running and accessible
2. Database contains sample course and user data
3. FastAPI service is operational
4. File uploads directory has proper permissions

### Test Result Validation
- All test cases should pass with sample data
- Screenshots captured for failed tests
- Detailed error logs available for debugging
- Performance metrics within acceptable ranges

## Continuous Integration

### GitHub Actions (Optional)
```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  cypress-run:
    runs-on: ubuntu-latest
    container: cypress/included:13.15.2
    steps:
      - uses: actions/checkout@v2
      - run: npm ci
      - run: cypress run
```

## Maintenance

### Regular Updates
- Update Cypress version in package.json and Dockerfile
- Review test cases when new features are added
- Update test data when system requirements change
- Monitor test execution performance and optimize as needed

### Test Case Extensions
- Add new test cases for additional features
- Update existing test cases when UI changes
- Create specialized test suites for different user roles
- Implement visual regression testing for UI components
