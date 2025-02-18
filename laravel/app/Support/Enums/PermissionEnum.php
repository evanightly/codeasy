<?php

namespace App\Support\Enums;

enum PermissionEnum: string {
    // Users Management
    case USER_CREATE = 'user-create';
    case USER_READ = 'user-read';
    case USER_UPDATE = 'user-update';
    case USER_DELETE = 'user-delete';

    // Permissions Management
    case PERMISSION_CREATE = 'permission-create';
    case PERMISSION_READ = 'permission-read';
    case PERMISSION_UPDATE = 'permission-update';
    case PERMISSION_DELETE = 'permission-delete';
}
