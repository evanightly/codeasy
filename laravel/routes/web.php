<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/test-fastapi', function () {
    // Contoh data payload, seharusnya diisi dengan kode siswa dan testcase yang sesuai
    $payload = [
        "code" => "print('nama saya Arin')\nimport matplotlib.pyplot as plt\nplt.plot([25,231,32])\nplt.title('Visualisasi Siswa')\nplt.show()",
        "testcases" => [
            "self.assertEqual(2+2, 4)",
            "self.assertTrue('Arin' in 'nama saya Arin')"
        ]
    ];

    try {
        $response = Http::post('http://fastapi:8001/test', $payload);
        if ($response->successful()) {
            return $response->json();
        } else {
            return response()->json([
                'message' => 'Failed to call FastAPI'
            ], 500);
        }
    } catch (\Exception $e) {
        return response()->json([
            'error' => $e->getMessage()
        ], 500);
    }
});

Route::inertia('/sandbox', 'Sandbox/Index');

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
