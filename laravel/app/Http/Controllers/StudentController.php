<?php

namespace App\Http\Controllers;

use App\Http\Requests\StudentCourse\ExecuteCodeRequest;
use App\Http\Requests\StudentCourse\UpdateTimeRequest;
use App\Models\Course;
use App\Models\LearningMaterial;
use App\Models\LearningMaterialQuestion;
use App\Models\StudentScore;
use App\Support\Interfaces\Services\CourseServiceInterface;
use App\Support\Interfaces\Services\ExecutionResultServiceInterface;
use App\Support\Interfaces\Services\LearningMaterialServiceInterface;
use App\Support\Interfaces\Services\StudentScoreServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;

// TODO: refactor this controller to use services
class StudentController extends Controller {
    public function __construct(
        protected CourseServiceInterface $courseService,
        protected LearningMaterialServiceInterface $learningMaterialService,
        protected StudentScoreServiceInterface $studentScoreService,
        protected ExecutionResultServiceInterface $executionResultService
    ) {}

    /**
     * Show the student's courses.
     */
    public function courses(): Response {
        $user = Auth::user();

        $courses = $this->courseService->with(['classroom'])->find([
            ['classroom.students', 'has', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            }],
            'active' => true,
        ])->all();

        // // Get courses where the student belongs to the classroom
        // $courses = Course::with('classroom')
        //     ->whereHas('classroom.students', function ($query) use ($user) {
        //         $query->where('user_id', $user->id);
        //     })
        //     ->where('active', true)
        //     // ->orderBy('name')
        //     ->get();

        return Inertia::render('Student/Courses/Index', [
            'courses' => [
                'data' => $courses,
            ],
        ]);
    }

    /**
     * Show course details with learning materials.
     */
    public function showCourse(Course $course): Response {
        // Check if the user belongs to this course's classroom
        $user = Auth::user();

        $canAccess = $course->classroom->students()->where('user_id', $user->id)->exists();

        if (!$canAccess) {
            abort(403, 'You do not have access to this course.');
        }

        // Get materials for this course
        $materials = $course->learningMaterials()
            ->where('active', true)
            ->orderBy('order_number')
            ->get();

        return Inertia::render('Student/Courses/Show', [
            'course' => [
                'data' => $course->load('classroom'),
            ],
            'materials' => [
                'data' => $materials,
            ],
        ]);
    }

    /**
     * Show learning material details with questions.
     */
    public function showMaterial(Course $course, LearningMaterial $material): Response {
        // Check if the user belongs to this course's classroom
        $user = Auth::user();

        $canAccess = $course->classroom->students()->where('user_id', $user->id)->exists();

        if (!$canAccess) {
            abort(403, 'You do not have access to this material.');
        }

        // Verify material belongs to this course
        if ($material->course_id !== $course->id) {
            abort(404, 'Material not found in this course.');
        }

        // Get user progress for this material
        $progress = $this->learningMaterialService->getUserProgress($user->id, $material->id);

        return Inertia::render('Student/Materials/Show', [
            'course' => [
                'data' => $course->load('classroom'),
            ],
            'material' => [
                'data' => $material,
            ],
            'progress' => $progress,
        ]);
    }

    /**
     * Show question workspace for attempting a question.
     */
    public function showQuestion(Course $course, LearningMaterial $material, LearningMaterialQuestion $question): Response {
        // Check if the user belongs to this course's classroom
        $user = Auth::user();

        $canAccess = $course->classroom->students()->where('user_id', $user->id)->exists();

        if (!$canAccess) {
            abort(403, 'You do not have access to this material.');
        }

        // Verify material belongs to this course
        if ($material->course_id !== $course->id) {
            abort(404, 'Material not found in this course.');
        }

        // Verify question belongs to this material
        if ($question->learning_material_id !== $material->id) {
            abort(404, 'Question not found in this material.');
        }

        // Get visible test cases
        $testCases = $question->testCases()
            ->where('active', true)
            ->get()
            ->map(function ($testCase) {
                // If the test case is hidden, don't send the actual input to the frontend
                if ($testCase->hidden) {
                    return [
                        'id' => $testCase->id,
                        'description' => $testCase->description,
                        'hidden' => $testCase->hidden,
                        'active' => $testCase->active,
                    ];
                }

                return [
                    'id' => $testCase->id,
                    'description' => $testCase->description,
                    'input' => $testCase->input,
                    'hidden' => $testCase->hidden,
                    'active' => $testCase->active,
                ];
            });

        // Get or create a student score entry with compile_count initialized to 0
        $studentScore = StudentScore::firstOrCreate(
            [
                'user_id' => $user->id,
                'learning_material_question_id' => $question->id,
            ],
            [
                'coding_time' => 0,
                'score' => 0,
                'completion_status' => false,
                'trial_status' => true,
                'compile_count' => 0,  // Initialize compile_count to 0
            ]
        );

        // Get the latest code (if any)
        $latestExecution = $studentScore->executionResults()
            ->orderBy('created_at', 'desc')
            ->first();

        // Get navigation information
        $navigation = $this->learningMaterialService->getQuestionNavigation($material->id, $question->id);

        // Apply rules for navigation - can only proceed if code has been run at least once
        if ($navigation['next']) {
            $navigation['next']['can_proceed'] = $latestExecution && $latestExecution->compile_status;
        }

        return Inertia::render('Student/Questions/Workspace', [
            'course' => [
                'data' => $course->load('classroom'),
            ],
            'material' => [
                'data' => $material,
            ],
            'question' => [
                'data' => $question,
            ],
            'testCases' => $testCases,
            'tracking' => [
                'score_id' => $studentScore->id,
                'current_time' => $studentScore->coding_time,
                'completion_status' => $studentScore->completion_status,
                'trial_status' => $studentScore->trial_status,
                'started_at' => $studentScore->created_at->timestamp,
            ],
            'latestCode' => $latestExecution ? $latestExecution->code : null,
            'navigation' => $navigation,
        ]);
    }

    /**
     * Execute code and return results.
     */
    public function executeCode(ExecuteCodeRequest $request): JsonResponse {
        $user = Auth::user();
        $studentScoreId = $request->student_score_id;
        $code = $request->code;

        // Verify the student score belongs to the current user
        $studentScore = StudentScore::where('id', $studentScoreId)
            ->where('user_id', $user->id)
            ->first();

        if (!$studentScore) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Get the question
        $question = $studentScore->question;
        $testCases = $question->testCases()->where('active', true)->get();

        // If question is already completed, just execute the code without updating tracking data
        if (!$studentScore->completion_status) {
            // Increment compile count only if not completed
            $studentScore->compile_count = (int) ($studentScore->compile_count ?? 0) + 1;
            $studentScore->save();
        }

        // Record the execution attempt
        $executionResult = $this->executionResultService->create([
            'student_score_id' => $studentScoreId,
            'code' => $code,
            'compile_status' => true, // We'll assume success initially
        ]);

        // Prepare test cases for FastAPI
        $testCaseInputs = $testCases->pluck('input')->toArray();

        try {
            // Call the FastAPI service
            $fastApiUrl = config('services.fastapi.url') . '/test';
            $response = Http::post($fastApiUrl, [
                'type' => 'test',
                'code' => $code,
                'testcases' => $testCaseInputs,
                'question_id' => $question->id,
            ]);

            if ($response->successful()) {
                $results = $response->json();

                // Check if all test cases passed
                // $allPassed = false;
                // foreach ($results as $result) {
                //     if (isset($result['type']) && $result['type'] === 'test_stats') {
                //         $allPassed = $result['success'] === $result['total_tests'];
                //         break;
                //     }
                // }

                // Check if at least one test case passed
                $somePassed = false;
                foreach ($results as $result) {
                    if (isset($result['type']) && $result['type'] === 'test_stats') {
                        $somePassed = $result['success'] > 0;
                        break;
                    }
                }

                // Only update the student score if not already completed
                if ($somePassed && !$studentScore->completion_status) {
                    $this->studentScoreService->update($studentScore->id, [
                        'completion_status' => true,
                        'score' => 100,
                    ]);
                }

                // Process image URLs if needed
                $processedResults = array_map(function ($item) {
                    if ($item['type'] === 'image') {
                        // Prepend URL if needed
                        $nginxUrl = env('NGINX_URL', env('APP_URL'));
                        $item['content'] = rtrim($nginxUrl, '/') . $item['content'];
                    }

                    return $item;
                }, $results);

                return response()->json([
                    'output' => $processedResults,
                    'success' => $somePassed,
                ]);
            }

            // Handle FastAPI error
            return response()->json([
                'error' => 'Error executing code',
                'details' => $response->json(),
            ], 500);

        } catch (\Exception $e) {
            // Update execution status to failed
            $this->executionResultService->update($executionResult->id, [
                'compile_status' => false,
            ]);

            return response()->json([
                'error' => 'Error executing code',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update coding time for a question attempt.
     */
    public function updateCodingTime(UpdateTimeRequest $request): JsonResponse {
        $user = Auth::user();
        $studentScoreId = $request->student_score_id;
        $seconds = $request->seconds;

        // Verify the student score belongs to the current user
        $studentScore = StudentScore::where('id', $studentScoreId)
            ->where('user_id', $user->id)
            ->first();

        if (!$studentScore) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Only update the coding time if the question is not already completed
        if (!$studentScore->completion_status) {
            // Update the coding time
            $this->studentScoreService->update($studentScoreId, [
                'coding_time' => $seconds,
            ]);
        }

        return response()->json(['success' => true]);
    }
}
