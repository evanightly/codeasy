<?php

return [
    'common' => [
        'columns' => [
            'created_at' => 'Created At',
            'updated_at' => 'Updated At',
            'timestamps' => 'Time Information',
        ],
    ],
    'login' => [
        'title' => 'Welcome Back!',
        'fields' => [
            'identifier' => 'Email or Employee ID',
            'password' => 'Password',
            'remember' => 'Remember Me',
        ],
        'buttons' => [
            'forgot_password' => 'Forgot Your Password?',
            'sign_in' => 'Sign In',
        ],
    ],
    'auth' => [
        'login' => [
            'title' => 'Welcome Back',
            'subtitle' => 'Master Data Science with AI-Powered Learning Platform',
            'description' => 'Experience personalized learning with Bloom\'s Taxonomy',
            'hero_title' => 'Codeasy',
            'fields' => [
                'identifier' => 'Email or Username',
                'password' => 'Password',
                'remember' => 'Remember me',
            ],
            'buttons' => [
                'next' => 'Next',
                'back' => 'Back',
                'sign_in' => 'Sign In',
                'sign_up' => 'Sign Up',
                'forgot_password' => 'Forgot password?',
                'dont_have_account' => 'Don\'t have an account?',
            ],
            'messages' => [
                'authenticating' => 'Authenticating...',
                'success' => 'Successfully logged in!',
                'error' => 'Invalid credentials',
            ],
            'features' => [
                'ai_assessment' => 'AI-Powered Cognitive Assessment',
                'personalized_learning' => 'Adaptive Learning Paths',
                'real_world_projects' => 'Real-world Data Science Projects',
            ],
            'placeholders' => [
                'identifier' => 'Enter your email or username',
                'password' => 'Enter your password',
            ],
            'ui' => [
                'welcome_back_header' => 'Welcome Back',
                'continue_journey' => 'Continue your learning journey',
                'verifying_credentials' => 'Please wait while we verify your credentials...',
                'toggle_dark_mode' => 'Toggle dark mode',
                'switch_to_light' => 'Switch to Light Mode',
                'switch_to_dark' => 'Switch to Dark Mode',
            ],
        ],
        'register' => [
            'title' => 'Create an Account',
            'subtitle' => 'Begin your Data Science journey with personalized learning',
            'description' => 'Create your account and unlock the power of AI-driven education',
            'hero_title' => 'Join Codeasy',
            'fields' => [
                'name' => 'Name',
                'email' => 'Email',
                'role' => 'Role',
                'school' => 'School',
                'password' => 'Password',
                'password_confirmation' => 'Confirm Password',
                'already_registered' => 'Already registered?',
                'select_role' => 'Select a role',
                'select_school' => 'Select a school',
                'reset_role' => 'Clear selection',
            ],
            'buttons' => [
                'register' => 'Register',
            ],
            'messages' => [
                'pending' => 'Creating your account...',
                'success' => 'Account created successfully!',
                'error' => 'There was a problem creating your account',
            ],
            'features' => [
                'intelligent_assessment' => 'Intelligent Assessment & Feedback',
                'progress_tracking' => 'Progress Tracking & Analytics',
                'comprehensive_materials' => 'Comprehensive Learning Materials',
            ],
            'placeholders' => [
                'name' => 'Enter your full name',
                'email' => 'Enter your email address',
                'password' => 'Create a strong password',
                'password_confirmation' => 'Confirm your password',
            ],
            'ui' => [
                'get_started' => 'Get Started',
                'create_account_subtitle' => 'Create your account to start learning',
                'toggle_dark_mode' => 'Toggle dark mode',
                'switch_to_light' => 'Switch to Light Mode',
                'switch_to_dark' => 'Switch to Dark Mode',
            ],
        ],
        'verify_email' => [
            'resend_button' => 'Resend Verification Email',
        ],
    ],
    'user' => [
        'common' => [
            'fields' => [
                'name' => 'Name',
                'email' => 'Email',
                'username' => 'Username',
                'password' => 'Password',
                'password_confirmation' => 'Confirm Password',
                'roles' => 'Roles',
                'profile_image' => 'Profile Image',
            ],
            'placeholders' => [
                'name' => 'Enter Name',
                'email' => 'Enter Email',
                'username' => 'Enter Username',
                'password' => 'Enter Password',
                'password_confirmation' => 'Confirm Password',
            ],
            'validations' => [
                'name' => [
                    'required' => 'Name is required',
                    'min' => 'Name must be at least :min characters',
                ],
                'email' => [
                    'required' => 'Email is required',
                    'invalid' => 'Email is invalid',
                ],
                'username' => [
                    'required' => 'Username is required',
                ],
                'password' => [
                    'required' => 'Password is required',
                    'min' => 'Password must be at least :min characters',
                ],
                'password_confirmation' => [
                    'match' => 'Password confirmation does not match',
                ],
            ],
            'messages' => [
                'not_found' => 'User not found',
                'pending' => [
                    'create' => 'Creating user...',
                    'update' => 'Updating user...',
                    'delete' => 'Deleting user...',
                ],
                'success' => [
                    'create' => 'User created successfully',
                    'update' => 'User updated successfully',
                    'delete' => 'User deleted successfully',
                ],
                'error' => [
                    'create' => 'Error creating user',
                    'update' => 'Error updating user',
                    'delete' => 'Error deleting user',
                ],
            ],
        ],
        'index' => [
            'title' => 'Users',
            'actions' => [
                'create' => 'Create User',
                'edit' => 'Edit User',
                'delete' => 'Delete User',
                'import_students' => 'Import Students',
            ],
            'columns' => [
                'name' => 'Name',
                'username' => 'Username',
                'email' => 'Email',
                'roles' => 'Roles',
                'actions' => 'Actions',
            ],
        ],
        'create' => [
            'title' => 'Create User',
            'fields' => [
                'password' => 'Password',
                'avatar_help' => 'Drop files here or click to upload',
            ],
            'buttons' => [
                'create' => 'Create User',
            ],
        ],
        'edit' => [
            'title' => 'Edit User: :name',
            'fields' => [
                'password' => 'New Password (optional)',
                'roles' => 'Roles',  // Added missing translation
            ],
            'buttons' => [
                'update' => 'Update User',  // Added missing translation
            ],
        ],
        'show' => [
            'title' => 'User Details: :name',
            'no_username' => 'No username set',
            'no_roles' => 'No roles assigned to this user',
            'sections' => [
                'information' => 'Information',
                'contact_information' => 'Contact Information',
                'roles' => 'Roles',
                'timestamps' => 'Time Information',
            ],
        ],
        'filters' => [
            'roles' => [
                'title' => 'Roles',
                'options' => [
                    'teacher' => 'Teacher',
                    'student' => 'Student',
                    'school_admin' => 'School Admin',
                    'super_admin' => 'Super Admin',
                ],
            ],
        ],
        'import' => [
            'upload_title' => 'Upload Student File',
            'title' => 'Import Students',
            'description' => 'Upload a CSV or Excel file to import students in bulk. Make sure your file follows the required format.',
            'download_excel_template' => 'Download Excel Template',
            'download_csv_template' => 'Download CSV Template',
            'template_description' => 'Download a template file to see the required format for importing students.',
            'buttons' => [
                'cancel' => 'Cancel',
                'preview' => 'Preview',
                'confirm_import' => 'Confirm Import',
            ],
            'previewing' => 'Scanning file for preview...',
            'preview_error' => 'There was an error previewing the file. Please check the format and try again.',
            'preview_success' => 'File preview successful. Review the data below before importing.',
            'import_error' => 'There was an error importing the file. Please check the format and try again.',
            'import_success' => 'File imported successfully.',
            'importing' => 'Importing students, please wait...',
            'preview' => [
                'title' => 'Preview Imported Students',
                'description' => 'Review the data before importing. Ensure all information is correct.',
                'stats' => 'Preview Stats',
                'students_list' => 'Students List',
                'student_count' => 'Total Students: :count',
            ],
        ],
    ],
    'permission' => [
        'edit' => [
            'title' => 'Edit Permission',
        ],
        'common' => [
            'fields' => [
                'name' => 'Permission Name',
                'group' => 'Group',
            ],
            'placeholders' => [
                'name' => 'e.g., users-create, roles-read',
            ],
            'help_texts' => [
                'name_format' => 'Permission name must be in format: resource-action',
                'valid_actions' => 'Valid actions: :actions',
            ],
            'validations' => [
                'name' => [
                    'required' => 'Permission name is required',
                    'format' => 'Invalid permission format. Must be: resource-action where action is one of: :actions',
                ],
            ],
            'messages' => [
                'not_found' => 'Permission not found',
                'pending' => [
                    'create' => 'Creating permission...',
                    'update' => 'Updating permission...',
                    'delete' => 'Deleting permission...',
                ],
                'success' => [
                    'create' => 'Permission created successfully',
                    'update' => 'Permission updated successfully',
                    'delete' => 'Permission deleted successfully',
                ],
                'error' => [
                    'create' => 'Error creating permission',
                    'update' => 'Error updating permission',
                    'delete' => 'Error deleting permission',
                ],
            ],
        ],
        'index' => [
            'title' => 'Permissions',
            'actions' => [
                'create' => 'Create Permission',
                'edit' => 'Edit Permission',
                'delete' => 'Delete Permission',
            ],
            'columns' => [
                'name' => 'Name',
                'group' => 'Group',
                'actions' => 'Actions',
            ],
        ],
        'create' => [
            'title' => 'Create Permission',
            'buttons' => [
                'create' => 'Create Permission',
            ],
        ],
        'edit' => [
            'title' => 'Edit Permission: :name',
            'buttons' => [
                'update' => 'Update Permission',
            ],
        ],
        'show' => [
            'title' => 'Permission Details: :name',
            'no_roles' => 'No roles assigned to this permission',
            'fields' => [
                'guard_name' => 'Guard Name',
                'action' => 'Action',
            ],
            'sections' => [
                'information' => 'Information',
                'roles' => 'Associated Roles',
                'timestamps' => 'Time Information',
            ],
        ],
        'messages' => [
            'loading' => 'Updating permission...',
            'success' => 'Permission updated successfully',
            'error' => 'An error occurred while updating permission',
        ],
    ],
    'role' => [
        'common' => [
            'fields' => [
                'name' => 'Role Name',
                'guard_name' => 'Guard Name',
                'permissions' => 'Permissions',
            ],
            'placeholders' => [
                'name' => 'Enter role name',
                'guard_name' => 'web',
            ],
            'validations' => [
                'name' => [
                    'required' => 'Role name is required',
                ],
            ],
            'messages' => [
                'not_found' => 'Role not found',
                'pending' => [
                    'create' => 'Creating role...',
                    'update' => 'Updating role...',
                    'delete' => 'Deleting role...',
                ],
                'success' => [
                    'create' => 'Role created successfully',
                    'update' => 'Role updated successfully',
                    'delete' => 'Role deleted successfully',
                ],
                'error' => [
                    'create' => 'Error creating role',
                    'update' => 'Error updating role',
                    'delete' => 'Error deleting role',
                ],
            ],
        ],
        'index' => [
            'title' => 'Roles',
            'actions' => [
                'create' => 'Create Role',
                'edit' => 'Edit Role',
                'delete' => 'Delete Role',
            ],
            'columns' => [
                'name' => 'Name',
                'guard_name' => 'Guard',
                'users' => 'Users',
                'actions' => 'Actions',
            ],
        ],
        'create' => [
            'title' => 'Create Role',
            'buttons' => [
                'create' => 'Create Role',
            ],
        ],
        'edit' => [
            'title' => 'Edit Role: :name',
            'buttons' => [
                'update' => 'Update Role',
            ],
        ],
        'show' => [
            'title' => 'Role Details: :name',
            'no_permissions' => 'No permissions assigned to this role',
            'no_users' => 'No users assigned to this role',
            'sections' => [
                'information' => 'Information',
                'permissions' => 'Permissions',
                'users' => 'Users',
                'timestamps' => 'Time Information',
            ],
        ],
    ],
    'school' => [
        'common' => [
            'fields' => [
                'name' => 'School Name',
                'address' => 'Address',
                'city' => 'City',
                'state' => 'State',
                'zip' => 'ZIP Code',
                'phone' => 'Phone',
                'email' => 'Email',
                'website' => 'Website',
                'active' => 'Active Status',
            ],
            'placeholders' => [
                'name' => 'Enter school name',
                'address' => 'Enter school address',
                'city' => 'Enter city',
                'state' => 'Enter state',
                'zip' => 'Enter ZIP code',
                'phone' => 'Enter phone number',
                'email' => 'Enter school email',
                'website' => 'Enter school website',
                'select_user' => 'Select a user',
                'student' => 'Student',
                'select_students' => 'Select students',
            ],
            'validations' => [
                'name' => [
                    'required' => 'School name is required',
                ],
                'address' => [
                    'required' => 'Address is required',
                ],
                'email' => [
                    'invalid' => 'Invalid email format',
                ],
            ],
            'messages' => [
                'pending' => [
                    'create' => 'Creating school...',
                    'update' => 'Updating school...',
                    'delete' => 'Deleting school...',
                    'assign_admin' => 'Assigning administrator...',
                    'unassign_admin' => 'Removing administrator...',
                    'assign_student' => 'Assigning students...',
                    'unassign_student' => 'Removing student...',
                    'assign_students' => 'Assigning students...',
                    'unassign_students' => 'Removing students...',
                ],
                'success' => [
                    'create' => 'School created successfully',
                    'update' => 'School updated successfully',
                    'delete' => 'School deleted successfully',
                    'assign_admin' => 'Administrator assigned successfully',
                    'unassign_admin' => 'Administrator removed successfully',
                    'assign_student' => 'Students assigned successfully',
                    'unassign_student' => 'Student removed successfully',
                    'assign_students' => ':count students assigned successfully',
                    'unassign_students' => ':count students removed successfully',
                ],
                'error' => [
                    'create' => 'Error creating school',
                    'update' => 'Error updating school',
                    'delete' => 'Error deleting school',
                    'assign_admin' => 'Error assigning administrator',
                    'unassign_admin' => 'Error removing administrator',
                    'assign_student' => 'Error assigning students',
                    'unassign_student' => 'Error removing student',
                    'assign_students' => 'Error assigning students',
                    'unassign_students' => 'Error removing students',
                ],
            ],
            'sections' => [
                'information' => 'School Information',
                'contact_information' => 'Contact Information',
                'administrators' => 'Administrators',
                'teachers' => 'Teachers',
                'students' => 'Students',
            ],
            'status' => [
                'active' => 'Active',
                'inactive' => 'Inactive',
            ],
            'empty_states' => [
                'no_administrators' => 'No administrators assigned',
                'no_teachers' => 'No teachers assigned',
                'no_students' => 'No students enrolled',
            ],
            'bulk_actions' => [
                'selected_count' => ':count selected',
                'unassign_selected' => 'Unassign Selected',
            ],
        ],
        'index' => [
            'title' => 'Schools',
            'actions' => [
                'create' => 'Create School',
                'show' => 'Show Details',
                'edit' => 'Edit School',
                'delete' => 'Delete School',
                'assign_admin' => 'Assign Administrator',
                'assign_student' => 'Assign Students',
            ],
            'columns' => [
                'name' => 'Name',
                'address' => 'Address',
                'city' => 'City',
                'phone' => 'Phone',
                'email' => 'Email',
                'actions' => 'Actions',
            ],
        ],
        'create' => [
            'title' => 'Create School',
            'buttons' => [
                'create' => 'Create School',
            ],
        ],
        'edit' => [
            'title' => 'Edit School: :name',
            'buttons' => [
                'update' => 'Update School',
            ],
        ],
        'show' => [
            'title' => 'School Details: :name',
            'buttons' => [
                'back' => 'Back to Schools',
            ],
            'dialogs' => [
                'assign_student' => [
                    'title' => 'Assign Students',
                    'description' => 'Select students to assign to this school',
                    'buttons' => [
                        'assign' => 'Assign Students',
                    ],
                ],
            ],
        ],
        'assign_admin' => [
            'title' => 'Assign School Administrator',
            'description' => 'Select a user to assign as school administrator',
            'buttons' => [
                'assign' => 'Assign Administrator',
                'cancel' => 'Cancel',
            ],
        ],
    ],
    'school_request' => [
        'common' => [
            'fields' => [
                'school' => 'School',
                'user' => 'User',
                'message' => 'Message',
                'status' => 'Status',
                'created_at' => 'Created At',
            ],
            'placeholders' => [
                'school' => 'Select a school',
                'message' => 'Enter your request message',
            ],
            'default_messages' => [
                'student' => 'Student registration request',
                'teacher' => 'Teacher registration request',
            ],
            'validations' => [
                'school_id' => [
                    'required' => 'School is required',
                ],
                'user_id' => [
                    'required' => 'User is required',
                ],
                'message' => [
                    'required' => 'Message is required',
                ],
            ],
            'messages' => [
                'pending' => [
                    'create' => 'Creating request...',
                    'update' => 'Updating request...',
                    'delete' => 'Deleting request...',
                    'approve' => 'Approving request...',
                    'reject' => 'Rejecting request...',
                ],
                'success' => [
                    'create' => 'Request created successfully',
                    'update' => 'Request updated successfully',
                    'delete' => 'Request deleted successfully',
                    'approve' => 'Request approved successfully',
                    'reject' => 'Request rejected successfully',
                ],
                'error' => [
                    'create' => 'Error creating request',
                    'update' => 'Error updating request',
                    'delete' => 'Error deleting request',
                    'approve' => 'Error approving request',
                    'reject' => 'Error rejecting request',
                    'already_requested' => 'You have already submitted a request for this school that is pending or approved',
                ],
            ],
            'status' => [
                'pending' => 'Pending',
                'approved' => 'Approved',
                'rejected' => 'Rejected',
            ],
        ],
        'index' => [
            'title' => 'School Requests',
            'buttons' => [
                'create' => 'Create Request',
            ],
            'columns' => [
                'school' => 'School',
                'message' => 'Message',
                'status' => 'Status',
                'created_at' => 'Created At',
                'actions' => 'Actions',
            ],
            'empty_state' => 'No school requests found',
        ],
        'create' => [
            'title' => 'Create School Request',
            'buttons' => [
                'create' => 'Submit Request',
            ],
        ],
        'edit' => [
            'title' => 'Edit School Request',
            'buttons' => [
                'update' => 'Update Request',
            ],
        ],
        'show' => [
            'title' => 'School Request Details',
            'buttons' => [
                'approve' => 'Approve',
                'reject' => 'Reject',
                'back' => 'Back to Requests',
            ],
        ],
    ],
    'student_course_cognitive_classification' => [
        'index' => [
            'title' => 'Student Course Cognitive Classifications',
        ],
        'show' => [
            'title' => 'Cognitive Classification Details',
        ],
        'sections' => [
            'classifications' => 'Course Cognitive Classifications',
            'classification_info' => 'Classification Information',
            'material_classifications' => 'Material Classifications',
            'details' => 'Classification Details',
        ],
        'descriptions' => [
            'classifications' => 'View and manage student cognitive classifications by course',
            'classification_info' => 'Basic information about the classification',
            'material_classifications' => 'Classification results for individual learning materials',
        ],
        'fields' => [
            'student' => 'Student',
            'course' => 'Course',
            'classification_type' => 'Classification Method',
            'classification_level' => 'Cognitive Level',
            'classification_score' => 'Score',
            'classified_at' => 'Classification Date',
            'recommendations' => 'Recommendations',
        ],
        'columns' => [
            'student' => 'Student',
            'course' => 'Course',
            'classification_type' => 'Method',
            'classification_level' => 'Level',
            'classification_score' => 'Score',
            'classified_at' => 'Date',
            'material' => 'Material',
            'actions' => 'Actions',
        ],
        'buttons' => [
            'export_excel' => 'Export to Excel',
            'enhanced_export' => 'Enhanced Export',
            'view_report' => 'View Report',
            'generate_report' => 'Generate Report',
            'back' => 'Back to List',
        ],
        'placeholders' => [
            'select_course' => 'Select a course',
            'select_classification_type' => 'Select classification method',
        ],
        'dialogs' => [
            'report' => [
                'title' => 'Generate Course Report',
                'description' => 'Select a course to view cognitive classification report',
            ],
            'delete' => [
                'title' => 'Delete Classification',
                'description' => 'Are you sure you want to delete this classification? This action cannot be undone.',
            ],
            'export' => [
                'title' => 'Export Classifications',
                'description' => 'Select the course to export classifications',
            ],
            'enhanced_export' => [
                'title' => 'Enhanced Student Scores Export',
                'description' => 'Export comprehensive student score data with classification history and aggregated metrics.',
                'course_label' => 'Course',
                'classification_type_label' => 'Classification Type',
                'classification_date_label' => 'Classification Date (Optional)',
                'select_students_label' => 'Select Students',
                'select_course_placeholder' => 'Select a course...',
                'select_classification_type_placeholder' => 'Select classification type...',
                'loading_dates' => 'Loading dates...',
                'latest_classification' => 'Latest classification (default)',
                'select_all' => 'Select All',
                'loading_students' => 'Loading students...',
                'loading_dates_description' => 'Loading available classification dates...',
                'classification_date_description' => 'Select a specific classification date or leave empty to use the latest classification for each student.',
                'students_selected' => ':selected of :total students selected',
                'export_button' => 'Export Enhanced Data',
                'exporting' => 'Exporting...',
                'table_headers' => [
                    'select' => 'Select',
                    'name' => 'Name',
                    'email' => 'Email',
                    'username' => 'Username',
                ],
            ],
        ],
        'messages' => [
            'no_material_classifications' => 'No material classifications found for this course',
            'no_course_classifications' => 'No course classifications found',
            'deleting' => 'Deleting classification...',
            'delete_success' => 'Classification deleted successfully',
            'delete_error' => 'Failed to delete classification',
        ],
    ],
    'classroom' => [
        'common' => [
            'fields' => [
                'school' => 'School',
                'name' => 'Classroom Name',
                'description' => 'Description',
                'grade' => 'Grade',
                'year' => 'Academic Year',
                'active' => 'Active Status',
                'status' => 'Status',
                'students' => 'Students',
                'student' => 'Student',
            ],
            'placeholders' => [
                'school' => 'Select a school',
                'name' => 'Enter classroom name',
                'description' => 'Enter classroom description',
                'grade' => 'Select grade',
                'year' => 'Enter academic year',
                'active' => 'Select active status',
                'status' => 'Select status',
                'students' => 'Select a student',
                'student' => 'Select a student',
                'select_students' => 'Select students',
            ],
            'validations' => [
                'school_id' => [
                    'required' => 'School is required',
                ],
                'name' => [
                    'required' => 'Classroom name is required',
                ],
                'grade' => [
                    'required' => 'Grade is required',
                ],
                'year' => [
                    'required' => 'Academic year is required',
                ],
                'students' => [
                    'required' => 'Please select at least one student',
                ],
                'student_id' => [
                    'required' => 'Please select a student',
                ],
            ],
            'messages' => [
                'not_found' => 'Classroom not found',
                'pending' => [
                    'create' => 'Creating classroom...',
                    'update' => 'Updating classroom...',
                    'delete' => 'Deleting classroom...',
                    'assign_student' => 'Assigning students...',
                    'assign_students' => 'Assigning students...',
                    'remove_student' => 'Removing student...',
                ],
                'success' => [
                    'create' => 'Classroom created successfully',
                    'update' => 'Classroom updated successfully',
                    'delete' => 'Classroom deleted successfully',
                    'assign_student' => 'Students assigned successfully',
                    'assign_students' => ':count students assigned successfully',
                    'remove_student' => 'Student removed successfully',
                    'unassign_students' => ':count students removed successfully',
                ],
                'error' => [
                    'create' => 'Error creating classroom',
                    'update' => 'Error updating classroom',
                    'delete' => 'Error deleting classroom',
                    'unauthorized' => 'You are not authorized to manage classrooms in this school',
                    'assign_student' => 'Error assigning students',
                    'assign_students' => 'Error assigning students',
                    'remove_student' => 'Error removing student',
                ],
            ],
            'status' => [
                'active' => 'Active',
                'inactive' => 'Inactive',
            ],
            'bulk_actions' => [
                'selected_count' => ':count selected',
                'unassign_selected' => 'Unassign Selected',
            ],
        ],
        'index' => [
            'title' => 'Classrooms',
            'buttons' => [
                'create' => 'Create Classroom',
            ],
            'search_placeholder' => 'Search classrooms...',
            'empty_state' => 'No classrooms found',
        ],
        'create' => [
            'title' => 'Create Classroom',
            'buttons' => [
                'create' => 'Create Classroom',
            ],
        ],
        'edit' => [
            'title' => 'Edit Classroom',
            'buttons' => [
                'update' => 'Update Classroom',
            ],
        ],
        'show' => [
            'title' => 'Classroom Details',
            'sections' => [
                'information' => 'Information',
                'students' => 'Students',
            ],
            'student_columns' => [
                'name' => 'Name',
                'email' => 'Email',
                'actions' => 'Actions',
            ],
            'buttons' => [
                'assign_student' => 'Assign Students',
            ],
            'empty_states' => [
                'no_students' => 'No students assigned to this classroom',
            ],
            'dialogs' => [
                'assign_student' => [
                    'title' => 'Assign Students',
                    'description' => 'Select students to assign to this classroom',
                    'buttons' => [
                        'assign' => 'Assign Students',
                    ],
                ],
            ],
        ],
    ],
    'course' => [
        'common' => [
            'fields' => [
                'name' => 'Course Name',
                'description' => 'Description',
                'classroom' => 'Classroom',
                'teacher' => 'Teacher',
                'active' => 'Active Status',
                'status' => 'Status',
                'workspace_lock_timeout' => 'Workspace Lock Timeout',
            ],
            'placeholders' => [
                'name' => 'Enter course name',
                'description' => 'Enter course description',
                'classroom' => 'Select a classroom',
                'teacher' => 'Select a teacher',
                'timeout_value' => 'Enter timeout value',
            ],
            'time_units' => [
                'minutes' => 'Minutes',
                'hours' => 'Hours',
                'days' => 'Days',
                'months' => 'Months',
            ],
            'help' => [
                'workspace_lock_timeout' => 'How long students must wait before they can re-attempt after completing all questions in a material. Set to 0 to allow immediate re-attempts.',
            ],
            'validations' => [
                'name' => [
                    'required' => 'Course name is required',
                ],
                'class_room_id' => [
                    'required' => 'Classroom is required',
                ],
                'teacher_id' => [
                    'required' => 'Teacher is required',
                ],
            ],
            'messages' => [
                'not_found' => 'Course not found',
                'pending' => [
                    'create' => 'Creating course...',
                    'update' => 'Updating course...',
                    'delete' => 'Deleting course...',
                ],
                'success' => [
                    'create' => 'Course created successfully',
                    'update' => 'Course updated successfully',
                    'delete' => 'Course deleted successfully',
                ],
                'error' => [
                    'create' => 'Error creating course',
                    'update' => 'Error updating course',
                    'delete' => 'Error deleting course',
                ],
            ],
            'status' => [
                'active' => 'Active',
                'inactive' => 'Inactive',
            ],
            'sections' => [
                'details' => 'Course Details',
                'information' => 'Information',
                'timestamps' => 'Time Information',
            ],
            'not_assigned' => 'Not Assigned',
        ],
        'index' => [
            'title' => 'Courses',
            'buttons' => [
                'create' => 'Create Course',
            ],
            'search_placeholder' => 'Search courses...',
            'empty_state' => 'No courses found',
        ],
        'create' => [
            'title' => 'Create Course',
            'buttons' => [
                'create' => 'Create Course',
            ],
        ],
        'edit' => [
            'title' => 'Edit Course',
            'buttons' => [
                'update' => 'Update Course',
            ],
        ],
        'show' => [
            'title' => 'Course Details',
            'sections' => [
                'information' => 'Information',
                'learning_materials' => 'Learning Materials',
                'locked_students' => 'Locked Students',
            ],
            'locked_students' => [
                'title' => 'Locked Students Management',
                'description' => 'Manage students whose workspaces are locked due to completing all questions in materials.',
                'loading' => 'Loading locked students...',
                'no_locked_students' => 'No Locked Students',
                'no_locked_students_description' => 'There are currently no students with locked workspaces in this course.',
                'columns' => [
                    'student' => 'Student',
                    'material' => 'Material',
                    'locked_at' => 'Locked At',
                    'unlock_at' => 'Unlock At',
                    'status' => 'Status',
                    'actions' => 'Actions',
                ],
                'status' => [
                    'locked' => 'Locked',
                    'can_reattempt' => 'Can Re-attempt',
                ],
                'actions' => [
                    'unlock' => 'Unlock Workspace',
                ],
                'unlock_now' => 'Available Now',
            ],
        ],
        'import' => [
            'title' => 'Import Courses',
            'description' => 'Import courses from an Excel file or ZIP archive containing Excel and related files',
            'upload_title' => 'Upload Course Import File',
            'download_template' => 'Download Template',
            'drag_drop' => 'Drag and drop your Excel file or ZIP archive here, or click to browse',
            'supported_formats' => 'Supports .xlsx, .xls and .zip files up to 50MB',
            'stats' => 'Imported: {courses} courses, {materials} materials, {questions} questions, {testCases} test cases',
            'errors' => 'Errors:',
            'instructions_title' => 'Instructions',
            'instructions' => [
                'download' => 'Download the template and fill in your course data',
                'identifiers' => 'You can use classroom names and teacher emails instead of IDs',
                'materials' => 'Materials must reference courses by name',
                'questions' => 'Questions must reference materials by title and include the course name',
                'test_cases' => 'Test cases must reference questions by title and include the material title and course name',
                'order' => 'Fill out sheets in order: Courses → Materials → Questions → TestCases',
                'backup' => 'Keep a backup of your Excel file and attachments',
                'zip_use' => 'For file attachments, use a ZIP file containing both Excel and referenced files',
                'file_references' => 'In Excel, add file paths relative to the ZIP root (e.g., "materials/lecture1.pdf")',
                'file_handling' => 'All files will be stored and accessible to students without needing to specify paths',
            ],
            'buttons' => [
                'import' => 'Import Courses',
                'open_import' => 'Import',
            ],
            'downloading_template' => 'Downloading template...',
            'download_success' => 'Template downloaded successfully',
            'download_error' => 'Failed to download template',
            'importing' => 'Importing courses...',
            'import_success' => 'Courses imported successfully',
            'import_error' => 'Failed to import courses',
            'validation' => [
                'file_required' => 'Please select a file to import',
                'file_type' => 'Only .xlsx, .xls and .zip files are accepted',
                'file_size' => 'File size must not exceed 50MB',
            ],
            'zip' => [
                'title' => 'ZIP Archive Import',
                'description' => 'Upload a ZIP file containing your Excel file and referenced materials',
                'instructions' => 'The ZIP file should contain one Excel file and any files referenced in the Excel sheets',
                'structure' => 'Organize your files in folders within the ZIP for better management',
                'example' => 'Example: Place PDF materials in a "materials" folder and reference as "materials/file.pdf"',
                'error' => [
                    'no_excel' => 'No Excel file found in the ZIP archive',
                    'missing_file' => 'Referenced file not found in the ZIP archive: {file}',
                    'extraction' => 'Error extracting ZIP file: {error}',
                ],
                'file_handling' => [
                    'title' => 'File Handling',
                    'description' => 'Files are stored with unique names to avoid conflicts',
                    'note' => 'When referencing files in Excel, just include the relative path within the ZIP archive',
                    'example' => 'For example, use "materials/lecture1.pdf" to reference that file inside your ZIP',
                    'storage' => 'All uploaded files will be accessible to students without needing to specify paths',
                ],
            ],
            'preview_dialog' => [
                'title' => 'Import Preview',
                'description' => 'Please review the data to be imported before proceeding',
                'tabs' => [
                    'summary' => 'Summary',
                    'pdf_content' => 'PDF Content',
                    'courses' => 'Courses',
                    'materials' => 'Materials',
                ],
                'excel_content' => 'Excel Content',
                'courses' => 'Courses',
                'materials' => 'Materials',
                'questions' => 'Questions',
                'test_cases' => 'Test Cases',
                'pdf_content' => 'PDF Content',
                'pdf_files' => 'PDF Files',
                'detected_questions' => 'Detected Questions',
                'detected_test_cases' => 'Detected Test Cases',
                'no_pdf_content' => 'No questions detected from PDF files',
                'no_courses' => 'No courses found in the import file',
                'no_materials' => 'No materials found in the import file',
                'cancel' => 'Cancel',
                'confirm' => 'Import Now',
                'importing' => 'Importing...',
            ],
            'previewing' => 'Analyzing import file...',
            'preview_success' => 'Preview generated successfully',
            'preview_error' => 'Failed to generate preview',
            'download_material_template' => 'Download Material Template',
            'downloading_material_template' => 'Downloading Material template...',
            'download_material_success' => 'Material template downloaded successfully',
            'download_material_error' => 'Failed to download Material template',
        ],
    ],
    'learning_material' => [
        'common' => [
            'fields' => [
                'title' => 'Title',
                'description' => 'Description',
                'type' => 'Type',
                'order' => 'Order',
                'file' => 'File',
                'file_extension' => 'File Extension',
                'status' => 'Status',
                'active' => 'Active Status',
                'course' => 'Course',
            ],
            'placeholders' => [
                'title' => 'Enter title',
                'description' => 'Enter description',
                'type' => 'Select type',
                'file_extension' => 'Enter file extension',
            ],
            'types' => [
                'article' => 'Article',
                'quiz' => 'Quiz',
                'live_code' => 'Live Coding',
            ],
            'status' => [
                'active' => 'Active',
                'inactive' => 'Inactive',
            ],
            'sections' => [
                'details' => 'Material Details',
                'timestamps' => 'Time Information',
            ],
            'validations' => [
                'title' => [
                    'required' => 'Title is required',
                ],
                'course_id' => [
                    'required' => 'Course is required',
                ],
                'type' => [
                    'required' => 'Material type is required',
                ],
                'order_number' => [
                    'required' => 'Order number is required',
                ],
            ],
            'messages' => [
                'not_found' => 'Learning material not found',
                'pending' => [
                    'create' => 'Creating learning material...',
                    'update' => 'Updating learning material...',
                    'delete' => 'Deleting learning material...',
                ],
                'success' => [
                    'create' => 'Learning material created successfully',
                    'update' => 'Learning material updated successfully',
                    'delete' => 'Learning material deleted successfully',
                ],
                'error' => [
                    'create' => 'Error creating learning material',
                    'update' => 'Error updating learning material',
                    'delete' => 'Error deleting learning material',
                ],
            ],
            'no_course' => 'No Course Assigned',
        ],
        'index' => [
            'title' => 'Learning Materials',
            'buttons' => [
                'create' => 'Add Material',
            ],
            'search_placeholder' => 'Search materials...',
            'empty_state' => 'No learning materials found',
        ],
        'create' => [
            'title' => 'Create Learning Material',
            'buttons' => [
                'create' => 'Create Material',
            ],
            'preview' => 'File Preview',
            'no_preview_available' => 'Preview not available for this file type',
        ],
        'edit' => [
            'title' => 'Edit Learning Material',
            'buttons' => [
                'update' => 'Update Material',
            ],
            'current_file' => 'Current File',
            'new_file_preview' => 'New File Preview',
            'current_file_preview' => 'Current File Preview',
            'preview' => 'File Preview',
            'no_preview_available' => 'Preview not available for this file type',
        ],
        'show' => [
            'title' => 'Learning Material Details',
            'sections' => [
                'information' => 'Information',
                'details' => 'Material Details',
                'questions' => 'Questions',
            ],
            'file_info' => 'File: :name (:extension)',
            'view_file' => 'View File',
            'full_pdf_link' => 'View Full PDF',
        ],
    ],
    'learning_material_question' => [
        'common' => [
            'fields' => [
                'title' => 'Question Title',
                'description' => 'Question Description',
                'type' => 'Question Type',
                'order' => 'Order',
                'clue' => 'Hint/Clue',
                'pre_code' => 'Pre-defined Code',
                'example_code' => 'Example Solution Code',
                'file' => 'Question File',
                'file_extension' => 'File Extension',
                'status' => 'Status',
                'active' => 'Active Status',
            ],
            'placeholders' => [
                'title' => 'Enter question title',
                'description' => 'Enter question description or instructions',
                'clue' => 'Enter hint or clue for students',
                'pre_code' => 'Enter starter code for students',
                'example_code' => 'Enter example solution code',
            ],
            'help' => [
                'clue' => 'Provide a hint that students can view if they are stuck',
                'pre_code' => 'Provide starter code that will be preloaded for students to begin with',
                'example_code' => 'Provide an example solution that can be used for reference',
                'question_file' => 'Upload a PDF or image file containing the question details or visual elements',
                'starter_code' => null, // Remove this line or comment it out
            ],
            'types' => [
                'quiz' => 'Quiz Question',
                'live_code' => 'Live Coding Exercise',
            ],
            'status' => [
                'active' => 'Active',
                'inactive' => 'Inactive',
            ],
            'validations' => [
                'title' => [
                    'required' => 'Question title is required',
                ],
                'description' => [
                    'required' => 'Question content is required',
                ],
                'material_id' => [
                    'required' => 'Learning material is required',
                ],
                'order_number' => [
                    'required' => 'Order number is required',
                ],
            ],
            'messages' => [
                'not_found' => 'Question not found',
                'pending' => [
                    'create' => 'Creating question...',
                    'update' => 'Updating question...',
                    'delete' => 'Deleting question...',
                ],
                'success' => [
                    'create' => 'Question created successfully',
                    'update' => 'Question updated successfully',
                    'delete' => 'Question deleted successfully',
                ],
                'error' => [
                    'create' => 'Error creating question',
                    'update' => 'Error updating question',
                    'delete' => 'Error deleting question',
                ],
            ],
            'actions' => [
                'manage_test_cases' => 'Manage Test Cases',
            ],
        ],
        'index' => [
            'title' => 'Questions',
            'buttons' => [
                'create' => 'Add Question',
            ],
            'empty_state' => 'No questions found',
        ],
        'create' => [
            'title' => 'Create Question',
            'buttons' => [
                'create' => 'Create Question',
            ],
            'preview' => 'File Preview',
            'no_preview_available' => 'Preview not available for this file type',
            'test_cases' => [
                'note' => 'Test Cases for Live Coding',
                'description' => 'For live coding questions, you can add test cases after creating the question.',
                'add_later' => 'You will be able to add test cases from the question details page.',
            ],
        ],
        'edit' => [
            'title' => 'Edit Question',
            'buttons' => [
                'update' => 'Update Question',
            ],
            'current_file' => 'Current Question File',
            'new_file_preview' => 'New File Preview',
            'current_file_preview' => 'Current File Preview',
            'preview' => 'File Preview',
            'no_preview_available' => 'No preview available for this file type',
            'test_cases' => [
                'title' => 'Test Cases',
                'description' => 'You can manage test cases for this live coding question',
                'manage_button' => 'Manage Test Cases',
            ],
        ],
        'show' => [
            'title' => 'Question Details',
            'question_file' => 'Question File',
            'sections' => [
                'information' => 'Information',
                'test_cases' => 'Test Cases',
            ],
        ],
    ],
    'learning_material_question_test_case' => [
        'common' => [
            'fields' => [
                'description' => 'Test Description',
                'input' => 'Input',
                'output' => 'Output',
                'expected_output' => 'Expected Output',
                'output_type' => 'Output Type',
                'hidden' => 'Hidden Test',
                'active' => 'Active Status',
                'explanation' => 'Explanation',
                'status' => 'Status',
                'language' => 'Programming Language',
                'visibility' => 'Visibility',
            ],
            'help' => [
                'description' => 'Describe what this test case is checking for',
                'input' => 'Enter code or sample input for testing the question',
                'expected_output' => 'Upload a PDF or image file showing the expected output for this test case',
                'hidden' => 'Hidden tests are only visible to teachers and used for grading',
                'language' => 'Select the programming language for this test case',
            ],
            'validations' => [
                'description' => [
                    'required' => 'Test description is required',
                ],
            ],
            'status' => [
                'active' => 'Active',
                'inactive' => 'Inactive',
            ],
            'visibility' => [
                'hidden' => 'Hidden',
                'visible' => 'Visible',
            ],
            'messages' => [
                'not_found' => 'Test case not found',
                'pending' => [
                    'create' => 'Creating test case...',
                    'update' => 'Updating test case...',
                    'delete' => 'Deleting test case...',
                    'toggle' => 'Updating test case visibility...',
                ],
                'success' => [
                    'create' => 'Test case created successfully',
                    'update' => 'Test case updated successfully',
                    'delete' => 'Test case deleted successfully',
                    'toggle' => 'Test case visibility updated successfully',
                ],
                'error' => [
                    'create' => 'Error creating test case',
                    'update' => 'Error updating test case',
                    'delete' => 'Error deleting test case',
                    'toggle' => 'Error updating test case visibility',
                ],
            ],
            'placeholders' => [
                'language' => 'Select a language',
                'input' => 'Enter test case input',
                'expected_output' => 'Enter expected output',
                'description' => 'Enter test case description',
            ],
            'confirmations' => [
                'toggle_visibility' => [
                    'title' => 'Confirm Visibility Change',
                    'message' => 'Are you sure you want to change the visibility of this test case?',
                    'show' => 'now',
                    'hide' => 'no longer',
                    'confirm' => 'Yes, change visibility',
                    'cancel' => 'Cancel',
                ],
                'delete' => [
                    'title' => 'Confirm Deletion',
                    'message' => 'Are you sure you want to delete this test case? This action cannot be undone.',
                    'confirm' => 'Yes, delete',
                    'cancel' => 'Cancel',
                ],
            ],
            'confirmation' => [
                'toggle' => [
                    'title' => 'Confirm Visibility Change',
                    'message' => 'Are you sure you want to change the visibility of this test case?',
                ],
            ],
            'sections' => [
                'details' => 'Test Case Details',
            ],
            'debug_section' => [
                'title' => 'Test Case Debugging',
                'description' => 'Debug your test case by running it against example code. Use "student_code" in your test case to refer to the code being tested.',
            ],
            'debug_dialog' => [
                'title' => 'Debug Test Case',
            ],
            'actions' => [
                'create' => 'Create Test Case',
                'edit' => 'Edit Test Case',
                'delete' => 'Delete Test Case',
                'make_visible' => 'Make Visible',
                'make_hidden' => 'Make Hidden',
                'toggle_status' => 'Toggle Status',
                'debug' => 'Debug Test Case',
            ],
        ],
        'no_test_cases' => [
            'title' => 'No Test Cases Found',
            'message' => 'There are no test cases for this learning material question yet. Create a test case to get started.',
            'add_button' => 'Add Test Case',
        ],
        'index' => [
            'title' => 'Test Cases',
            'buttons' => [
                'create' => 'Add Test Case',
            ],
            'empty_state' => 'No test cases found',
        ],
        'create' => [
            'title' => 'Create Test Case',
            'buttons' => [
                'create' => 'Create Test Case',
            ],
            'file_preview' => 'File Preview',
            'preview' => 'File Preview',
            'no_preview_available' => 'No preview available for this file type',
        ],
        'edit' => [
            'title' => 'Edit Test Case',
            'buttons' => [
                'update' => 'Update Test Case',
            ],
            'current_file' => 'Current File',
            'new_file_preview' => 'New File Preview',
            'current_file_preview' => 'Current File Preview',
            'preview' => 'File Preview',
            'no_preview_available' => 'No preview available for this file type',
        ],
        'show' => [
            'title' => 'Test Case Details',
            'hidden' => 'Hidden',
            'visible' => 'Visible',
            'expected_output_file' => 'Expected Output File',
            'sections' => [
                'details' => 'Test Case Details',
            ],
        ],
        'import' => [
            'title' => 'Import Test Cases',
            'description' => 'Upload a CSV or Excel file to import test cases in bulk',
            'template' => [
                'title' => 'Download Template',
                'description' => 'Download a template file with the correct format',
            ],
            'preview' => [
                'title' => 'Import Preview',
                'total_rows' => 'Total rows: :count',
                'row_number' => 'Row #',
            ],
            'buttons' => [
                'download_csv' => 'Download CSV Template',
                'download_excel' => 'Download Excel Template',
                'preview' => 'Preview',
                'back' => 'Back',
                'confirm_import' => 'Confirm Import',
                'import' => 'Import Test Cases',
                'cancel' => 'Cancel',
            ],
            'messages' => [
                'downloading_template' => 'Downloading template...',
                'download_success' => 'Template downloaded successfully',
                'download_error' => 'Failed to download template',
                'previewing' => 'Analyzing import file...',
                'preview_success' => 'Preview loaded successfully',
                'preview_error' => 'Failed to preview file',
                'importing' => 'Importing test cases...',
                'import_success' => 'Test cases imported successfully',
                'import_error' => 'Failed to import test cases',
            ],
            'upload' => [
                'title' => 'Upload Test Cases',
            ],
        ],
    ],
    'profile' => [
        'edit' => [
            'title' => 'Profile Settings',
            'tabs' => [
                'profile' => 'Profile',
                'password' => 'Password',
                'danger' => 'Danger Zone',
            ],
        ],
        'sections' => [
            'information' => 'Profile Information',
            'password' => 'Update Password',
            'delete_account' => 'Delete Account',
        ],
        'descriptions' => [
            'information' => 'Update your account\'s profile information and email address.',
            'password' => 'Ensure your account is using a long, random password to stay secure.',
            'delete_account' => 'Once your account is deleted, all of its resources and data will be permanently deleted.',
        ],
        'fields' => [
            'name' => 'Name',
            'username' => 'Username',
            'email' => 'Email',
            'current_password' => 'Current Password',
            'new_password' => 'New Password',
            'confirm_password' => 'Confirm Password',
            'password' => 'Password',
        ],
        'validations' => [
            'name' => [
                'required' => 'Name is required',
            ],
            'username' => [
                'required' => 'Username is required',
            ],
            'email' => [
                'required' => 'Email is required',
                'invalid' => 'Please enter a valid email address',
            ],
            'current_password' => [
                'required' => 'Current password is required',
            ],
            'password' => [
                'min' => 'Password must be at least 8 characters',
                'required' => 'Password is required',
                'required_for_deletion' => 'Password is required to confirm account deletion',
            ],
            'password_confirmation' => [
                'required' => 'Please confirm your password',
                'match' => 'The password confirmation does not match',
            ],
        ],
        'buttons' => [
            'save' => 'Save',
            'delete_account' => 'Delete Account',
            'cancel' => 'Cancel',
            'confirm_delete' => 'Delete Account',
        ],
        'messages' => [
            'success' => [
                'update' => 'Profile updated successfully',
                'password' => 'Password updated successfully',
                'delete' => 'Account deleted successfully',
            ],
            'error' => [
                'update' => 'There was an error updating your profile',
                'password' => 'There was an error updating your password',
                'delete' => 'There was an error deleting your account',
            ],
        ],
        'verification' => [
            'title' => 'Email Verification',
            'message' => 'Your email address is unverified.',
            'resend_link' => 'Click here to resend the verification email',
            'sent' => 'A new verification link has been sent to your email address.',
        ],
        'upload' => [
            'label' => 'Drag & drop your profile picture or <span class="filepond--label-action">Browse</span>',
            'hint' => 'Recommended: Square image, max 1MB (.jpg, .png)',
        ],
        'warnings' => [
            'delete_account' => 'This action cannot be undone. This will permanently delete your account and all associated data.',
        ],
        'delete_dialog' => [
            'title' => 'Are you sure?',
            'description' => 'Once your account is deleted, all of its resources and data will be permanently deleted. Please enter your password to confirm you would like to permanently delete your account.',
        ],
    ],
    'student_courses' => [
        'common' => [
            'fields' => [
                'name' => 'Name',
                'classroom' => 'Classroom',
                'description' => 'Description',
                'progress' => 'Progress',
                'progress_label' => 'Questions Completed',
            ],
        ],
        'index' => [
            'title' => 'My Courses',
            'progress' => 'Progress',
            'progress_label' => 'Questions Completed',
        ],
        'show' => [
            'title' => 'Course Details',
        ],
        'actions' => [
            'back_to_list' => 'Back to List',
            'back_to_home' => 'Back to Home',
            'back_to_dashboard' => 'Back to Dashboard',
            'back_to_courses' => 'Back to Courses',
            'back_to_course' => 'Back to Course',
            'back_to_material' => 'Back to Material',
        ],
    ],

    'student_materials' => [
        'common' => [
            'fields' => [
                'title' => 'Title',
                'type' => 'Type',
                'description' => 'Description',
            ],
        ],
        'index' => [
            'title' => 'Learning Materials',
        ],
        'show' => [
            'title' => 'Material Details',
            'progress' => 'Your Progress',
            'questions' => 'Questions',
            'completed' => ':count of :total questions completed',
            'completed_label' => 'Completed',
            'in_progress' => 'In Progress',
            'score' => 'Score',
            'continue' => 'Continue',
            'start' => 'Start',
            'next_material' => 'Next Material',
        ],
    ],

    'student_questions' => [
        'workspace' => [
            'question' => 'Question',
            'time' => 'Time',
            'time_spent' => 'Time Spent',
            'view_image' => 'Question Image',
            'clue' => 'Hint',
            'test_cases' => 'Test Cases',
            'code' => 'Code',
            'output' => 'Output',
            'run' => 'Run Code',
            'running' => 'Running',
            'next' => 'Next Question',
            'previous' => 'Previous Question',
            'run_first' => 'You must run your code at least once to proceed',
            'completed' => 'Completed',
            'no_output_yet' => 'No output yet. Run your code to see results.',
            'test_results' => 'Test Results',
            'passed' => ' passed',
            'success' => [
                'title' => 'Congratulations!',
                'description' => 'All tests passed successfully.',
            ],
            'error' => [
                'title' => 'Error Running Code',
                'description' => 'There was a problem executing your code. Please check for errors.',
            ],
            'view_material' => 'View Material',
            'side_by_side_view' => 'Side by Side View',
            'stacked_view' => 'Stacked View',
            'locked' => [
                'title' => 'Workspace Locked',
                'description' => 'Your workspace has been locked because you completed all questions in this material. You can re-attempt after the unlock period or wait for teacher approval.',
                'cannot_run' => 'Cannot run code while workspace is locked',
                'button' => 'Locked',
                'notification' => 'Workspace has been locked due to completion of all questions',
                'unlock_in' => 'Unlocks in',
                'unlock_now' => 'Available for unlock',
                'reattempt' => 'Re-attempt',
                'answer_locked' => 'Answer is locked. Cannot run code.',
                'answer_locked_button' => 'Answer Locked',
            ],
            'reattempt' => [
                'success' => 'Successfully reset workspace! You can now try again.',
                'error' => 'Failed to reset workspace. Please try again.',
            ],
            'test_cases_revealed' => 'Additional test cases have been revealed to help you debug your code!',
            'progressive_revelation' => [
                'failed_attempts_label' => 'Failed Attempts',
                'attempts_remaining' => 'more attempts until additional test cases are revealed',
                'all_revealed' => 'All additional test cases have been revealed',
                'test_case_revealed' => 'Test Case Revealed',
            ],
            'mark_as_done' => [
                'button' => 'Mark as Done',
                'success' => 'Question marked as done successfully!',
                'error' => 'Failed to mark question as done. Please try again.',
                'dialog' => [
                    'title' => 'Mark Question as Done',
                    'description' => 'Are you sure you want to mark this question as done? Once marked, you cannot modify your code unless you allow re-attempts.',
                    'warning_title' => 'Important Notice',
                    'warning_description' => 'Marking as done will finalize your current solution. You can allow re-attempts later if needed.',
                    'cancel' => 'Cancel',
                    'continue' => 'Continue Without Marking',
                    'mark_done' => 'Mark as Done',
                ],
            ],
            'allow_reattempt' => [
                'button' => 'Re-attempt',
                'success' => 'Re-attempt allowed successfully! The page will refresh.',
                'error' => 'Failed to allow re-attempt. Please try again.',
            ],
            'allow_reattempt_all' => [
                'button' => 'Re-attempt All Questions',
                'success' => 'Re-attempt allowed for all questions successfully! The page will refresh.',
                'error' => 'Failed to allow re-attempt for all questions. Please try again.',
                'dialog' => [
                    'title' => 'Re-attempt All Questions',
                    'description' => 'Are you sure you want to reset all questions in this material for re-attempt? This will mark all completed questions as not done.',
                    'warning_title' => 'Important Notice',
                    'warning_description' => 'This action will reset the completion status of all questions in this material.',
                    'cancel' => 'Cancel',
                    'confirm' => 'Re-attempt All',
                ],
            ],
            'close' => 'Close',
            'description' => 'Description',
            'material_file' => 'Material File',
            'expand_material' => 'Expand Material',
            'hide_material' => 'Hide Material',
            'show_material' => 'Show Material',
            'resize_panel' => 'Resize panel',
            'drag_panel' => 'Drag header to move panel',
        ],
    ],
    'dashboard' => [
        'common' => [
            'title' => 'Dashboard',
            'loading' => 'Loading dashboard data...',
            'no_data' => 'No data available',
            'chart_titles' => [
                'bar_chart' => 'Bar Chart',
                'pie_chart' => 'Pie Chart',
                'line_chart' => 'Line Chart',
                'area_chart' => 'Area Chart',
                'radar_chart' => 'Radar Chart',
                'radial_chart' => 'Radial Chart',
            ],
        ],
        'student' => [
            'title' => 'Student Dashboard',
            'subtitle' => 'View your learning progress here',
            'latest_work_progress' => [
                'title' => 'Latest Learning Progress',
                'description' => 'Continue learning from where you left off',
                'loading' => 'Loading data...',
                'no_progress' => 'No learning progress yet.',
                'course_label' => 'Course:',
                'material_label' => 'Material:',
                'current_question_label' => 'Current question progress:',
                'continue_button' => 'Continue Current Question',
                'skip_button' => 'Jump to Next Question',
                'start_next_button' => 'Start Next Question',
            ],
            'cognitive_classification' => [
                'title' => 'Cognitive Classification',
                'description' => 'Cognitive understanding level based on Bloom\'s taxonomy',
                'loading' => 'Loading course data...',
                'no_courses' => 'Not enrolled in any courses yet.',
                'classification_history_title' => 'Cognitive Classification History -',
                'classification_history_subtitle' => 'View cognitive level development and learning trends over time',
                'card' => [
                    'click_for_details' => 'Click to view detailed history',
                    'loading' => 'Loading...',
                    'no_classification' => 'No classification yet',
                    'last_classified' => 'Last:',
                ],
                'recommendations_title' => 'Course Recommendations',
                'recommendation_1' => 'Focus on foundational concepts',
                'recommendation_2' => 'Practice more exercises',
                'recommendation_3' => 'Review previous materials',
                'recommendation_4' => 'Seek additional help',
                'current_level' => 'Current Level',
                'score' => 'Score',
                'last_updated' => 'Last Updated',
                'materials_completed' => 'Materials Completed',
                'average_score' => 'Average Score',
                'dialog' => [
                    'loading_info' => 'Loading course information...',
                    'no_data' => 'No classification data available for this course yet.',
                    'summary_title' => 'Current Classification Summary',
                    'cognitive_level' => 'Cognitive Level',
                    'classification_score' => 'Classification Score',
                    'last_updated' => 'Last Updated',
                    'material_performance' => 'Material Performance',
                    'score_label' => 'Score:',
                    'recommendations' => [
                        'title' => 'Recommendations for Improvement',
                        'subtitle' => 'Personalized suggestions to help you advance your cognitive classification level',
                    ],
                    'statistics' => [
                        'title' => 'Performance Statistics',
                        'materials_completed' => 'Materials Completed',
                        'average_score' => 'Average Score',
                    ],
                ],
                'material_performance' => 'Material Performance',
                'additional_stats' => 'Additional Statistics',
                'no_recommendations' => 'No recommendations available',
                'loading_recommendations' => 'Loading recommendations...',
            ],
            'charts' => [
                'learning_progress' => [
                    'title' => 'Learning Progress',
                    'description' => 'Your progress over time',
                ],
                'cognitive_level' => [
                    'title' => 'Bloom\'s Cognitive Levels',
                    'description' => 'Distribution of cognitive complexity',
                ],
                'module_progress' => [
                    'title' => 'Module Progress',
                    'description' => 'Progress across learning modules',
                    'footer' => 'Questions completed per module',
                ],
                'score_trends' => [
                    'title' => 'Score Trends',
                    'description' => 'Track your performance improvements over time',
                ],
                'daily_activity' => [
                    'title' => 'Daily Activity',
                    'description' => 'Your daily coding time and session patterns',
                ],
                'weekly_streak' => [
                    'title' => 'Learning Streak',
                    'description' => 'Your consistency in daily learning activities',
                    'current_streak' => 'Current Streak',
                    'longest_streak' => 'Longest Streak',
                ],
                'time_analysis' => [
                    'title' => 'Time Analysis',
                    'description' => 'When you\'re most productive during the day',
                ],
                'difficulty_progression' => [
                    'title' => 'Difficulty Progression',
                    'description' => 'Your performance across different difficulty levels',
                ],
                'class_comparison' => [
                    'title' => 'Class Comparison',
                    'description' => 'How you compare to your classmates',
                    'class_rank' => 'Class Rank',
                    'percentile' => 'Percentile',
                    'completion_rate' => 'Completion Rate',
                    'you_label' => 'You',
                    'class_avg_label' => 'Class Avg',
                    'no_course_selected' => 'Please select a course to view class comparison',
                    'select_course_hint' => 'Use the course filter above to compare your progress with classmates',
                ],
                'achievements' => [
                    'title' => 'Achievements',
                    'description' => 'Your learning milestones and accomplishments',
                    'questions_completed' => 'Questions Completed',
                    'perfect_scores' => 'Perfect Scores',
                    'earned_badges' => 'Earned Badges',
                    'milestones' => 'Milestones',
                ],
                'common' => [
                    'loading' => 'Loading...',
                    'no_data' => 'No data available',
                    'no_streak_data' => 'No streak data available',
                    'no_time_data' => 'No time data available',
                    'no_achievement_data' => 'No achievement data available',
                ],
                'tabs' => [
                    'basic_progress' => 'Basic Progress',
                    'activity_analytics' => 'Activity & Analytics',
                    'achievements' => 'Achievements',
                ],
                'filters' => [
                    'title' => 'Filter Charts',
                    'course' => 'Course',
                    'time_period' => 'Time Period',
                    'start_date' => 'Start Date',
                    'end_date' => 'End Date',
                    'clear_filters' => 'Clear Filters',
                    'all_courses' => 'All Courses',
                    'select_course' => 'Select course',
                    'select_period' => 'Select period',
                    'periods' => [
                        'this_week' => 'This Week',
                        'this_month' => 'This Month',
                        'this_quarter' => 'This Quarter',
                        'this_year' => 'This Year',
                    ],
                ],
            ],
        ],
        'school_admin' => [
            'title' => 'School Admin Overview',
            'subtitle' => 'Summary dashboard for School',
            'charts' => [
                'population' => [
                    'title' => 'School Population (Bar Chart)',
                    'description' => 'Staff, Teachers, Students',
                    'footer' => 'Current Stats',
                ],
                'facilities' => [
                    'title' => 'School Facilities (Pie)',
                    'description' => 'Lab, Projectors, etc.',
                    'items_label' => 'Items',
                ],
                'class_development' => [
                    'title' => 'Class Development (Radar)',
                    'description' => 'January vs June',
                ],
                'level_performance' => [
                    'title' => 'Grade Performance (Radial Chart)',
                    'description' => 'Elementary, Middle, High School',
                ],
            ],
        ],
        'teacher' => [
            'title' => 'Teacher Dashboard',
            'subtitle' => 'Course and student progress overview',
            'chart_titles' => [
                'class_scores' => 'Class Scores',
                'class_scores_description' => 'Average scores by class',
                'module_completion' => 'Module Completion',
                'module_completion_description' => 'Status of module completion',
                'subject_mastery' => 'Subject Mastery',
                'subject_mastery_description' => 'Mastery level by subject',
                'top_students' => 'Top Students',
                'top_students_description' => 'Based on progress',
                'bloom_taxonomy' => 'Bloom\'s Taxonomy Distribution',
                'bloom_taxonomy_description' => 'Distribution of cognitive levels',
                'question_difficulty' => 'Question Difficulty',
                'question_difficulty_description' => 'Easy/Medium/Hard distribution',
                'student_progress' => 'Student Progress',
                'student_progress_description' => 'Completion status overview',
                'time_spent' => 'Time Spent Analysis',
                'time_spent_description' => 'Average time per module',
            ],
            'labels' => [
                'completed' => 'Completed',
                'in_progress' => 'In Progress',
                'not_started' => 'Not Started',
                'top_student' => 'Top Student',
                'class_average' => 'Class Average',
                'expected' => 'Expected',
                'actual' => 'Actual',
                'students' => 'Students',
                'modules' => 'Modules',
                'questions' => 'Questions',
                'easy' => 'Easy',
                'medium' => 'Medium',
                'hard' => 'Hard',
            ],
            'taxonomy_levels' => [
                'remember' => 'Remember',
                'understand' => 'Understand',
                'apply' => 'Apply',
                'analyze' => 'Analyze',
                'evaluate' => 'Evaluate',
                'create' => 'Create',
            ],
            'stats' => [
                'total_students' => 'Total Students',
                'active_students' => 'Active Students',
                'total_courses' => 'Total Courses',
                'total_materials' => 'Total Materials',
                'total_questions' => 'Total Questions',
                'average_score' => 'Average Score',
                'completion_rate' => 'Completion Rate',
                'pass_rate' => 'Pass Rate',
            ],
            'latest_progress' => [
                'title' => 'Latest Student Progress',
                'description' => 'Recent student activity and progress updates',
                'labels' => [
                    'course' => 'Course',
                    'material' => 'Material',
                    'question' => 'Question',
                    'score' => 'Score',
                    'time_spent' => 'Time Spent',
                    'students' => 'Students',
                    'recent_activity' => 'Recent Activity',
                    'no_progress' => 'No Progress',
                ],
                'status' => [
                    'completed' => 'Completed',
                    'in_progress' => 'In Progress',
                    'started' => 'Started',
                ],
                'no_activity' => [
                    'title' => 'No Recent Activity',
                    'description' => 'No recent student activity to display.',
                ],
                'showing_recent' => 'Showing :count most recent activities (of :total total)',
                'showing_recent_for_course' => 'Showing :count most recent activities for :course',
                'tabs' => [
                    'overview' => 'Overview',
                    'courses' => 'Courses',
                    'recent_progress' => 'Recent Progress',
                    'no_progress' => 'Students with No Progress',
                ],
                'no_progress' => [
                    'title' => 'Students with No Progress',
                    'students_count' => 'students',
                    'columns' => [
                        'name' => 'Student Name',
                        'email' => 'Email',
                        'status' => 'Status',
                    ],
                    'status' => [
                        'not_started' => 'Not Started',
                    ],
                    'all_students_active' => [
                        'title' => 'All Students Active!',
                        'description' => 'All students in this course have started working on the materials.',
                    ],
                ],
                'loading' => [
                    'no_progress_data' => 'Loading students data...',
                ],
                'dialog' => [
                    'course_progress_title' => 'Course Progress',
                ],
            ],
        ],
        'admin' => [
            'title' => 'Admin Overview',
            'subtitle' => 'Dashboard ringkasan untuk Administrator',
            'charts' => [
                'users_bar' => [
                    'title' => 'Users (Bar Chart)',
                    'description' => '6-month Growth',
                    'footer' => 'Trending up',
                ],
                'user_roles_pie' => [
                    'title' => 'User Roles (Pie Chart)',
                    'description' => 'Admin / Guru / Siswa',
                    'total_label' => 'total',
                ],
                'site_visits_line' => [
                    'title' => 'Site Visits (Line Chart)',
                    'description' => 'One-week data',
                ],
                'radar_example' => [
                    'title' => 'Radar Chart Example',
                    'description' => 'January vs June',
                ],
            ],
        ],
        'student_tracking' => [
            'title' => 'Student Task Tracking System',
            'description' => 'Track student progress through courses, materials, and questions',
            'no_data' => [
                'title' => 'No data available',
                'description' => 'No student progress data is currently available.',
            ],
            'no_courses' => [
                'title' => 'No Courses Available',
                'subtitle' => 'Please check back later.',
                'description' => 'No courses are currently available for tracking.',
            ],
            'loading' => [
                'dashboard_data' => 'Loading dashboard data...',
                'progress_data' => 'Loading student progress data...',
                'course_details' => 'Loading course details...',
                'student_details' => 'Loading student details...',
            ],
            'tabs' => [
                'overview' => 'Overview',
                'courses' => 'Courses',
                'students' => 'Students',
            ],
            'sections' => [
                'learning_materials' => 'Learning Materials',
                'course_completion' => 'Course Completion Overview',
                'top_students' => 'Top Performing Students',
            ],
            'stats' => [
                'total_courses' => 'Total Courses',
                'total_students' => 'Total Students',
                'completed_courses' => 'Completed Courses',
            ],
            'labels' => [
                'students' => 'students',
                'materials' => 'materials',
                'avg_completion' => 'Avg. Completion',
                'questions' => 'questions',
                'complete' => 'Complete',
                'courses' => 'courses',
                'enrolled_in' => 'Enrolled in',
                'students_enrolled' => 'students enrolled',
            ],
            'columns' => [
                'student' => 'Student',
                'completed' => 'Completed',
                'progress' => 'Progress',
                'status' => 'Status',
                'material' => 'Material',
                'courses' => 'Courses',
                'avg_score' => 'Avg. Score',
                'student_name' => 'Student Name',
                'actions' => 'Actions',
            ],
            'status' => [
                'complete' => 'Complete',
                'in_progress' => 'In Progress',
                'not_started' => 'Not Started',
            ],
            'actions' => [
                'view_details' => 'View Details',
                'view_progress' => 'View Progress',
            ],
            'instructions' => [
                'click_student' => 'Click on a student to view their detailed progress across all courses and materials.',
            ],
            'dialogs' => [
                'course_details' => [
                    'title' => 'Course Details: :name',
                    'description' => 'Student progress for each learning material',
                ],
                'student_progress' => [
                    'title' => 'Student Progress: :name',
                    'description' => 'Detailed progress across all courses and materials',
                ],
            ],
        ],
        'active_users' => [
            'title' => 'Active Users',
            'description' => 'Users currently online in the last 15 minutes',
            'no_active_users' => 'No active users at the moment',
            'loading' => 'Loading active users...',
            'error_loading' => 'Failed to load active users',
            'total_active' => 'active',
            'users_count' => ' users',
            'and_more' => 'and :count more...',
            'last_updated' => 'Last updated',
        ],
        'admin' => [
            'title' => 'Admin Overview',
            'subtitle' => 'Dashboard ringkasan untuk Administrator',
            'charts' => [
                'users_bar' => [
                    'title' => 'Users (Bar Chart)',
                    'description' => '6-month Growth',
                    'footer' => 'Trending up',
                ],
                'user_roles_pie' => [
                    'title' => 'User Roles (Pie Chart)',
                    'description' => 'Admin / Guru / Siswa',
                    'total_label' => 'total',
                ],
                'site_visits_line' => [
                    'title' => 'Site Visits (Line Chart)',
                    'description' => 'One-week data',
                ],
                'radar_example' => [
                    'title' => 'Radar Chart Example',
                    'description' => 'January vs June',
                ],
            ],
        ],
        'student_tracking' => [
            'title' => 'Student Task Tracking System',
            'description' => 'Track student progress through courses, materials, and questions',
            'no_data' => [
                'title' => 'No data available',
                'description' => 'No student progress data is currently available.',
            ],
            'no_courses' => [
                'title' => 'No Courses Available',
                'subtitle' => 'Please check back later.',
                'description' => 'No courses are currently available for tracking.',
            ],
            'loading' => [
                'dashboard_data' => 'Loading dashboard data...',
                'progress_data' => 'Loading student progress data...',
                'course_details' => 'Loading course details...',
                'student_details' => 'Loading student details...',
            ],
            'tabs' => [
                'overview' => 'Overview',
                'courses' => 'Courses',
                'students' => 'Students',
            ],
            'sections' => [
                'learning_materials' => 'Learning Materials',
                'course_completion' => 'Course Completion Overview',
                'top_students' => 'Top Performing Students',
            ],
            'stats' => [
                'total_courses' => 'Total Courses',
                'total_students' => 'Total Students',
                'completed_courses' => 'Completed Courses',
            ],
            'labels' => [
                'students' => 'students',
                'materials' => 'materials',
                'avg_completion' => 'Avg. Completion',
                'questions' => 'questions',
                'complete' => 'Complete',
                'courses' => 'courses',
                'enrolled_in' => 'Enrolled in',
                'students_enrolled' => 'students enrolled',
            ],
            'columns' => [
                'student' => 'Student',
                'completed' => 'Completed',
                'progress' => 'Progress',
                'status' => 'Status',
                'material' => 'Material',
                'courses' => 'Courses',
                'avg_score' => 'Avg. Score',
                'student_name' => 'Student Name',
                'actions' => 'Actions',
            ],
            'status' => [
                'complete' => 'Complete',
                'in_progress' => 'In Progress',
                'not_started' => 'Not Started',
            ],
            'actions' => [
                'view_details' => 'View Details',
                'view_progress' => 'View Progress',
            ],
            'instructions' => [
                'click_student' => 'Click on a student to view their detailed progress across all courses and materials.',
            ],
            'dialogs' => [
                'course_details' => [
                    'title' => 'Course Details: :name',
                    'description' => 'Student progress for each learning material',
                ],
                'student_progress' => [
                    'title' => 'Student Progress: :name',
                    'description' => 'Detailed progress across all courses and materials',
                ],
            ],
        ],
    ],
    'student_cognitive_classification' => [
        'index' => [
            'title' => 'Student Cognitive Classifications',
        ],
        'create' => [
            'title' => 'Create Student Cognitive Classification',
        ],
        'edit' => [
            'title' => 'Edit Student Cognitive Classification',
        ],
        'show' => [
            'title' => 'Student Cognitive Classification Details',
        ],
        'columns' => [
            'student' => 'Student',
            'course' => 'Course',
            'classification_type' => 'Classification Type',
            'classification_level' => 'Classification Level',
            'classification_score' => 'Classification Score',
            'classified_at' => 'Classified At',
        ],
        'fields' => [
            'user_id' => 'Student',
            'course_id' => 'Course',
            'course' => 'Course',
            'classification_type' => 'Classification Type',
            'classification_level' => 'Classification Level',
            'classification_score' => 'Classification Score',
            'raw_data' => 'Raw Data',
            'classified_at' => 'Classified At',
            'export_format' => 'Export Format',
            'include_classification' => 'Include Classification Results',
            'include_classification_description' => 'Include cognitive classification results in the export sheet',
        ],
        'placeholders' => [
            'select_student' => 'Select a student',
            'select_course' => 'Select a course',
            'select_classification_type' => 'Select classification type',
            'select_export_format' => 'Select export format',
        ],
        'export_formats' => [
            'raw' => 'Raw Data Format',
            'ml_tool' => 'ML Tool Format (RapidMiner)',
        ],
        'buttons' => [
            'run_classification' => 'Run Classification',
            'start_classification' => 'Start Classification',
            'export_excel' => 'Export Classifications',
            'export_raw_data' => 'Export Raw Data',
            'start_export' => 'Start Export',
        ],
        'dialogs' => [
            'classification' => [
                'title' => 'Run Cognitive Classification',
                'description' => 'Select a course and classification type to run the cognitive classification process for all students in the course.',
            ],
            'export' => [
                'title' => 'Export Classifications',
                'description' => 'This will export all classification data to an Excel file',
            ],
            'export_raw_data' => [
                'title' => 'Export Raw Classification Data',
                'description' => 'This will export the raw student data used for classification to an Excel file. Select a course to export data for.',
            ],
            'delete' => [
                'title' => 'Delete Classification',
                'description' => 'Are you sure you want to delete this classification? This action cannot be undone.',
            ],
        ],
        'messages' => [
            'classification_running' => 'Running classification process...',
            'classification_success' => 'Classification completed successfully',
            'classification_error' => 'Error running classification',
            'export_started' => 'Export started. Your download will begin shortly.',
            'raw_data_export_started' => 'Raw data export started. Your download will begin shortly.',
            'deleting' => 'Deleting classification...',
            'delete_success' => 'Classification deleted successfully',
            'delete_error' => 'Error deleting classification',
        ],
        'sections' => [
            'classifications' => 'Cognitive Classifications',
        ],
        'descriptions' => [
            'classifications' => 'View all student cognitive classifications in the system',
        ],
        'classification_types' => [
            'topsis' => 'TOPSIS Method',
            'fuzzy' => 'Fuzzy Logic',
            'neural' => 'Neural Network',
        ],
    ],
    'test_case_change_tracker' => [
        'index' => [
            'title' => 'Test Case Change Tracking',
        ],
        'sections' => [
            'upcoming' => 'Upcoming Re-Executions',
            'history' => 'Execution History',
        ],
        'tabs' => [
            'upcoming' => 'Upcoming',
            'history' => 'History',
        ],
        'columns' => [
            'course' => 'Course',
            'material' => 'Learning Material',
            'question' => 'Question',
            'change_type' => 'Change Type',
            'affected_students' => 'Affected Students',
            'time_remaining' => 'Time Remaining',
            'actions' => 'Actions',
            'status' => 'Status',
            'scheduled_at' => 'Scheduled At',
            'completed_at' => 'Completed At',
        ],
        'change_types' => [
            'created' => 'Created',
            'updated' => 'Updated',
            'deleted' => 'Deleted',
        ],
        'status' => [
            'pending' => 'Pending',
            'in_progress' => 'In Progress',
            'completed' => 'Completed',
            'failed' => 'Failed',
            'imminent' => 'Imminent',
        ],
        'buttons' => [
            'execute_now' => 'Execute Now',
        ],
        'stats' => [
            'pending' => 'Pending Re-Executions',
            'completed' => 'Completed Re-Executions',
            'failed' => 'Failed Re-Executions',
            'pending_description' => 'Test case changes awaiting re-execution',
            'completed_description' => 'Successfully completed re-executions',
            'failed_description' => 'Re-executions that encountered errors',
        ],
        'labels' => [
            'total' => 'total',
            'passed' => 'passed',
            'failed' => 'failed',
        ],
        'messages' => [
            'pending' => [
                'execute' => 'Executing student code validation...',
            ],
            'success' => [
                'execute' => 'Execution queued successfully',
            ],
            'error' => [
                'execute' => 'Failed to queue execution',
            ],
        ],
    ],

    'classification' => [
        'dialog' => [
            'title' => 'Classification Details',
            'description' => 'Detailed steps of the classification process',
        ],
        'material_dialog' => [
            'title' => 'Material Classification Details',
            'description' => 'Detailed information about the material cognitive classification',
        ],
        'course_dialog' => [
            'title' => 'Course Classification Details',
            'description' => 'Detailed information about the course cognitive classification',
        ],
        'report_dialog' => [
            'title' => 'Cognitive Classification Report',
        ],
        'cards' => [
            'benefit_criteria' => 'Benefit Criteria',
            'cost_criteria' => 'Cost Criteria',
            'classification_result' => 'Classification Result',
            'rule_base_mapping' => 'Rule Base Mapping',
            'calculation_process' => 'Calculation Process',
            'classification_overview' => 'Classification Overview',
            'material_details' => 'Material Details',
            'material_classification' => 'Material Classification',
            'recommendations' => 'Recommendations',
            'areas_for_improvement' => 'Areas for Improvement',
            'question_performance' => 'Question Performance',
            'additional_information' => 'Additional Information',
            'test_case_metrics' => 'Test Case Metrics',
            'classification_history_memory' => 'Classification History (Memory Test)',
        ],
        'section_headers' => [
            'column_sums' => 'Column Sums',
            'normalized_matrix' => 'Normalized Matrix',
            'weights' => 'Weights',
            'weighted_matrix' => 'Weighted Matrix',
            'ideal_solutions' => 'Ideal Solutions',
            'performance_scores' => 'Performance Scores',
            'final_score' => 'Final Score',
            'final_level' => 'Final Level',
            'material_classifications' => 'Material Classifications',
            'calculation_details' => 'Calculation Details',
            'students_by_level' => 'Students by Level',
            'cognitive_classification_report' => 'Cognitive Classification Report',
        ],
        'labels' => [
            'benefits' => 'Benefits:',
            'costs' => 'Costs:',
            'course' => 'Course:',
            'benefit_up' => 'Benefit ↑',
            'cost_down' => 'Cost ↓',
            'overall_test_case_completion' => 'Overall Test Case Completion',
            'no_test_case_metrics' => 'No test case metrics available.',
            'not_specified' => 'Not specified',
            'unknown_student' => 'Unknown Student',
            'unknown_material' => 'Unknown Material',
        ],
        'table_headers' => [
            'material' => 'Material',
            'material_name' => 'Material Name',
            'solution' => 'Solution',
            'alternative' => 'Alternative',
            'performance_score' => 'Performance Score (Ci)',
            'level' => 'Level',
            'score_range' => 'Score Range',
            'score' => 'Score',
            'question' => 'Question',
            'completed' => 'Completed',
            'total' => 'Total',
            'completion_rate' => 'Completion Rate',
            'compiles' => 'Compiles',
            'time_min' => 'Time (min)',
            'complete' => 'Complete',
            'trial' => 'Trial',
            'variables' => 'Variables',
            'functions' => 'Functions',
            'test_cases' => 'Test Cases',
            'compile_count' => 'compile_count',
            'coding_time' => 'coding_time',
            'trial_status' => 'trial_status',
            'completion_status' => 'completion_status',
            'variable_count' => 'variable_count',
            'function_count' => 'function_count',
            'test_case_rate' => 'test_case_rate',
        ],
        'status' => [
            'loading' => 'Loading classification details...',
            'error_title' => 'Error',
            'error_message' => 'Failed to load classification details',
            'material_error' => 'Error loading material classification details. Please try again.',
            'material_error_failed' => 'Failed to load material classification details',
        ],
    ],

    // Sandbox
    'sandbox' => [
        'buttons' => [
            'submit' => 'Submit',
        ],
    ],

    'welcome' => [
        'meta' => [
            'title' => 'Codeasy - Python and Data Science Learning',
            'description' => 'Codeasy is a Python learning platform for Data Science with automatic cognitive analysis based on Bloom\'s Taxonomy.',
            'og_title' => 'Codeasy - Python and Data Science Learning',
            'og_description' => 'Interactive learning platform with autograding and automatic cognitive analysis.',
        ],
        'navbar' => [
            'brand' => 'Codeasy',
            'navigation' => [
                'features' => 'Features',
                'how_it_works' => 'How it Works',
                'testimonials' => 'Testimonials',
                'manual_book' => 'Manual Book',
                'questionnaire' => 'Questionnaire',
                'dashboard' => 'Dashboard',
                'login' => 'Login',
                'get_started' => 'Get Started',
            ],
            'aria' => [
                'toggle_navigation' => 'Toggle Navigation',
            ],
        ],
        'hero' => [
            'badge' => 'Powered by Machine Learning',
            'title' => 'Data Science Learning System',
            'rotating_words' => [
                'data_science' => 'Data Science',
                'data_analytics' => 'Data Analytics',
                'business_intelligence' => 'Business Intelligence',
            ],
            'subtitle' => 'Enhance your understanding of Python programming for Data Science with autograding system and automatic cognitive analysis based on Bloom\'s Taxonomy.',
            'cta' => [
                'get_started' => 'Get Started',
                'try_sandbox' => 'Try Sandbox',
            ],
            'code_editor' => [
                'filename' => 'cognitive_analysis.py',
                'language' => 'Python • Machine Learning',
                'comments' => [
                    'load_data' => '# Load student data',
                    'extract_features' => '# Extract features from student code submissions',
                    'extract_labels' => '# Extract existing cognitive level labels for training',
                    'split_data' => '# Split data for training and testing',
                    'train_classifier' => '# Train cognitive level classifier',
                    'predict_levels' => '# Predict cognitive levels',
                    'output_accuracy' => '# Output model accuracy and distribution',
                ],
                'bloom_levels' => [
                    'remembering' => 'Remembering',
                    'understanding' => 'Understanding',
                    'applying' => 'Applying',
                    'analyzing' => 'Analyzing',
                    'evaluating' => 'Evaluating',
                    'creating' => 'Creating',
                ],
                'output' => [
                    'model_accuracy' => 'Model accuracy:',
                    'cognitive_distribution' => 'Cognitive level distribution:',
                ],
                'legend' => [
                    'title' => 'Cognitive Level Analysis',
                    'auto_generated' => 'Auto-generated',
                    'analysis_result' => 'Real-time analysis shows 85% accuracy in cognitive level classification',
                    'levels' => [
                        'remembering' => 'Remembering',
                        'understanding' => 'Understanding',
                        'applying' => 'Applying',
                        'analyzing' => 'Analyzing',
                        'evaluating' => 'Evaluating',
                        'creating' => 'Creating',
                    ],
                ],
            ],
        ],
        'cognitive_analysis' => [
            'title' => 'Real-time Cognitive Analysis',
            'subtitle' => 'Based on Bloom\'s Taxonomy',
            'levels' => [
                'remembering' => 'Remembering',
                'understanding' => 'Understanding',
                'applying' => 'Applying',
                'analyzing' => 'Analyzing',
                'evaluating' => 'Evaluating',
                'creating' => 'Creating',
            ],
        ],
        'features' => [
            'badge' => 'Platform Features',
            'title' => 'Platform Features',
            'subtitle' => 'Complete learning solution for Python Data Science',
            'cards' => [
                'autograding' => [
                    'title' => 'Automatic Grading',
                    'description' => 'Instant feedback on your Python code with comprehensive test cases',
                ],
                'cognitive_analysis' => [
                    'title' => 'Cognitive Analysis',
                    'description' => 'Real-time assessment of learning progress based on Bloom\'s Taxonomy',
                ],
                'skkni_curriculum' => [
                    'title' => 'SKKNI Curriculum',
                    'description' => 'Curriculum based on Indonesian National Work Competency Standards for Data Science',
                ],
            ],
            'items' => [
                'autograding' => [
                    'title' => 'Automatic Grading',
                    'description' => 'Instant feedback on your Python code with comprehensive test cases',
                ],
                'cognitive_analysis' => [
                    'title' => 'Cognitive Analysis',
                    'description' => 'Real-time assessment of learning progress based on Bloom\'s Taxonomy',
                ],
                'interactive_learning' => [
                    'title' => 'Interactive Learning',
                    'description' => 'Hands-on programming exercises with live code execution',
                ],
                'progress_tracking' => [
                    'title' => 'Progress Tracking',
                    'description' => 'Detailed analytics on learning journey and skill development',
                ],
                'adaptive_system' => [
                    'title' => 'Adaptive System',
                    'description' => 'Personalized learning path based on individual performance',
                ],
                'real_time_feedback' => [
                    'title' => 'Real-time Feedback',
                    'description' => 'Immediate responses to code submissions and problem solving',
                ],
            ],
        ],
        'how_it_works' => [
            'badge' => 'Simple Process',
            'title' => 'How Codeasy Works',
            'subtitle' => 'Simple steps to master Data Science',
            'steps' => [
                'choose_material' => [
                    'title' => 'Choose Learning Material',
                    'description' => 'Select from our comprehensive Python and Data Science curriculum based on SKKNI standards',
                ],
                'learn_concepts' => [
                    'title' => 'Learn Core Concepts',
                    'description' => 'Study theoretical foundations with interactive examples and real-world applications',
                ],
                'coding_practice' => [
                    'title' => 'Practice Coding',
                    'description' => 'Write and execute Python code in our integrated development environment',
                ],
                'cognitive_analysis' => [
                    'title' => 'Get Cognitive Analysis',
                    'description' => 'Receive detailed assessment of your understanding level based on Bloom\'s Taxonomy',
                ],
            ],
        ],
        'statistics' => [
            'badge' => 'Platform Impact',
            'title' => 'Menciptakan Talenta Data Science Berkualitas',
            'subtitle' => 'Bergabung dengan ribuan pelajar dari berbagai institusi pendidikan di Indonesia',
            'stats' => [
                'active_students' => [
                    'number' => '10,000+',
                    'label' => 'Pelajar Aktif',
                ],
                'institutions' => [
                    'number' => '150+',
                    'label' => 'Institusi Pendidikan',
                ],
                'completion_rate' => [
                    'number' => '95%',
                    'label' => 'Tingkat Kelulusan',
                ],
                'industry_absorption' => [
                    'number' => '86%',
                    'label' => 'Alumni Terserap Industri',
                ],
            ],
        ],
        'testimonials' => [
            'badge' => 'Testimonials',
            'title' => 'What Students Say',
            'subtitle' => 'Feedback from our learning community',
            'reviews' => [
                'student_1' => [
                    'name' => 'Sarah Johnson',
                    'role' => 'Computer Science Student',
                    'quote' => 'Codeasy helped me understand Data Science concepts better than any other platform. The cognitive analysis is incredibly helpful.',
                ],
                'instructor_1' => [
                    'name' => 'Dr. Ahmad Rahman',
                    'role' => 'Data Science Instructor',
                    'quote' => 'The autograding system provides instant feedback that accelerated my students\' learning process significantly.',
                ],
                'student_2' => [
                    'name' => 'Maria Garcia',
                    'role' => 'Business Analytics Student',
                    'quote' => 'I love how the platform adapts to my learning pace and provides personalized challenges.',
                ],
            ],
            'items' => [
                'testimonial_1' => [
                    'content' => 'Codeasy helped me understand Data Science concepts better than any other platform. The cognitive analysis is incredibly helpful.',
                    'author' => 'Sarah Johnson',
                    'role' => 'Computer Science Student',
                ],
                'testimonial_2' => [
                    'content' => 'The autograding system provides instant feedback that accelerated my learning process significantly.',
                    'author' => 'Ahmad Rahman',
                    'role' => 'Data Science Enthusiast',
                ],
                'testimonial_3' => [
                    'content' => 'I love how the platform adapts to my learning pace and provides personalized challenges.',
                    'author' => 'Maria Garcia',
                    'role' => 'Business Analytics Student',
                ],
            ],
        ],
        'partners' => [
            'badge' => 'Our Partners',
            'title' => 'Trusted by Leading Institutions',
            'placeholder' => 'Partner Logo',
        ],
        'cta' => [
            'badge' => 'Get Started',
            'title' => 'Ready to Start Learning?',
            'subtitle' => 'Join thousands of students mastering Data Science with Codeasy',
            'buttons' => [
                'register_now' => 'Register Now',
                'learn_more' => 'Learn More',
            ],
            'button' => 'Get Started Now',
        ],
        'footer' => [
            'brand' => 'Codeasy',
            'description' => 'Empowering the next generation of Data Scientists with AI-powered learning platform and cognitive analysis.',
            'sections' => [
                'platform' => [
                    'title' => 'Platform',
                    'links' => [
                        'features' => 'Features',
                        'courses' => 'Courses',
                        'pricing' => 'Pricing',
                    ],
                ],
                'company' => [
                    'title' => 'Company',
                    'links' => [
                        'about_us' => 'About Us',
                        'blog' => 'Blog',
                        'careers' => 'Careers',
                    ],
                ],
                'legal' => [
                    'title' => 'Legal',
                    'links' => [
                        'privacy_policy' => 'Privacy Policy',
                        'terms_of_service' => 'Terms of Service',
                    ],
                ],
            ],
            'copyright' => '© :year Codeasy. All rights reserved.',
            'links' => [
                'privacy' => 'Privacy Policy',
                'terms' => 'Terms of Service',
                'contact' => 'Contact',
            ],
        ],
    ],

    // Student Score Export
    'student_score' => [
        'export' => [
            'title' => 'Student Scores Report - Completion Rates by Material',
            'course_label' => 'Course',
            'headers' => [
                'student_name' => 'Student Name',
                'student_id' => 'Student ID',
                'overall_average' => 'Overall Average (%)',
                'material_completion' => '(% Complete)',
            ],
            'filename' => 'student_scores_tabular_data',
            'dialog' => [
                'title' => 'Export Student Scores',
                'description' => 'Export Excel file showing completion rates for all students across materials. Each cell shows the percentage of completed test cases.',
                'course_label' => 'Course',
                'select_course_placeholder' => 'Select a course',
                'loading' => 'Loading...',
                'buttons' => [
                    'export_excel' => 'Export Excel',
                    'exporting' => 'Exporting...',
                ],
            ],
        ],
    ],

    // Classification pages localization
    'classification' => [
        'status' => [
            'material_error_failed' => 'Failed to load material classification details',
        ],
        'table_headers' => [
            'question' => 'Question',
            'compiles' => 'Compiles',
            'time_min' => 'Time (min)',
            'complete' => 'Complete',
            'trial' => 'Trial',
            'variables' => 'Variables',
            'functions' => 'Functions',
            'test_cases' => 'Test Cases',
        ],
        'labels' => [
            'benefits' => 'Benefits (Higher = Better)',
            'costs' => 'Costs (Lower = Better)',
            'benefit_up' => '↑',
        ],
        'cards' => [
            'material_classification' => 'Material Classification Details',
            'rule_base_mapping' => 'Rule Base Mapping',
            'recommendations' => 'Recommendations',
            'areas_for_improvement' => 'Areas for Improvement',
            'question_performance' => 'Question Performance Metrics',
            'additional_information' => 'Additional Information',
        ],
        'messages' => [
            'no_calculation_details' => 'No calculation details available',
            'no_question_metrics' => 'No question metrics available',
            'criteria_used' => 'Criteria Used',
        ],
    ],
];
