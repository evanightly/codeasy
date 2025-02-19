<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Support\Enums\RoleEnum;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder {
    /**
     * Run the database seeds.
     */
    public function run(): void {

        $roles = RoleEnum::cases();

        foreach ($roles as $role) {
            Role::updateOrCreate(
                ['name' => $role->value],
                ['guard_name' => 'web']
            );
        }
    }
}
