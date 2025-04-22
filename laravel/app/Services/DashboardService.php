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
        $students = $material->course->classroom->students;

        $questionProgressData = [];
        foreach ($material->questions as $question) {
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
                    foreach ($material->questions as $question) {
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
        $material = LearningMaterial::with('questions')->findOrFail($materialId);
        $totalQuestions = count($material->questions);

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
            ->whereIn('learning_material_question_id', $material->questions->pluck('id'))
            ->where('completion_status', true)
            ->count();

        $progressPercentage = ($completedCount / $totalQuestions) * 100;

        return [
            'progress_percentage' => $progressPercentage,
            'completed_questions' => $completedCount,
            'total_questions' => $totalQuestions,
        ];
    }
}
