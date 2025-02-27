<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use App\Models\School;
use App\Models\User;
use App\Support\Enums\RoleEnum;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Seeder;

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
        $admins = new Collection();

        for ($i = 1; $i <= $count; $i++) {
            $admin = User::factory()->create([
                'name' => "School {$school->id} Admin {$i}",
                'email' => "school{$school->id}admin{$i}@codeasy.com",
                'username' => "school{$school->id}admin{$i}",
            ]);

            $admin->assignRole(RoleEnum::SCHOOL_ADMIN);
            $this->assignPermissionsToRole(
                Role::where('name', RoleEnum::SCHOOL_ADMIN)->first(),
                Permission::query()->whereIn('group', ['school'])->get()
            );

            $school->users()->attach($admin->id, ['role' => RoleEnum::SCHOOL_ADMIN]);
            $admins->push($admin);
        }

        return $admins;
    }

    public function createTeachers(School $school, ?int $count = null): Collection {
        $count = $count ?? self::TEST_DATA_COUNT['teachers_per_school'];
        $teachers = new Collection();

        for ($i = 1; $i <= $count; $i++) {
            $teacher = User::factory()->create([
                'name' => "School {$school->id} Teacher {$i}",
                'email' => "school{$school->id}teacher{$i}@codeasy.com",
                'username' => "school{$school->id}teacher{$i}",
            ]);

            $teacher->assignRole(RoleEnum::TEACHER);
            $this->assignPermissionsToRole(
                Role::where('name', RoleEnum::TEACHER)->first(),
                Permission::query()->whereIn('group', ['student', 'class', 'subject', 'exam'])->get()
            );

            $school->users()->attach($teacher->id, ['role' => RoleEnum::TEACHER]);
            $teachers->push($teacher);
        }

        return $teachers;
    }

    public function createStudents(School $school, ?int $count = null): Collection {
        $count = $count ?? self::TEST_DATA_COUNT['students_per_school'];
        $students = new Collection();

        for ($i = 1; $i <= $count; $i++) {
            $student = User::factory()->create([
                'name' => "School {$school->id} Student {$i}",
                'email' => "school{$school->id}student{$i}@codeasy.com",
                'username' => "school{$school->id}student{$i}",
            ]);

            $student->assignRole(RoleEnum::STUDENT);
            $this->assignPermissionsToRole(
                Role::where('name', RoleEnum::STUDENT)->first(),
                Permission::query()->whereIn('group', ['subject', 'exam', 'result'])->get()
            );

            $school->users()->attach($student->id, ['role' => RoleEnum::STUDENT]);
            $students->push($student);
        }

        return $students;
    }

    public function createSuperAdmin(): User {
        $superadmin = User::factory()->create([
            'name' => 'Super Admin',
            'username' => 'superadmin',
            'email' => 'superadmin@codeasy.com',
        ]);
        $superadmin->assignRole(RoleEnum::SUPER_ADMIN);
        $this->assignPermissionsToRole(Role::where('name', RoleEnum::SUPER_ADMIN)->first(), Permission::all());

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

    private function assignPermissionsToRole(Role $role, Collection $permissions): void {
        $role->syncPermissions($permissions);
    }
}
