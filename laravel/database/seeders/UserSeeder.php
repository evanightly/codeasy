<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use App\Models\School;
use App\Models\User;
use App\Support\Enums\RoleEnum;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class UserSeeder extends Seeder {
    private const TEST_DATA_COUNT = [
        'admins_per_school' => 1,
        'teachers_per_school' => 1,
        'students_per_school' => 5,
    ];

    public function run(): void {
        if (app()->isProduction()) {
            $this->seedProductionData();

            return;
        }

        $this->seedDevelopmentData();
    }

    private function seedProductionData(): void {
        $this->createSuperAdmin();
    }

    private function seedDevelopmentData(): void {
        $this->createSuperAdmin();
        $this->createDemoUsers();
    }

    public function createSchoolAdmins(School $school, ?int $count = null): Collection {
        $count = $count ?? self::TEST_DATA_COUNT['admins_per_school'];
        $admins = new Collection;

        for ($i = 1; $i <= $count; $i++) {
            $admin = User::factory()->create([
                'name' => "School {$school->id} Admin {$i}",
                'email' => "school{$school->id}admin{$i}@codeasy.com",
                'username' => "school{$school->id}admin{$i}",
            ]);

            $admin->assignRole(RoleEnum::SCHOOL_ADMIN);
            // Permission assignment is now handled by RolePermissionSeeder

            $school->users()->attach($admin->id, ['role' => RoleEnum::SCHOOL_ADMIN]);
            $admins->push($admin);
        }

        return $admins;
    }

    public function createTeachers(School $school, ?int $count = null): Collection {
        $count = $count ?? self::TEST_DATA_COUNT['teachers_per_school'];
        $teachers = new Collection;

        for ($i = 1; $i <= $count; $i++) {
            $teacher = User::factory()->create([
                'name' => "School {$school->id} Teacher {$i}",
                'email' => "school{$school->id}teacher{$i}@codeasy.com",
                'username' => "school{$school->id}teacher{$i}",
            ]);

            $teacher->assignRole(RoleEnum::TEACHER);
            // Permission assignment is now handled by RolePermissionSeeder

            $school->users()->attach($teacher->id, ['role' => RoleEnum::TEACHER]);
            $teachers->push($teacher);
        }

        return $teachers;
    }

    public function createStudents(School $school, ?int $count = null): Collection {
        $count = $count ?? self::TEST_DATA_COUNT['students_per_school'];
        $students = new Collection;

        for ($i = 1; $i <= $count; $i++) {
            $student = User::factory()->create([
                'name' => "School {$school->id} Student {$i}",
                'email' => "school{$school->id}student{$i}@codeasy.com",
                'username' => "school{$school->id}student{$i}",
            ]);

            $student->assignRole(RoleEnum::STUDENT);
            // Permission assignment is now handled by RolePermissionSeeder

            $school->users()->attach($student->id, ['role' => RoleEnum::STUDENT]);
            $students->push($student);
        }

        return $students;
    }

    public function createSuperAdmin(): User {
        // Create super admin directly without factory to avoid Faker dependency in production
        $superadmin = User::firstOrCreate(
            ['email' => 'superadmin@codeasy.com'],
            [
                'name' => 'Super Admin',
                'username' => 'superadmin',
                'email_verified_at' => now(),
                'password' => bcrypt('password'), // Consider using env variable for security
                'remember_token' => Str::random(10),
            ]
        );

        $superadmin->assignRole(RoleEnum::SUPER_ADMIN);
        // Permission assignment is now handled by RolePermissionSeeder

        return $superadmin;
    }

    private function createDemoUsers(): void {
        // Create demo accounts with default credentials
        User::factory()->create([
            'name' => 'School Admin',
            'username' => 'schooladmin',
            'email' => 'schooladmin@codeasy.com',
        ])->assignRole(RoleEnum::SCHOOL_ADMIN);

        User::factory()->create([
            'name' => 'Teacher',
            'username' => 'teacher',
            'email' => 'teacher@codeasy.com',
        ])->assignRole(RoleEnum::TEACHER);

        User::factory()->create([
            'name' => 'Student',
            'username' => 'student',
            'email' => 'student@codeasy.com',
        ])->assignRole(RoleEnum::STUDENT);
    }

    // This method is kept for backward compatibility but is no longer actively used
    // since permissions are now centrally managed in RolePermissionSeeder
    private function assignPermissionsToRole(Role $role, Collection $permissions): void {
        $role->syncPermissions($permissions);
    }
}
