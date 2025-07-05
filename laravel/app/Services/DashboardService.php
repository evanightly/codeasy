<?php

namespace App\Services;

use App\Models\Course;
use App\Models\LearningMaterial;
use App\Models\StudentScore;
use App\Models\User;
use App\Support\Enums\RoleEnum;
use App\Support\Interfaces\Services\ClassRoomServiceInterface;
use App\Support\Interfaces\Services\CourseServiceInterface;
use App\Support\Interfaces\Services\DashboardServiceInterface;
use App\Support\Interfaces\Services\LearningMaterialServiceInterface;
use App\Support\Interfaces\Services\StudentScoreServiceInterface;
use Illuminate\Support\Facades\DB;

class DashboardService implements DashboardServiceInterface {
    public function __construct(
        protected CourseServiceInterface $courseService,
        protected LearningMaterialServiceInterface $learningMaterialService,
        protected StudentScoreServiceInterface $studentScoreService,
        protected ClassRoomServiceInterface $classRoomService
    ) {}

    /**
     * Get dashboard data based on user role.
     */
    public function getDashboardData(User $user): array {
        $roles = $user->getRoleNames()->toArray();
        $dashboardData = [
            'roles' => $roles,
        ];

        // Teacher role gets student tracking data
        if (in_array(RoleEnum::TEACHER->value, $roles)) {
            $dashboardData['teacherData'] = $this->getTeacherStudentProgress($user);
        }

        return $dashboardData;
    }

    /**
     * Get the teacher's student progress tracking data.
     */
    public function getTeacherStudentProgress(User $teacher): array {
        // Get courses taught by this teacher
        // $courses = $this->courseService->find([
        //     'teacher_id' => $teacher->id,
        //     'active' => true,
        // ])->get();

        $courses = Course::where('teacher_id', $teacher->id)
            ->where('active', true)
            ->get();

        $progressData = [];

        foreach ($courses as $course) {
            $courseProgress = $this->getDetailedCourseProgress($course->id);
            $progressData['courses'][] = $courseProgress;
        }

        // Calculate overall completion statistics
        $completionStats = $this->calculateCompletionStatistics($courses);
        $progressData['stats'] = $completionStats;

        return $progressData;
    }

    /**
     * Get detailed progress for a specific course.
     */
    public function getDetailedCourseProgress(int $courseId): array {
        $course = Course::with(['classroom.students', 'learning_materials'])->findOrFail($courseId);

        $materials = $course->learning_materials;
        $students = $course->classroom->students;

        $materialProgressData = [];

        foreach ($materials as $material) {
            $studentProgress = [];
            foreach ($students as $student) {
                // Get student progress for this material
                $progress = $this->getStudentMaterialProgress($student->id, $material->id);
                $studentProgress[] = [
                    'id' => $student->id,
                    'name' => $student->name,
                    'progress_percentage' => $progress['progress_percentage'],
                    'completed_questions' => $progress['completed_questions'],
                    'total_questions' => $progress['total_questions'],
                ];
            }

            $materialProgressData[] = [
                'id' => $material->id,
                'title' => $material->title,
                'total_questions' => $material->questions_count ?? 0,
                'student_progress' => $studentProgress,
                'avg_completion' => $this->calculateAverageCompletion($studentProgress),
            ];
        }

        return [
            'id' => $course->id,
            'name' => $course->name,
            'materials' => $materialProgressData,
            'total_students' => count($students),
            'avg_completion' => $this->calculateOverallCourseCompletion($materialProgressData),
        ];
    }

    /**
     * Get detailed progress for a specific material.
     */
    public function getDetailedMaterialProgress(int $materialId): array {
        $material = LearningMaterial::with(['course.classroom.students', 'questions'])->findOrFail($materialId);
        $students = $material->c->classroom->students;

        $questionProgressData = [];
        foreach ($material->learning_material_questions as $question) {
            $studentProgress = [];
            foreach ($students as $student) {
                // Get student score for this question
                $score = StudentScore::where([
                    'user_id' => $student->id,
                    'learning_material_question_id' => $question->id,
                ])->first();

                $studentProgress[] = [
                    'id' => $student->id,
                    'name' => $student->name,
                    'completion_status' => $score ? $score->completion_status : false,
                    'score' => $score ? $score->score : 0,
                    'attempts' => $score ? $score->compile_count : 0,
                    'coding_time' => $score ? $score->coding_time : 0,
                ];
            }

            $questionProgressData[] = [
                'id' => $question->id,
                'title' => $question->title,
                'student_progress' => $studentProgress,
                'completion_rate' => $this->calculateQuestionCompletionRate($studentProgress),
            ];
        }

        return [
            'id' => $material->id,
            'title' => $material->title,
            'course' => [
                'id' => $material->course->id,
                'name' => $material->course->name,
            ],
            'questions' => $questionProgressData,
            'total_students' => count($students),
        ];
    }

    /**
     * Get detailed progress for a specific student.
     */
    public function getStudentDetailedProgress(int $userId): array {
        $user = User::findOrFail($userId);
        $studentClassrooms = $user->classrooms;

        $courseProgressData = [];
        foreach ($studentClassrooms as $classroom) {
            foreach ($classroom->courses as $course) {
                $materialProgress = [];
                foreach ($course->learning_materials as $material) {
                    $questionProgress = [];
                    foreach ($material->learning_material_questions as $question) {
                        $score = StudentScore::where([
                            'user_id' => $userId,
                            'learning_material_question_id' => $question->id,
                        ])->first();

                        $questionProgress[] = [
                            'id' => $question->id,
                            'title' => $question->title,
                            'completion_status' => $score ? $score->completion_status : false,
                            'score' => $score ? $score->score : 0,
                            'attempts' => $score ? $score->compile_count : 0,
                            'coding_time' => $score ? $score->coding_time : 0,
                        ];
                    }

                    $materialProgress[] = [
                        'id' => $material->id,
                        'title' => $material->title,
                        'questions' => $questionProgress,
                        'progress_percentage' => $this->calculateMaterialCompletionPercentage($questionProgress),
                    ];
                }

                $courseProgressData[] = [
                    'id' => $course->id,
                    'name' => $course->name,
                    'materials' => $materialProgress,
                    'progress_percentage' => $this->calculateCourseCompletionPercentage($materialProgress),
                ];
            }
        }

        return [
            'id' => $user->id,
            'name' => $user->name,
            'courses' => $courseProgressData,
        ];
    }

    /**
     * Get the latest work data for a specific student.
     * This includes the current course, material, question, and next question if available.
     */
    public function getStudentLatestWork(int $userId): array {
        $user = User::findOrFail($userId);
        $studentClassrooms = $user->classrooms;

        // Find the most recent student score to determine where the student left off
        $latestScore = StudentScore::where('user_id', $userId)
            ->orderBy('updated_at', 'desc')
            ->first();

        // If no activity yet, try to find the first available course and material
        if (!$latestScore) {
            foreach ($studentClassrooms as $classroom) {
                foreach ($classroom->courses as $course) {
                    if ($course->learning_materials->isNotEmpty()) {
                        $material = $course->learning_materials->first();
                        if ($material->learning_material_questions->isNotEmpty()) {
                            $question = $material->learning_material_questions->first();

                            return [
                                'course' => [
                                    'id' => $course->id,
                                    'name' => $course->name,
                                ],
                                'material' => [
                                    'id' => $material->id,
                                    'title' => $material->title,
                                ],
                                'currentQuestion' => [
                                    'id' => $question->id,
                                    'title' => $question->title,
                                    'isCompleted' => false,
                                ],
                                // No next question yet since this is the first one
                            ];
                        }
                    }
                }
            }

            // No courses or materials available
            return [];
        }

        // We have a latest score, so let's find the current question and material
        $currentQuestion = $latestScore->learning_material_question;
        $currentMaterial = $currentQuestion->learning_material;
        $currentCourse = $currentMaterial->course;

        // Check if there's a next question in the same material
        $nextQuestion = null;
        $allQuestionsInMaterial = $currentMaterial->learning_material_questions->sortBy('id');
        $foundCurrentQuestion = false;

        foreach ($allQuestionsInMaterial as $question) {
            if ($foundCurrentQuestion) {
                $nextQuestion = $question;
                break;
            }

            if ($question->id === $currentQuestion->id) {
                $foundCurrentQuestion = true;
            }
        }

        // If no next question in current material, check if there's a next material in the course
        if (!$nextQuestion) {
            $allMaterialsInCourse = $currentCourse->learning_materials->sortBy('id');
            $foundCurrentMaterial = false;

            foreach ($allMaterialsInCourse as $material) {
                if ($foundCurrentMaterial) {
                    if ($material->learning_material_questions->isNotEmpty()) {
                        $nextQuestion = $material->learning_material_questions->sortBy('id')->first();
                        break;
                    }
                }

                if ($material->id === $currentMaterial->id) {
                    $foundCurrentMaterial = true;
                }
            }
        }

        $result = [
            'course' => [
                'id' => $currentCourse->id,
                'name' => $currentCourse->name,
            ],
            'material' => [
                'id' => $currentMaterial->id,
                'title' => $currentMaterial->title,
            ],
            'currentQuestion' => [
                'id' => $currentQuestion->id,
                'title' => $currentQuestion->title,
                'isCompleted' => (bool) $latestScore->completion_status,
            ],
        ];

        if ($nextQuestion) {
            $result['nextQuestion'] = [
                'id' => $nextQuestion->id,
                'title' => $nextQuestion->title,
            ];
        }

        return $result;
    }

    /**
     * Get the latest progress/activity data for teacher's students.
     * This shows which student, course, material, and question they last worked on.
     */
    public function getTeacherLatestProgress(int $teacherId): array {
        // Get courses taught by this teacher
        $courses = Course::where('teacher_id', $teacherId)
            ->where('active', true)
            ->with(['classroom.students', 'learning_materials.learning_material_questions'])
            ->get();

        $latestProgressData = [];

        // Get all student IDs from teacher's courses
        $studentIds = [];
        foreach ($courses as $course) {
            foreach ($course->classroom->students as $student) {
                $studentIds[] = $student->id;
            }
        }

        // Remove duplicates
        $studentIds = array_unique($studentIds);

        // Get the most recent student scores for each student
        foreach ($studentIds as $studentId) {
            $latestScore = StudentScore::where('user_id', $studentId)
                ->with([
                    'learning_material_question.learning_material.course',
                    'user',
                ])
                ->orderBy('updated_at', 'desc')
                ->first();

            if ($latestScore) {
                $question = $latestScore->learning_material_question;
                $material = $question->learning_material;
                $course = $material->course;
                $student = $latestScore->user;

                // Only include if this course belongs to the teacher
                if ($course->teacher_id === $teacherId) {
                    $latestProgressData[] = [
                        'student' => [
                            'id' => $student->id,
                            'name' => $student->name,
                        ],
                        'course' => [
                            'id' => $course->id,
                            'name' => $course->name,
                        ],
                        'material' => [
                            'id' => $material->id,
                            'title' => $material->title,
                        ],
                        'question' => [
                            'id' => $question->id,
                            'title' => $question->title,
                        ],
                        'activity' => [
                            'last_updated' => $latestScore->updated_at,
                            'coding_time' => $latestScore->coding_time,
                            'completion_status' => $latestScore->completion_status,
                            'trial_status' => $latestScore->trial_status,
                            'score' => $latestScore->test_case_complete_count > 0 && $latestScore->test_case_total_count > 0
                                ? round(($latestScore->test_case_complete_count / $latestScore->test_case_total_count) * 100)
                                : 0,
                        ],
                    ];
                }
            }
        }

        // Sort by most recent activity first
        usort($latestProgressData, function ($a, $b) {
            return $b['activity']['last_updated']->timestamp <=> $a['activity']['last_updated']->timestamp;
        });

        // Limit to most recent 20 activities
        $latestProgressData = array_slice($latestProgressData, 0, 20);

        return $latestProgressData;
    }

    /**
     * Get all courses taught by a teacher.
     */
    public function getTeacherCourses(int $teacherId): array {
        $courses = Course::where('teacher_id', $teacherId)
            ->where('active', true)
            ->with(['classroom.students'])
            ->get();

        $coursesData = [];
        foreach ($courses as $course) {
            $studentCount = $course->classroom ? $course->classroom->students->count() : 0;

            // Get recent activity count for this course
            $recentActivityCount = StudentScore::whereHas('learning_material_question.learning_material', function ($query) use ($course) {
                $query->where('course_id', $course->id);
            })
                ->where('updated_at', '>=', now()->subDays(7)) // Last 7 days
                ->distinct('user_id')
                ->count();

            $coursesData[] = [
                'id' => $course->id,
                'name' => $course->name,
                'description' => $course->description,
                'student_count' => $studentCount,
                'recent_activity_count' => $recentActivityCount,
                'created_at' => $course->created_at,
                'updated_at' => $course->updated_at,
            ];
        }

        return $coursesData;
    }

    /**
     * Get the latest progress/activity data for a specific course.
     */
    public function getCourseLatestProgress(int $courseId): array {
        $course = Course::with(['classroom.students'])->findOrFail($courseId);

        $latestProgressData = [];

        // Get all student IDs from this course
        $studentIds = $course->classroom ? $course->classroom->students->pluck('id')->toArray() : [];

        // Get the most recent student scores for each student in this course
        foreach ($studentIds as $studentId) {
            $latestScore = StudentScore::where('user_id', $studentId)
                ->whereHas('learning_material_question.learning_material', function ($query) use ($courseId) {
                    $query->where('course_id', $courseId);
                })
                ->with([
                    'learning_material_question.learning_material',
                    'user',
                ])
                ->orderBy('updated_at', 'desc')
                ->first();

            if ($latestScore) {
                $question = $latestScore->learning_material_question;
                $material = $question->learning_material;
                $student = $latestScore->user;

                $latestProgressData[] = [
                    'student' => [
                        'id' => $student->id,
                        'name' => $student->name,
                    ],
                    'course' => [
                        'id' => $course->id,
                        'name' => $course->name,
                    ],
                    'material' => [
                        'id' => $material->id,
                        'title' => $material->title,
                    ],
                    'question' => [
                        'id' => $question->id,
                        'title' => $question->title,
                    ],
                    'activity' => [
                        'last_updated' => $latestScore->updated_at,
                        'coding_time' => $latestScore->coding_time,
                        'completion_status' => $latestScore->completion_status,
                        'trial_status' => $latestScore->trial_status,
                        'score' => $latestScore->test_case_complete_count > 0 && $latestScore->test_case_total_count > 0
                            ? round(($latestScore->test_case_complete_count / $latestScore->test_case_total_count) * 100)
                            : 0,
                    ],
                ];
            }
        }

        // Sort by most recent activity first
        usort($latestProgressData, function ($a, $b) {
            return $b['activity']['last_updated']->timestamp <=> $a['activity']['last_updated']->timestamp;
        });

        // Limit to most recent 15 activities for this course
        $latestProgressData = array_slice($latestProgressData, 0, 15);

        return $latestProgressData;
    }

    /**
     * Get students with no progress for a specific course.
     */
    public function getCourseStudentsNoProgress(int $courseId): array {
        $course = Course::with(['classroom.students'])->findOrFail($courseId);

        if (!$course->classroom) {
            return [
                'students_no_progress' => [],
                'total_count' => 0,
            ];
        }

        $allStudents = $course->classroom->students;

        $studentsWithProgress = StudentScore::whereHas('learning_material_question.learning_material', function ($query) use ($courseId) {
            $query->where('course_id', $courseId);
        })
            ->distinct('user_id')
            ->pluck('user_id')
            ->toArray();

        // Filter students who have no progress (no StudentScore records for this course)
        $studentsNoProgress = $allStudents->filter(function ($student) use ($studentsWithProgress) {
            return !in_array($student->id, $studentsWithProgress);
        })->map(function ($student) {
            return [
                'id' => $student->id,
                'name' => $student->name,
                'email' => $student->email,
            ];
        })->values()->toArray();

        return [
            'students_no_progress' => $studentsNoProgress,
            'total_count' => count($studentsNoProgress),
        ];
    }

    /**
     * Calculate completion statistics for multiple courses.
     */
    private function calculateCompletionStatistics($courses): array {
        $totalStudents = 0;
        $totalCompletedCourses = 0;
        $totalCoursesInProgress = 0;
        $totalNotStartedCourses = 0;

        foreach ($courses as $course) {
            $students = $course->classroom->students;
            $totalStudents += count($students);

            foreach ($students as $student) {
                $progress = $this->courseService->getStudentCoursesProgress($student->id, [$course]);
                $courseProgress = $progress[0]['progress_percentage'] ?? 0;

                if ($courseProgress >= 100) {
                    $totalCompletedCourses++;
                } elseif ($courseProgress > 0) {
                    $totalCoursesInProgress++;
                } else {
                    $totalNotStartedCourses++;
                }
            }
        }

        // Calculate top performing students across all courses
        $topStudents = $this->getTopPerformingStudents($courses, 5);

        return [
            'total_students' => $totalStudents,
            'completed_courses' => $totalCompletedCourses,
            'in_progress_courses' => $totalCoursesInProgress,
            'not_started_courses' => $totalNotStartedCourses,
            'top_students' => $topStudents,
        ];
    }

    /**
     * Get top performing students across courses.
     */
    private function getTopPerformingStudents($courses, $limit = 5): array {
        $studentScores = [];

        foreach ($courses as $course) {
            $students = $course->classroom->students;

            foreach ($students as $student) {
                if (!isset($studentScores[$student->id])) {
                    $studentScores[$student->id] = [
                        'id' => $student->id,
                        'name' => $student->name,
                        'total_score' => 0,
                        'courses_count' => 0,
                        'avg_score' => 0,
                    ];
                }

                $progress = $this->courseService->getStudentCoursesProgress($student->id, [$course]);
                $studentScores[$student->id]['total_score'] += $progress[0]['progress_percentage'] ?? 0;
                $studentScores[$student->id]['courses_count']++;
                $studentScores[$student->id]['avg_score'] =
                    $studentScores[$student->id]['total_score'] / $studentScores[$student->id]['courses_count'];
            }
        }

        // Sort by average score descending
        usort($studentScores, function ($a, $b) {
            return $b['avg_score'] <=> $a['avg_score'];
        });

        // Return top N students
        return array_slice($studentScores, 0, $limit);
    }

    /**
     * Calculate average completion percentage for a material based on student progress.
     */
    private function calculateAverageCompletion(array $studentProgress): float {
        if (empty($studentProgress)) {
            return 0;
        }

        $totalProgress = 0;
        foreach ($studentProgress as $progress) {
            $totalProgress += $progress['progress_percentage'];
        }

        return $totalProgress / count($studentProgress);
    }

    /**
     * Calculate overall course completion based on material progress.
     */
    private function calculateOverallCourseCompletion(array $materialProgressData): float {
        if (empty($materialProgressData)) {
            return 0;
        }

        $totalCompletion = 0;
        foreach ($materialProgressData as $material) {
            $totalCompletion += $material['avg_completion'];
        }

        return $totalCompletion / count($materialProgressData);
    }

    /**
     * Calculate question completion rate.
     */
    private function calculateQuestionCompletionRate(array $studentProgress): float {
        if (empty($studentProgress)) {
            return 0;
        }

        $completedCount = 0;
        foreach ($studentProgress as $progress) {
            if ($progress['completion_status']) {
                $completedCount++;
            }
        }

        return ($completedCount / count($studentProgress)) * 100;
    }

    /**
     * Calculate material completion percentage.
     */
    private function calculateMaterialCompletionPercentage(array $questionProgress): float {
        if (empty($questionProgress)) {
            return 0;
        }

        $completedCount = 0;
        foreach ($questionProgress as $question) {
            if ($question['completion_status']) {
                $completedCount++;
            }
        }

        return ($completedCount / count($questionProgress)) * 100;
    }

    /**
     * Calculate course completion percentage.
     */
    private function calculateCourseCompletionPercentage(array $materialProgress): float {
        if (empty($materialProgress)) {
            return 0;
        }

        $totalPercentage = 0;
        foreach ($materialProgress as $material) {
            $totalPercentage += $material['progress_percentage'];
        }

        return $totalPercentage / count($materialProgress);
    }

    /**
     * Get student progress for a specific material.
     */
    private function getStudentMaterialProgress(int $studentId, int $materialId): array {
        $material = LearningMaterial::with('learning_material_questions')->findOrFail($materialId);
        $totalQuestions = count($material->learning_material_questions);

        if ($totalQuestions === 0) {
            return [
                'progress_percentage' => 0,
                'completed_questions' => 0,
                'total_questions' => 0,
            ];
        }

        $completedCount = StudentScore::where([
            'user_id' => $studentId,
        ])
            ->whereIn('learning_material_question_id', $material->learning_material_questions->pluck('id'))
            ->where('completion_status', true)
            ->count();

        $progressPercentage = ($completedCount / $totalQuestions) * 100;

        return [
            'progress_percentage' => $progressPercentage,
            'completed_questions' => $completedCount,
            'total_questions' => $totalQuestions,
        ];
    }

    /**
     * Get currently active users grouped by roles.
     */
    public function getActiveUsers(int $minutesThreshold = 15): array {
        $cutoffTime = now()->subMinutes($minutesThreshold);

        // Get active user IDs from sessions table
        $activeUserIds = DB::table('sessions')
            ->where('last_activity', '>=', $cutoffTime->timestamp)
            ->whereNotNull('user_id')
            ->distinct()
            ->pluck('user_id');

        if ($activeUserIds->isEmpty()) {
            return [
                'total_active' => 0,
                'by_role' => [],
                'users_by_role' => [],
                'last_updated' => now()->toISOString(),
            ];
        }

        // Get active users with their roles
        $activeUsers = User::whereIn('id', $activeUserIds)
            ->with('roles')
            ->get();

        $usersByRole = [];
        $countByRole = [];

        foreach ($activeUsers as $user) {
            $userRoles = $user->roles->pluck('name')->toArray();

            // If user has no roles, categorize as 'student' (default role)
            if (empty($userRoles)) {
                $userRoles = [RoleEnum::STUDENT->value];
            }

            foreach ($userRoles as $role) {
                // Role names from database already match enum values
                if (!isset($usersByRole[$role])) {
                    $usersByRole[$role] = [];
                    $countByRole[$role] = 0;
                }

                $usersByRole[$role][] = [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'profile_image_url' => $user->profile_image ? asset('storage/profile-images/' . $user->profile_image) : null,
                ];

                $countByRole[$role]++;
            }
        }

        return [
            'total_active' => $activeUsers->count(),
            'by_role' => $countByRole,
            'users_by_role' => $usersByRole,
            'last_updated' => now()->toISOString(),
            'threshold_minutes' => $minutesThreshold,
        ];
    }

    /**
     * Get student learning progress chart data with time filtering.
     */
    public function getStudentLearningProgressData(int $userId, array $filters = []): array {
        $startDate = $filters['start_date'] ?? now()->subMonths(3)->startOfDay();
        $endDate = $filters['end_date'] ?? now()->endOfDay();
        $courseId = $filters['course_id'] ?? null;

        $query = StudentScore::where('user_id', $userId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->with(['learning_material_question.learning_material.course'])
            ->orderBy('created_at');

        if ($courseId) {
            $query->whereHas('learning_material_question.learning_material', function ($q) use ($courseId) {
                $q->where('course_id', $courseId);
            });
        }

        $scores = $query->get();

        // Group by date and calculate progress
        $progressData = [];
        $totalQuestions = 0;
        $completedQuestions = 0;

        foreach ($scores->groupBy(function ($score) {
            return $score->created_at->format('Y-m-d');
        }) as $date => $dayScores) {
            $dayCompleted = $dayScores->where('completion_status', true)->count();
            $completedQuestions += $dayCompleted;
            $totalQuestions += $dayScores->count();

            $progressData[] = [
                'date' => $date,
                'progress' => $totalQuestions > 0 ? round(($completedQuestions / $totalQuestions) * 100, 2) : 0,
                'completed_today' => $dayCompleted,
                'total_today' => $dayScores->count(),
            ];
        }

        return $progressData;
    }

    /**
     * Get student cognitive levels distribution data.
     */
    public function getStudentCognitiveLevelsData(int $userId, array $filters = []): array {
        $courseId = $filters['course_id'] ?? null;
        $startDate = $filters['start_date'] ?? null;
        $endDate = $filters['end_date'] ?? null;

        $query = StudentScore::where('user_id', $userId)
            ->where('completion_status', true)
            ->with(['learning_material_question.learning_material']);

        if ($courseId) {
            $query->whereHas('learning_material_question.learning_material', function ($q) use ($courseId) {
                $q->where('course_id', $courseId);
            });
        }

        if ($startDate && $endDate) {
            $query->whereBetween('created_at', [$startDate, $endDate]);
        }

        $scores = $query->get();

        // Count by Bloom's taxonomy levels
        $cognitiveData = [
            'Remember' => 0,
            'Understand' => 0,
            'Apply' => 0,
            'Analyze' => 0,
            'Evaluate' => 0,
            'Create' => 0,
        ];

        foreach ($scores as $score) {
            $question = $score->learning_material_question;
            $cognitiveLevels = json_decode($question->cognitive_levels ?? '[]', true);

            foreach ($cognitiveLevels as $level) {
                if (array_key_exists($level, $cognitiveData)) {
                    $cognitiveData[$level]++;
                }
            }
        }

        // Convert to chart format
        $chartData = [];
        $colors = [
            'Remember' => 'hsl(var(--chart-1))',
            'Understand' => 'hsl(var(--chart-2))',
            'Apply' => 'hsl(var(--chart-3))',
            'Analyze' => 'hsl(var(--chart-4))',
            'Evaluate' => 'hsl(var(--chart-5))',
            'Create' => 'hsl(var(--chart-6))',
        ];

        foreach ($cognitiveData as $level => $count) {
            $chartData[] = [
                'level' => $level,
                'value' => $count,
                'fill' => $colors[$level],
            ];
        }

        return $chartData;
    }

    /**
     * Get student module progress data.
     */
    public function getStudentModuleProgressData(int $userId, array $filters = []): array {
        $courseId = $filters['course_id'] ?? null;

        $query = LearningMaterial::with(['learning_material_questions.student_scores' => function ($q) use ($userId) {
            $q->where('user_id', $userId)->where('completion_status', true);
        }]);

        if ($courseId) {
            $query->where('course_id', $courseId);
        }

        $materials = $query->get();

        $moduleData = [];
        foreach ($materials as $material) {
            $totalQuestions = $material->learning_material_questions->count();
            $completedQuestions = $material->learning_material_questions->sum(function ($question) {
                return $question->student_scores->count() > 0 ? 1 : 0;
            });

            $moduleData[] = [
                'modul' => $material->title,
                'done' => $completedQuestions,
                'total' => $totalQuestions,
                'progress_percentage' => $totalQuestions > 0 ? round(($completedQuestions / $totalQuestions) * 100, 2) : 0,
            ];
        }

        return $moduleData;
    }

    /**
     * Get student daily activity data showing coding sessions and time spent.
     */
    public function getStudentDailyActivityData(int $userId, array $filters = []): array {
        $startDate = $filters['start_date'] ?? now()->subDays(30)->startOfDay();
        $endDate = $filters['end_date'] ?? now()->endOfDay();
        $courseId = $filters['course_id'] ?? null;

        $query = StudentScore::where('user_id', $userId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->with(['learning_material_question.learning_material']);

        if ($courseId) {
            $query->whereHas('learning_material_question.learning_material', function ($q) use ($courseId) {
                $q->where('course_id', $courseId);
            });
        }

        $scores = $query->get();

        $activityData = [];
        foreach ($scores->groupBy(function ($score) {
            return $score->created_at->format('Y-m-d');
        }) as $date => $dayScores) {
            $totalTime = $dayScores->sum('coding_time');
            $sessions = $dayScores->count();
            $completedQuestions = $dayScores->where('completion_status', true)->count();

            $activityData[] = [
                'date' => $date,
                'total_time' => round($totalTime / 60, 2), // Convert to minutes
                'sessions' => $sessions,
                'completed_questions' => $completedQuestions,
                'avg_time_per_session' => $sessions > 0 ? round($totalTime / $sessions / 60, 2) : 0,
            ];
        }

        return $activityData;
    }

    /**
     * Get student weekly streak data showing consecutive learning days.
     */
    public function getStudentWeeklyStreakData(int $userId, array $filters = []): array {
        $startDate = $filters['start_date'] ?? now()->subWeeks(12)->startOfDay();
        $endDate = $filters['end_date'] ?? now()->endOfDay();
        $courseId = $filters['course_id'] ?? null;

        $query = StudentScore::where('user_id', $userId)
            ->whereBetween('created_at', [$startDate, $endDate]);

        if ($courseId) {
            $query->whereHas('learning_material_question.learning_material', function ($q) use ($courseId) {
                $q->where('course_id', $courseId);
            });
        }

        $activeDays = $query->selectRaw('DATE(created_at) as activity_date')
            ->groupBy('activity_date')
            ->orderBy('activity_date')
            ->pluck('activity_date')
            ->toArray();

        $streakData = [];
        $currentStreak = 0;
        $longestStreak = 0;
        $weeklyData = [];

        // Group by weeks
        foreach ($activeDays as $day) {
            $week = date('Y-W', strtotime($day));
            if (!isset($weeklyData[$week])) {
                $weeklyData[$week] = [
                    'week' => $week,
                    'active_days' => 0,
                    'streak_maintained' => false,
                ];
            }
            $weeklyData[$week]['active_days']++;
        }

        // Calculate streaks
        $prevDate = null;
        foreach ($activeDays as $day) {
            if ($prevDate && strtotime($day) - strtotime($prevDate) === 86400) { // Next day
                $currentStreak++;
            } else {
                $currentStreak = 1;
            }
            $longestStreak = max($longestStreak, $currentStreak);
            $prevDate = $day;
        }

        return [
            'weekly_activity' => array_values($weeklyData),
            'current_streak' => $currentStreak,
            'longest_streak' => $longestStreak,
            'total_active_days' => count($activeDays),
        ];
    }

    /**
     * Get student score trends over time for performance analysis.
     */
    public function getStudentScoreTrendsData(int $userId, array $filters = []): array {
        $startDate = $filters['start_date'] ?? now()->subMonths(3)->startOfDay();
        $endDate = $filters['end_date'] ?? now()->endOfDay();
        $courseId = $filters['course_id'] ?? null;

        $query = StudentScore::where('user_id', $userId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->where('completion_status', true);

        if ($courseId) {
            $query->whereHas('learning_material_question.learning_material', function ($q) use ($courseId) {
                $q->where('course_id', $courseId);
            });
        }

        $scores = $query->get();

        $trendData = [];
        foreach ($scores->groupBy(function ($score) {
            return $score->created_at->format('Y-m-d');
        }) as $date => $dayScores) {
            $avgScore = $dayScores->avg(function ($score) {
                if ($score->test_case_total_count > 0) {
                    return ($score->test_case_complete_count / $score->test_case_total_count) * 100;
                }

                return 0;
            });

            $trendData[] = [
                'date' => $date,
                'average_score' => round($avgScore, 2),
                'questions_completed' => $dayScores->count(),
                'perfect_scores' => $dayScores->filter(function ($score) {
                    return $score->test_case_total_count > 0 &&
                           $score->test_case_complete_count === $score->test_case_total_count;
                })->count(),
            ];
        }

        return $trendData;
    }

    /**
     * Get student time analysis data showing coding efficiency and patterns.
     */
    public function getStudentTimeAnalysisData(int $userId, array $filters = []): array {
        $courseId = $filters['course_id'] ?? null;
        $startDate = $filters['start_date'] ?? now()->subMonths(3)->startOfDay();
        $endDate = $filters['end_date'] ?? now()->endOfDay();

        $query = StudentScore::where('user_id', $userId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->where('coding_time', '>', 0);

        if ($courseId) {
            $query->whereHas('learning_material_question.learning_material', function ($q) use ($courseId) {
                $q->where('course_id', $courseId);
            });
        }

        $scores = $query->get();

        $timeByHour = [];
        $timeByDayOfWeek = [];
        $efficiencyData = [];

        foreach ($scores as $score) {
            // Time by hour of day
            $hour = $score->created_at->format('H');
            if (!isset($timeByHour[$hour])) {
                $timeByHour[$hour] = ['hour' => $hour, 'total_time' => 0, 'sessions' => 0];
            }
            $timeByHour[$hour]['total_time'] += $score->coding_time;
            $timeByHour[$hour]['sessions']++;

            // Time by day of week
            $dayOfWeek = $score->created_at->format('l');
            if (!isset($timeByDayOfWeek[$dayOfWeek])) {
                $timeByDayOfWeek[$dayOfWeek] = ['day' => $dayOfWeek, 'total_time' => 0, 'sessions' => 0];
            }
            $timeByDayOfWeek[$dayOfWeek]['total_time'] += $score->coding_time;
            $timeByDayOfWeek[$dayOfWeek]['sessions']++;

            // Efficiency (time vs success rate)
            $successRate = $score->test_case_total_count > 0 ?
                ($score->test_case_complete_count / $score->test_case_total_count) * 100 : 0;

            $efficiencyData[] = [
                'time_spent' => round($score->coding_time / 60, 2), // minutes
                'success_rate' => $successRate,
                'attempts' => $score->compile_count,
            ];
        }

        return [
            'time_by_hour' => array_values($timeByHour),
            'time_by_day' => array_values($timeByDayOfWeek),
            'efficiency_analysis' => $efficiencyData,
            'total_coding_time' => round($scores->sum('coding_time') / 3600, 2), // hours
            'average_session_time' => round($scores->avg('coding_time') / 60, 2), // minutes
        ];
    }

    /**
     * Get student difficulty progression showing improvement across complexity levels.
     */
    public function getStudentDifficultyProgressData(int $userId, array $filters = []): array {
        $courseId = $filters['course_id'] ?? null;
        $startDate = $filters['start_date'] ?? now()->subMonths(6)->startOfDay();
        $endDate = $filters['end_date'] ?? now()->endOfDay();

        $query = StudentScore::where('user_id', $userId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->with(['learning_material_question']);

        if ($courseId) {
            $query->whereHas('learning_material_question.learning_material', function ($q) use ($courseId) {
                $q->where('course_id', $courseId);
            });
        }

        $scores = $query->get();

        $difficultyLevels = ['Easy', 'Medium', 'Hard'];
        $progressData = [];

        foreach ($difficultyLevels as $level) {
            $levelScores = $scores->filter(function ($score) use ($level) {
                $difficulty = $score->learning_material_question->difficulty_level ?? 'Medium';

                return strtolower($difficulty) === strtolower($level);
            });

            $completedCount = $levelScores->where('completion_status', true)->count();
            $totalCount = $levelScores->count();
            $avgScore = $levelScores->where('completion_status', true)->avg(function ($score) {
                return $score->test_case_total_count > 0 ?
                    ($score->test_case_complete_count / $score->test_case_total_count) * 100 : 0;
            });

            $progressData[] = [
                'difficulty' => $level,
                'completed' => $completedCount,
                'total_attempted' => $totalCount,
                'completion_rate' => $totalCount > 0 ? round(($completedCount / $totalCount) * 100, 2) : 0,
                'average_score' => round($avgScore ?? 0, 2),
            ];
        }

        return $progressData;
    }

    /**
     * Get student comparison stats relative to class average.
     */
    public function getStudentComparisonStatsData(int $userId, array $filters = []): array {
        $courseId = $filters['course_id'] ?? null;

        if (!$courseId) {
            return ['error' => 'Course ID required for comparison stats'];
        }

        $course = Course::with(['classroom.students'])->findOrFail($courseId);
        $classmates = $course->classroom ? $course->classroom->students->pluck('id')->toArray() : [];

        // Student's stats (with user_id for ranking calculations)
        $studentStatsWithId = $this->calculateStudentStats($userId, $courseId);

        // Clean student stats for frontend (without user_id)
        $studentStats = [
            'completion_rate' => $studentStatsWithId['completion_rate'],
            'average_score' => $studentStatsWithId['average_score'],
            'total_time' => $studentStatsWithId['total_time'],
            'questions_completed' => $studentStatsWithId['questions_completed'],
        ];

        // Class average stats
        $classStats = [];
        foreach ($classmates as $classmateId) {
            $stats = $this->calculateStudentStats($classmateId, $courseId);
            $classStats[] = $stats;
        }

        $classAverage = [
            'completion_rate' => collect($classStats)->avg('completion_rate'),
            'average_score' => collect($classStats)->avg('average_score'),
            'total_time' => collect($classStats)->avg('total_time'),
            'questions_completed' => collect($classStats)->avg('questions_completed'),
        ];

        return [
            'student_stats' => $studentStats,
            'class_average' => $classAverage,
            'ranking' => $this->calculateStudentRanking($userId, $classStats),
            'percentile' => $this->calculatePercentile($studentStats, $classStats),
        ];
    }

    /**
     * Get student achievement summary including badges, milestones, and accomplishments.
     */
    public function getStudentAchievementSummaryData(int $userId, array $filters = []): array {
        $courseId = $filters['course_id'] ?? null;

        $query = StudentScore::where('user_id', $userId);

        if ($courseId) {
            $query->whereHas('learning_material_question.learning_material', function ($q) use ($courseId) {
                $q->where('course_id', $courseId);
            });
        }

        $scores = $query->get();
        $completedScores = $scores->where('completion_status', true);

        $achievements = [
            'total_questions_completed' => $completedScores->count(),
            'total_courses_enrolled' => $courseId ? 1 : $this->getStudentCourseCount($userId),
            'perfect_scores' => $completedScores->filter(function ($score) {
                return $score->test_case_total_count > 0 &&
                       $score->test_case_complete_count === $score->test_case_total_count;
            })->count(),
            'coding_time_hours' => round($scores->sum('coding_time') / 3600, 2),
            'current_streak' => $this->calculateCurrentStreak($userId),
            'milestones' => $this->calculateMilestones($completedScores->count()),
            'badges' => $this->calculateBadges($userId, $scores),
        ];

        return $achievements;
    }

    /**
     * Calculate student stats for a specific course.
     */
    private function calculateStudentStats(int $userId, int $courseId): array {
        $scores = StudentScore::where('user_id', $userId)
            ->whereHas('learning_material_question.learning_material', function ($q) use ($courseId) {
                $q->where('course_id', $courseId);
            })
            ->get();

        $completedScores = $scores->where('completion_status', true);
        $totalQuestions = $scores->count();
        $completedQuestions = $completedScores->count();

        $avgScore = $completedScores->avg(function ($score) {
            return $score->test_case_total_count > 0 ?
                ($score->test_case_complete_count / $score->test_case_total_count) * 100 : 0;
        });

        return [
            'user_id' => $userId, // Include user_id for ranking calculations
            'completion_rate' => $totalQuestions > 0 ? round(($completedQuestions / $totalQuestions) * 100, 2) : 0,
            'average_score' => round($avgScore ?? 0, 2),
            'total_time' => round($scores->sum('coding_time') / 3600, 2), // hours
            'questions_completed' => $completedQuestions,
        ];
    }

    /**
     * Calculate student ranking in class using multiple criteria with proper tiebreaking.
     */
    private function calculateStudentRanking(int $userId, array $classStats): int {
        // Sort students by ranking criteria (descending order for better performance)
        $sortedStats = collect($classStats)->sort(function ($a, $b) {
            // Primary: completion rate (higher is better)
            if ($a['completion_rate'] !== $b['completion_rate']) {
                return $b['completion_rate'] <=> $a['completion_rate'];
            }
            
            // Secondary: average score (higher is better)
            if ($a['average_score'] !== $b['average_score']) {
                return $b['average_score'] <=> $a['average_score'];
            }
            
            // Tertiary: total questions completed (more is better)
            if ($a['questions_completed'] !== $b['questions_completed']) {
                return $b['questions_completed'] <=> $a['questions_completed'];
            }
            
            // Quaternary: total time spent (less is better, more efficient)
            if ($a['total_time'] !== $b['total_time']) {
                return $a['total_time'] <=> $b['total_time'];
            }
            
            // Final tiebreaker: user ID for consistency
            return $a['user_id'] <=> $b['user_id'];
        })->values();

        // Find the student's position in the sorted list
        $studentPosition = $sortedStats->search(function ($stats) use ($userId) {
            return $stats['user_id'] === $userId;
        });

        // Return 1-based ranking
        return $studentPosition !== false ? $studentPosition + 1 : count($classStats);
    }

    /**
     * Calculate student percentile in class using multi-criteria ranking.
     */
    private function calculatePercentile(array $studentStats, array $classStats): float {
        // Sort all students by the same criteria used in ranking
        $sortedStats = collect($classStats)->sort(function ($a, $b) {
            // Primary: completion rate (higher is better)
            if ($a['completion_rate'] !== $b['completion_rate']) {
                return $b['completion_rate'] <=> $a['completion_rate'];
            }
            
            // Secondary: average score (higher is better)
            if ($a['average_score'] !== $b['average_score']) {
                return $b['average_score'] <=> $a['average_score'];
            }
            
            // Tertiary: total questions completed (more is better)
            if ($a['questions_completed'] !== $b['questions_completed']) {
                return $b['questions_completed'] <=> $a['questions_completed'];
            }
            
            // Quaternary: total time spent (less is better, more efficient)
            if ($a['total_time'] !== $b['total_time']) {
                return $a['total_time'] <=> $b['total_time'];
            }
            
            // Final tiebreaker: user ID for consistency
            return $a['user_id'] <=> $b['user_id'];
        })->values();

        // Find student's position by matching all their stats
        $studentPosition = null;
        foreach ($sortedStats as $index => $stats) {
            if ($stats['completion_rate'] == $studentStats['completion_rate'] &&
                $stats['average_score'] == $studentStats['average_score'] &&
                $stats['questions_completed'] == $studentStats['questions_completed'] &&
                abs($stats['total_time'] - $studentStats['total_time']) < 0.01) { // Allow small floating point differences
                $studentPosition = $index;
                break;
            }
        }

        if ($studentPosition === null) {
            return 0.0;
        }

        // Calculate percentile: (students ranked below / total students) * 100
        $studentsBelow = count($sortedStats) - $studentPosition - 1;
        
        return count($sortedStats) > 1 ? round(($studentsBelow / (count($sortedStats) - 1)) * 100, 2) : 100.0;
    }

    /**
     * Get student course count.
     */
    private function getStudentCourseCount(int $userId): int {
        $user = User::with('classrooms.courses')->findOrFail($userId);
        $courseIds = [];

        foreach ($user->classrooms as $classroom) {
            foreach ($classroom->courses as $course) {
                $courseIds[] = $course->id;
            }
        }

        return count(array_unique($courseIds));
    }

    /**
     * Calculate current learning streak.
     */
    private function calculateCurrentStreak(int $userId): int {
        $activeDays = StudentScore::where('user_id', $userId)
            ->selectRaw('DATE(created_at) as activity_date')
            ->groupBy('activity_date')
            ->orderByDesc('activity_date')
            ->pluck('activity_date')
            ->toArray();

        $currentStreak = 0;
        $checkDate = now()->format('Y-m-d');

        foreach ($activeDays as $day) {
            if ($day === $checkDate) {
                $currentStreak++;
                $checkDate = date('Y-m-d', strtotime($checkDate . ' -1 day'));
            } else {
                break;
            }
        }

        return $currentStreak;
    }

    /**
     * Calculate milestones based on completed questions.
     */
    private function calculateMilestones(int $completedQuestions): array {
        $milestones = [
            ['name' => 'First Steps', 'threshold' => 1, 'achieved' => $completedQuestions >= 1],
            ['name' => 'Getting Started', 'threshold' => 5, 'achieved' => $completedQuestions >= 5],
            ['name' => 'On a Roll', 'threshold' => 25, 'achieved' => $completedQuestions >= 25],
            ['name' => 'Half Century', 'threshold' => 50, 'achieved' => $completedQuestions >= 50],
            ['name' => 'Centurion', 'threshold' => 100, 'achieved' => $completedQuestions >= 100],
            ['name' => 'Master Coder', 'threshold' => 250, 'achieved' => $completedQuestions >= 250],
        ];

        return $milestones;
    }

    /**
     * Calculate badges based on various achievements.
     */
    private function calculateBadges(int $userId, $scores): array {
        $completedScores = $scores->where('completion_status', true);
        $perfectScores = $completedScores->filter(function ($score) {
            return $score->test_case_total_count > 0 &&
                   $score->test_case_complete_count === $score->test_case_total_count;
        });

        $badges = [];

        // Perfect Score badges
        if ($perfectScores->count() >= 10) {
            $badges[] = ['name' => 'Perfectionist', 'description' => '10+ perfect scores', 'icon' => '🎯'];
        }

        // Speed badges
        $fastSolutions = $scores->filter(function ($score) {
            return $score->coding_time < 300 && $score->completion_status; // Under 5 minutes
        });

        if ($fastSolutions->count() >= 5) {
            $badges[] = ['name' => 'Speed Demon', 'description' => '5+ solutions under 5 minutes', 'icon' => '⚡'];
        }

        // Consistency badges
        $streak = $this->calculateCurrentStreak($userId);
        if ($streak >= 7) {
            $badges[] = ['name' => 'Dedicated Learner', 'description' => '7+ day learning streak', 'icon' => '🔥'];
        }

        return $badges;
    }
}
