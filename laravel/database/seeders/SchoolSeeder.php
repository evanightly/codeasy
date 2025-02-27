<?php

namespace Database\Seeders;

use App\Models\School;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Seeder;

class SchoolSeeder extends Seeder {
    private const TEST_DATA_COUNT = [
        'schools' => 2,
    ];

    public function __construct(private UserSeeder $userSeeder) {}

    public function run(): void {
        if (app()->isProduction()) {
            $this->seedProductionData();

            return;
        }

        $this->seedDevelopmentData();
    }

    private function seedProductionData(): void {
        School::updateOrCreate(
            ['name' => 'Politeknik Negeri Malang'],
            [
                'name' => 'Politeknik Negeri Malang',
                'address' => 'Jl. Soekarno-Hatta No.9, Blimbing, Kec. Lowokwaru, Kota Malang, Jawa Timur 65141',
                'city' => 'Malang',
                'state' => 'Jawa Timur',
                'zip' => '65141',
                'phone' => '0341-404424',
            ]
        );
    }

    private function seedDevelopmentData(): void {
        // Create test schools
        $this->createTestSchools();
    }

    public function createTestSchools(): Collection {
        $schools = new Collection;

        for ($i = 1; $i <= self::TEST_DATA_COUNT['schools']; $i++) {
            $school = School::factory()->create([
                'name' => "Test School {$i}",
            ]);

            // Create users for this school
            $this->userSeeder->createSchoolAdmins($school);
            $this->userSeeder->createTeachers($school);
            $this->userSeeder->createStudents($school);

            $schools->push($school);
        }

        return $schools;
    }
}
