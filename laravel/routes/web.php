<?php

use App\Http\Controllers\Auth\PasswordController;
use App\Http\Controllers\ClassRoomController;
use App\Http\Controllers\Course\LearningMaterial\LearningMaterialQuestion\LearningMaterialQuestionTestCaseController as CourseLearningMaterialQuestionTestCaseController;
use App\Http\Controllers\Course\LearningMaterial\LearningMaterialQuestionController as CourseLearningMaterialQuestionController;
use App\Http\Controllers\Course\LearningMaterialController as CourseLearningMaterialController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ExecutionResultController;
use App\Http\Controllers\LearningMaterialController;
use App\Http\Controllers\LearningMaterialQuestionController;
use App\Http\Controllers\LearningMaterialQuestionTestCaseController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\SchoolController;
use App\Http\Controllers\SchoolRequestController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\StudentScoreController;
use App\Http\Controllers\UserController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
})->name('welcome');

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

Route::middleware('auth')->group(function () {
    Route::resource('dashboard', DashboardController::class);
    Route::resource('permissions', PermissionController::class);
    Route::resource('roles', RoleController::class);
    Route::resource('users', UserController::class);
    Route::resource('schools', SchoolController::class)->except(['index']);
    Route::resource('school-requests', SchoolRequestController::class);
    Route::resource('class-rooms', ClassRoomController::class);
    Route::resource('courses', CourseController::class);
    Route::resource('learning-materials', LearningMaterialController::class);
    Route::resource('learning-material-questions', LearningMaterialQuestionController::class);
    Route::resource('learning-material-question-test-cases', LearningMaterialQuestionTestCaseController::class)
        ->parameters([
            'learning-material-question-test-cases' => 'testCase',
        ]);
    Route::resource('execution-results', ExecutionResultController::class);
    Route::resource('student-scores', StudentScoreController::class);

    // Profile routes
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::put('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::put('/password', [PasswordController::class, 'update'])->name('password.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Context-specific nested resources (viewing only)
    Route::prefix('courses/{course}')->name('courses.')->group(function () {
        // Learning Materials in context of a Course (view only)
        Route::resource('learning-materials', CourseLearningMaterialController::class)
            ->only(['index', 'show', 'create', 'edit']);

        // Questions in context of a Course/LearningMaterial (view only)
        Route::prefix('learning-materials/{learningMaterial}')->name('learning-materials.')->group(function () {
            Route::resource('questions', CourseLearningMaterialQuestionController::class)
                ->only(['index', 'show', 'create', 'edit']);

            // Test Cases in context of a Course/LearningMaterial/Question (view only)
            Route::prefix('questions/{question}')->name('questions.')->group(function () {
                Route::resource('test-cases', CourseLearningMaterialQuestionTestCaseController::class)
                    ->only(['index', 'show', 'create', 'edit']);
            });
        });
    });

    Route::prefix('student')->name('student.')->group(function () {
        Route::resource('courses', StudentController::class)
            ->only(['index', 'show']);

        Route::get('/courses/{course}/materials/{material}', [StudentController::class, 'courseMaterial'])
            ->name('courses.materials.show');

        Route::get('/courses/{course}/materials/{material}/questions/{question}', [StudentController::class, 'courseMaterialQuestion'])
            ->name('courses.materials.questions.show');

        Route::post('/questions/execute', [StudentController::class, 'executeCode'])->name('questions.execute');
        Route::post('/questions/update-time', [StudentController::class, 'updateCodingTime'])->name('questions.update-time');
    });
});

Route::resource('schools', SchoolController::class)->only(['index']);

require __DIR__ . '/auth.php';
