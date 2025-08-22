<?php

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;

Route::inertia('/sandbox', 'Sandbox/Index')->name('sandbox.index');

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
