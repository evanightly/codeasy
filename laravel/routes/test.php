<?php

use App\Events\TestEvent;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;

Route::get('/test-fastapi', function () {
    // Contoh data payload, seharusnya diisi dengan kode siswa dan testcase yang sesuai
    $payload = [
        'type' => 'sandbox',
        'code' => "def add_numbers(a, b):\n    return a + b\n\nprint('Result:', add_numbers(2, 3))",
        'testcases' => [
            'self.assertEqual(add_numbers(2, 3), 5)',
        ],
    ];

    try {
        $response = Http::post('http://fastapi:8001/test', $payload);
        if ($response->successful()) {
            return $response->json();
        }

        return response()->json([$response->json(), $response->status()], 500);

    } catch (\Exception $e) {
        return response()->json([
            'error' => $e->getMessage(),
        ], 500);
    }
});

// Add a new route for test case debugging
Route::post('/api/debug-test-case', function (\Illuminate\Http\Request $request) {
    $payload = $request->all();

    try {
        $response = Http::post('http://fastapi:8001/debug-test-case', $payload);

        if ($response->successful()) {
            return response()->json($response->json());
        }

        return response()->json(['message' => 'Failed to call FastAPI', 'response' => $response], 500);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
})->name('api.debug-test-case');

// Cypress Testing Routes - Available in testing/development or when X-Cypress-Test header is present
if (env('CYPRESS_TESTING', false) ||
    env('APP_ENV') === 'testing' ||
    env('APP_ENV') === 'local' ||
    request()->hasHeader('X-Cypress-Test')) {
    Route::prefix('cypress')->name('cypress.')->group(function () {
        Route::post('/reset-database', [\App\Http\Controllers\Cypress\CypressDatabaseController::class, 'resetDatabase'])->name('reset-database');
        Route::get('/status', [\App\Http\Controllers\Cypress\CypressDatabaseController::class, 'status'])->name('status');
    });
}

Route::group(['prefix' => 'test'], function () {
    Route::get('/', function () {
        broadcast(new TestEvent);

        return 'dispatched';
    });
});
