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
            'fields' => [
                'identifier' => 'Email or Username',
                'password' => 'Password',
                'remember' => 'Remember me',
            ],
            'buttons' => [
                'next' => 'Next',
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
        ],
        'register' => [
            'title' => 'Create an Account',
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
    ],
    'permission' => [
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
                ],
                'success' => [
                    'create' => 'School created successfully',
                    'update' => 'School updated successfully',
                    'delete' => 'School deleted successfully',
                    'assign_admin' => 'Administrator assigned successfully',
                    'unassign_admin' => 'Administrator removed successfully',
                    'assign_student' => 'Students assigned successfully',
                    'unassign_student' => 'Student removed successfully',
                ],
                'error' => [
                    'create' => 'Error creating school',
                    'update' => 'Error updating school',
                    'delete' => 'Error deleting school',
                    'assign_admin' => 'Error assigning administrator',
                    'unassign_admin' => 'Error removing administrator',
                    'assign_student' => 'Error assigning students',
                    'unassign_student' => 'Error removing student',
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
        ],
        'assign_admin' => [
            'title' => 'Assign School Administrator',
            'description' => 'Select a user to assign as school administrator',
            'buttons' => [
                'assign' => 'Assign Administrator',
                'cancel' => 'Cancel',
            ],
        ],
        'assign_student' => [
            'title' => 'Assign Students',
            'description' => 'Select students to assign to this school',
            'buttons' => [
                'assign' => 'Assign Students',
            ],
        ],
        'assign_student' => [
            'title' => 'Assign Student',
            'description' => 'Select a student to assign to this school',
            'buttons' => [
                'assign' => 'Assign Student',
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
                    'remove_student' => 'Removing student...',
                ],
                'success' => [
                    'create' => 'Classroom created successfully',
                    'update' => 'Classroom updated successfully',
                    'delete' => 'Classroom deleted successfully',
                    'assign_student' => 'Students assigned successfully',
                    'remove_student' => 'Student removed successfully',
                ],
                'error' => [
                    'create' => 'Error creating classroom',
                    'update' => 'Error updating classroom',
                    'delete' => 'Error deleting classroom',
                    'unauthorized' => 'You are not authorized to manage classrooms in this school',
                    'assign_student' => 'Error assigning students',
                    'remove_student' => 'Error removing student',
                ],
            ],
            'status' => [
                'active' => 'Active',
                'inactive' => 'Inactive',
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
            ],
            'placeholders' => [
                'name' => 'Enter course name',
                'description' => 'Enter course description',
                'classroom' => 'Select a classroom',
                'teacher' => 'Select a teacher',
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
                'file' => 'Question File',
                'file_extension' => 'File Extension',
                'status' => 'Status',
                'active' => 'Active Status',
            ],
            'placeholders' => [
                'title' => 'Enter question title',
                'description' => 'Enter question description or instructions',
                'clue' => 'Enter hint or clue for students',
            ],
            'help' => [
                'clue' => 'Provide a hint that students can view if they are stuck',
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
                'expected_output' => 'Expected Output',
                'output_type' => 'Output Type',
                'hidden' => 'Hidden Test',
                'active' => 'Active Status',
                'status' => 'Status',
                'language' => 'Programming Language',
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
            'messages' => [
                'not_found' => 'Test case not found',
                'pending' => [
                    'create' => 'Creating test case...',
                    'update' => 'Updating test case...',
                    'delete' => 'Deleting test case...',
                ],
                'success' => [
                    'create' => 'Test case created successfully',
                    'update' => 'Test case updated successfully',
                    'delete' => 'Test case deleted successfully',
                ],
                'error' => [
                    'create' => 'Error creating test case',
                    'update' => 'Error updating test case',
                    'delete' => 'Error deleting test case',
                ],
            ],
            'placeholders' => [
                'language' => 'Select a language',
            ],
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
];
