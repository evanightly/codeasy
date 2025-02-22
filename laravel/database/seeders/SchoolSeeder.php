<?php

namespace Database\Seeders;

use App\Models\School;
use Illuminate\Database\Seeder;

class SchoolSeeder extends Seeder {
    /**
     * Run the database seeds.
     */
    public function run(): void {
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
}
