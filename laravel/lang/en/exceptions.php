<?php

return [
    'auth' => [
        'unauthorized' => 'You do not have permission to access this resource.',
        'role' => [
            'required' => 'The user must have ":role" role',
            'already_has' => 'User already has the ":role" role',
        ],
        'permission' => [
            'required' => 'The user must have ":permission" permission',
        ],
    ],
    'services' => [
        'school' => [
            'admin' => [
                'already_assigned' => 'User is already an administrator of this school.',
                'different_role' => 'User already has a different role in this school.',
            ],
            'teacher' => [
                'already_assigned' => 'User is already a teacher in this school.',
                'different_role' => 'User already has a different role in this school.',
            ],
            'student' => [
                'already_assigned' => 'User is already a student in this school.',
                'different_role' => 'User already has a different role in this school.',
            ],
        ],
        'classroom' => [
            'unauthorized' => 'Unauthorized to :action this classroom',
            'student' => [
                'already_assigned' => 'Student is already assigned to this classroom',
            ],
        ],
        'school_request' => [
            'already_processed' => 'SchoolRequest has already been processed',
        ],
    ],
    'repositories' => [
        'user' => [
            'school_required' => 'School ID is required for this intent',
        ],
    ],
    'validation' => [
        'permission' => [
            'invalid_format' => 'Invalid permission format. Must be: resource-action where action is one of: :actions',
        ],
    ],
    'generic' => [
        'not_found' => ':resource not found',
        'already_exists' => ':resource already exists',
        'in_use' => ':resource is currently in use and cannot be modified',
        'unauthorized' => 'You are not authorized to :action this :resource',
    ],
];
