<?php

return [
    'generic_data_selector' => [
        'fields' => [
            'search_placeholder' => 'Search...',
            'select_placeholder' => 'Select',
        ],
        'actions' => [
            'clear_selection' => '-- Clear Selection --',
            'loading' => 'Loading...',
            'no_results' => 'No results found',
        ],
    ],
    'generic_filters' => [
        'fields' => [
            'search_placeholder' => 'Search...',
            'select_placeholder' => 'Select',
            'pagination_placeholder' => 'Items per page',
        ],
    ],
    'dropdown_menu' => [
        'sr_open_menu' => 'Open Menu',
    ],
    'dashboard_sidebar' => [
        'dashboard' => 'Dashboard',
        'admin' => [
            'title' => 'Admin',
            'users' => 'Users',
            'roles' => 'Roles',
            'permissions' => 'Permissions',
            'settings' => 'Settings',
        ],
        'academic' => [
            'title' => 'Academic',
            'schools' => 'Schools',
            'school_requests' => 'School Requests',
            'students' => 'Students',
            'teachers' => 'Teachers',
            'classes' => 'Classes',
            'subjects' => 'Subjects',
            'exams' => 'Exams',
            'grades' => 'Grades',
            'class_rooms' => 'Class Rooms',
            'courses' => 'Courses',
        ],
    ],
    'filepond' => [
        'labels' => [
            'label_idle' => 'Drag and drop files here or <span class="filepond--label-action">Browse</span>',
            'label_tap_to_cancel' => 'tap to cancel',
            'label_tap_to_retry' => 'tap to retry',
            'label_tap_to_undo' => 'tap to undo',
            'label_button_remove_item' => 'Remove',
            'label_button_process_item' => 'Upload',
            'label_button_undo_item_processing' => 'Undo',
            'label_button_retry_item_processing' => 'Retry',
            'label_button_process_item_upload' => 'Upload',
            'label_file_waiting_for_size_calculation' => 'Waiting for size...',
            'label_file_size_not_available' => 'Size not available',
            'label_file_loading_error' => 'Error during loading',
            'label_file_processing' => 'Uploading',
            'label_file_processing_complete' => 'Upload complete',
            'label_file_processing_aborted' => 'Upload cancelled',
            'label_file_processing_error' => 'Error during upload',
        ],
        'errors' => [
            'size_too_large' => 'File is too large. Maximum size is :filesize.',
            'file_type_not_allowed' => 'File type not supported.',
        ],
    ],
    'pdf_viewer' => [
        'document' => 'Document',
        'page_of_pages' => 'Page :current of :total',
        'error_loading' => 'Error loading PDF document',
        'no_preview' => 'PDF preview not available',
        'open_in_new_tab' => 'Open in new tab',
    ],
];
