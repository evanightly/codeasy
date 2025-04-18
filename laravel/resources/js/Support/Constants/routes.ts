export const ROUTES = {
    PROFILE: 'profile',
    LOGIN: 'login',
    REGISTER: 'register',
    FORGOT_PASSWORD: 'forgot-password',
    RESET_PASSWORD: 'reset-password',
    PASSWORD_REQUEST: 'password.request',
    DASHBOARD: 'dashboard',
    PERMISSIONS: 'permissions',
    ROLES: 'roles',
    USERS: 'users',
    SCHOOLS: 'schools',
    SCHOOL_REQUESTS: 'school-requests',
    CLASS_ROOMS: 'class-rooms',
    CLASS_ROOM_STUDENTS: 'class-room-students',
    COURSES: 'courses',
    LEARNING_MATERIALS: 'learning-materials',
    LEARNING_MATERIAL_QUESTIONS: 'learning-material-questions',
    LEARNING_MATERIAL_QUESTION_TEST_CASES: 'learning-material-question-test-cases',
    COURSE_LEARNING_MATERIALS: 'courses.learning-materials',
    COURSE_LEARNING_MATERIAL_QUESTIONS: 'courses.learning-materials.questions',
    COURSE_LEARNING_MATERIAL_QUESTION_TEST_CASES: 'courses.learning-materials.questions.test-cases',
    STUDENT_SCORES: 'student-scores',
    EXECUTION_RESULTS: 'execution-results',
    STUDENT_COURSES: 'student.courses',
    STUDENT_MATERIALS: 'student.materials',
    STUDENT_QUESTIONS: 'student.questions',
} as const;
