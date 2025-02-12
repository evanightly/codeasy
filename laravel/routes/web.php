<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;

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
        "type" => "sandbox",
        "code" => "print('nama saya Arin')\nimport matplotlib.pyplot as plt\nplt.plot([25,231,32])\nplt.title('Visualisasi Siswa')\nplt.show()\nprint('okokokok')",
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
            return response()->json([$response->json(), $response->status()], 500);
        }
    } catch (\Exception $e) {
        return response()->json([
            'error' => $e->getMessage()
        ], 500);
    }
});

Route::inertia('/sandbox', 'Sandbox/Index');

Route::post('/sandbox', function (\Illuminate\Http\Request $request) {
    $payload = $request->all();

    logger($payload);
    try {
        $response = Http::post('http://fastapi:8001/test', $payload);

        if ($response->successful()) {
            $fastApiData = $response->json();
            $fullData = array_map(function ($item) {
                if ($item['type'] === 'image') {
                    // Ambil prefix dari env('APP_URL') atau env('NGINX_URL')
                    // misal env('NGINX_URL') = 'http://127.0.0.1:8080'
                    $nginxUrl = env('NGINX_URL', env('APP_URL'));
                    $item['content'] = rtrim($nginxUrl, '/') . $item['content'];
                }
                return $item;
            }, $fastApiData);
            return response()->json($fullData);
        }
        return response()->json(['message' => 'Failed to call FastAPI', 'response' => $response], 500);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
})->name('sandbox.store');

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
