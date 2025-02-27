<?php

/**
 * Current structure example:
 * following directory structure
 *
 * pages
 *   - component name
 *     - fields (for form fields)
 *     - messages (for flash messages)
 *     - buttons (for button names)
 *     - actions (for action names)
 *     - dialogs (for dialog element)
 *       - messages (for messages in dialog)
 *       - buttons (for button names in dialog)
 *       - actions (for action names in dialog)
 *   - components (for page components)
 *   - partials (for page partials)
 */

return [
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
                'avatar' => 'Avatar',
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
];
