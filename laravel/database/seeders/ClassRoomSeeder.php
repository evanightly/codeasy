<?php

namespace Database\Seeders;

use App\Models\ClassRoom;
use App\Models\School;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Seeder;

class ClassRoomSeeder extends Seeder {
    private const TEST_DATA_COUNT = [
        'classes_per_school' => 1,
        'students_per_class' => 5,
    ];

    public function run(): void {
        if (app()->isProduction()) {
            return;
        }

        $schools = School::all();
        foreach ($schools as $school) {
            $this->createClassRooms($school);
        }
    }

    public function createClassRooms(School $school): Collection {
        $classrooms = new Collection();

        for ($i = 1; $i <= self::TEST_DATA_COUNT['classes_per_school']; $i++) {
            $classroom = ClassRoom::create([
                'school_id' => $school->id,
                'name' => "Class {$i}",
                'grade' => rand(1, 12),
                'year' => date('Y'),
                'active' => true,
            ]);

            // Get random teacher and students from school
            $teacher = $school->teachers()->inRandomOrder()->first();
            $students = $school->students()
                ->inRandomOrder()
                ->limit(self::TEST_DATA_COUNT['students_per_class'])
                ->get();

            // Assign students to classroom
            $classroom->students()->attach($students->pluck('id'));
            $classrooms->push($classroom);
        }

        return $classrooms;
    }
}
