<?php

namespace App\Http\Controllers;

use Illuminate\Routing\Controllers\Middleware;

abstract class Controller {
    protected function ajax(): bool {
        return !request()->inertia() && request()->expectsJson();
    }

    /**
     * Create a middleware for permission checking with multiple permissions
     *
     * @param  array  $permissions  Array of permissions to check
     * @param  array  $only  Array of methods the middleware applies to
     * @param  string  $type  Type of middleware ('permission' or 'role_or_permission')
     *
     * usage:
     * ```php
     * $userReadPermissions = [
     *     PermissionEnum::USER_READ->value,
     *     PermissionEnum::CLASS_ROOM_STUDENT_CREATE->value,
     *     PermissionEnum::CLASS_ROOM_STUDENT_READ->value,
     *     PermissionEnum::CLASS_ROOM_STUDENT_UPDATE->value,
     * ];
     *
     * return [
     *      new Middleware('permission:' . PermissionEnum::USER_CREATE->value, only: ['create', 'store']),
     *      new Middleware('permission:' . PermissionEnum::USER_UPDATE->value, only: ['edit', 'update']),
     *      self::createPermissionMiddleware($userReadPermissions, ['index', 'show']), // Using default 'permission' type
     *      new Middleware('permission:' . PermissionEnum::USER_DELETE->value, only: ['destroy']),
     * ];
     * ```
     */
    protected static function createPermissionMiddleware(
        array $permissions,
        array $only = [],
        array $allowedIntents = [],
        string $type = 'permission',
    ): Middleware {
        $permissionString = implode('|', $permissions);
        $allowedIntentsString = implode(',', $allowedIntents);

        return new Middleware(
            "intent_permission_override:{$permissionString},{$allowedIntentsString},{$type}",
            only: $only
        );
    }
}
