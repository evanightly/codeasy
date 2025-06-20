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
}
