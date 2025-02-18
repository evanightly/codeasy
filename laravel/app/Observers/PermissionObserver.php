<?php

namespace App\Observers;

use App\Models\Permission;
use App\Rules\Permission\PermissionNameValidation;
use Illuminate\Validation\ValidationException;

class PermissionObserver {
    /**
     * Set the permission group based on name
     */
    private function setPermissionGroup(Permission $permission): void
    {
        $validator = \Validator::make(
            ['name' => $permission->name],
            ['name' => new PermissionNameValidation],
        );

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        // Split the name by hyphens and set the group to the part before the action
        $parts = preg_split(
            '/-(create|import|read|read-all|read-partial|download|update|delete|import|export)$/',
            $permission->name,
            -1,
            PREG_SPLIT_DELIM_CAPTURE
        );

        $group = $parts[0];

        // Use updateQuietly to prevent infinite loop
        $permission->updateQuietly(['group' => $group]);
    }

    /**
     * Handle the Permission "created" event.
     */
    public function created(Permission $permission): void {
        $this->setPermissionGroup($permission);
    }

    /**
     * Handle the Permission "updated" event.
     */
    public function updated(Permission $permission): void {
        // Check if name was changed before setting group
        if ($permission->isDirty('name')) {
            $this->setPermissionGroup($permission);
        }
    }

    /**
     * Handle the Permission "deleted" event.
     */
    public function deleted(Permission $permission): void {
        //
    }

    /**
     * Handle the Permission "restored" event.
     */
    public function restored(Permission $permission): void {
        //
    }

    /**
     * Handle the Permission "force deleted" event.
     */
    public function forceDeleted(Permission $permission): void {
        //
    }
}
