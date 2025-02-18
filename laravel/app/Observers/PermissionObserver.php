<?php

namespace App\Observers;

use App\Models\Permission;
use App\Rules\Permission\PermissionNameValidation;
use Illuminate\Validation\ValidationException;

class PermissionObserver {
    /**
     * Handle the Permission "created" event.
     */
    public function created(Permission $permission): void {

        $validator = \Validator::make(
            ['name' => $permission->name],
            ['name' => new PermissionNameValidation],
        );

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        // Split the name by hyphens and set the group to the part before the action
        $parts = preg_split('/-(create|import|read|read-all|read-partial|download|update|delete|import|export)$/', $permission->name, -1, PREG_SPLIT_DELIM_CAPTURE);
        $group = $parts[0];
        $permission->group = $group;
        $permission->save();
    }

    /**
     * Handle the Permission "updated" event.
     */
    public function updated(Permission $permission): void {
        //
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
