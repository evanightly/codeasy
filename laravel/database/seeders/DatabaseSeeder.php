<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use App\Support\Enums\RoleEnum;
use Illuminate\Database\Eloquent\Collection;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder {
    /**
     * Seed the application's database.
     */
    public function run(): void {
        // User::factory(10)->create();

        if (app()->isProduction()) {
            $this->call([
                PermissionSeeder::class,
                RoleSeeder::class,
            ]);

            $this->createSuperAdmin();
            $this->assignPermissionsToRole(Role::where('name', RoleEnum::SUPER_ADMIN)->first(), Permission::all());

            return;
        }

        $this->call([
            PermissionSeeder::class,
            RoleSeeder::class,
            UserSeeder::class,
        ]);

        $this->createSuperAdmin();
        $this->assignPermissionsToRole(Role::where('name', RoleEnum::SUPER_ADMIN)->first(), Permission::all());
        $this->createSchoolAdmin();
        // $this->assignPermissionsToRole(Role::where('name', RoleEnum::SCHOOL_ADMIN)->first(), Permission::query()->where('name', 'like', 'school-%')->get());
        $this->assignPermissionsToRole(Role::where('name', RoleEnum::SCHOOL_ADMIN)->first(), Permission::query()->whereIn('group', ['school'])->get());
        $this->createTeacher();
        // $this->assignPermissionsToRole(Role::where('name', RoleEnum::TEACHER)->first(), Permission::query()->where('name', 'like', 'teacher-%')->get());
        $this->assignPermissionsToRole(Role::where('name', RoleEnum::TEACHER)->first(), Permission::query()->whereIn('group', ['student', 'class', 'subject', 'exam'])->get());
        $this->createStudent();
        // $this->assignPermissionsToRole(Role::where('name', RoleEnum::STUDENT)->first(), Permission::query()->where('name', 'like', 'student-%')->get());
        $this->assignPermissionsToRole(Role::where('name', RoleEnum::STUDENT)->first(), Permission::query()->whereIn('group', ['subject', 'exam', 'result'])->get());
    }

    private function createSuperAdmin(): void {
        $superadmin = User::factory()->create([
            'name' => 'Super Admin',
            'username' => 'superadmin',
            'email' => 'superadmin@codeasy.com',
        ]);

        $superadmin->assignRole(RoleEnum::SUPER_ADMIN);
    }

    private function createSchoolAdmin(): void {
        $schoolAdmin = User::factory()->create([
            'name' => 'School Admin',
            'username' => 'schooladmin',
            'email' => 'schooladmin@codeasy.com',
        ]);

        $schoolAdmin->assignRole(RoleEnum::SCHOOL_ADMIN);
    }

    private function createTeacher(): void {
        $teacher = User::factory()->create([
            'name' => 'Teacher',
            'username' => 'teacher',
            'email' => 'teacher@codeasy.com',
        ]);

        $teacher->assignRole(RoleEnum::TEACHER);
    }

    private function createStudent(): void {
        $student = User::factory()->create([
            'name' => 'Student',
            'username' => 'student',
            'email' => 'student@codeasy.com',
        ]);

        $student->assignRole(RoleEnum::STUDENT);
    }

    private function assignPermissionsToRole(Role $role, Collection $permissions): void {
        $role->syncPermissions($permissions);
    }
}
