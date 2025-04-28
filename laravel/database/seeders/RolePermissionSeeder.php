<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use App\Support\Enums\RoleEnum;
use Illuminate\Database\Seeder;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Assign permissions to roles based on their responsibilities
        $this->assignSuperAdminPermissions();
        $this->assignSchoolAdminPermissions();
        $this->assignTeacherPermissions();
        $this->assignStudentPermissions();
    }

    /**
     * Assign all permissions to super admin role
     */
    private function assignSuperAdminPermissions(): void
    {
        $role = Role::where('name', RoleEnum::SUPER_ADMIN)->first();
        
        if ($role) {
            // Super admin gets all permissions
            $this->assignPermissionsToRole($role, Permission::all());
            $this->info("Assigned all permissions to {$role->name} role");
        }
    }

    /**
     * Assign school admin permissions
     */
    private function assignSchoolAdminPermissions(): void
    {
        $role = Role::where('name', RoleEnum::SCHOOL_ADMIN)->first();
        
        if ($role) {
            // School admin permissions
            $permissions = Permission::query()
                ->whereIn('group', ['school', 'school-request', 'classroom', 'classroom-student'])
                ->get();
                
            $this->assignPermissionsToRole($role, $permissions);
            $this->info("Assigned " . $permissions->count() . " permissions to {$role->name} role");
        }
    }

    /**
     * Assign teacher permissions
     */
    private function assignTeacherPermissions(): void
    {
        $role = Role::where('name', RoleEnum::TEACHER)->first();
        
        if ($role) {
            // Teacher permissions
            $permissions = Permission::query()
                ->whereIn('group', [
                    'school-request', 
                    'student', 
                    'class', 
                    'subject', 
                    'exam', 
                    'course', 
                    'learning-material', 
                    'learning-material-question', 
                    'learning-material-question-test-case'
                ])
                ->get();
                
            $this->assignPermissionsToRole($role, $permissions);
            $this->info("Assigned " . $permissions->count() . " permissions to {$role->name} role");
        }
    }

    /**
     * Assign student permissions
     */
    private function assignStudentPermissions(): void
    {
        $role = Role::where('name', RoleEnum::STUDENT)->first();
        
        if ($role) {
            // Student permissions
            $permissions = Permission::query()
                ->whereIn('group', ['subject', 'exam', 'result'])
                ->get();
                
            $this->assignPermissionsToRole($role, $permissions);
            $this->info("Assigned " . $permissions->count() . " permissions to {$role->name} role");
        }
    }

    /**
     * Helper method to assign permissions to a role
     */
    private function assignPermissionsToRole(Role $role, $permissions): void
    {
        $role->syncPermissions($permissions);
    }

    /**
     * Output info message during seeding
     */
    private function info(string $message): void
    {
        if ($this->command) {
            $this->command->info($message);
        }
    }
}
