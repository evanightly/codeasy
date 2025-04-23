import { ReactNode } from 'react';

export interface DashboardProgressData {
    roles: string[];
    teacherData?: TeacherProgressData;
}

export interface TeacherProgressData {
    courses: CourseProgressData[];
    stats: CompletionStatistics;
}

export interface CourseProgressData {
    id: number;
    name: string;
    materials: MaterialProgressData[];
    total_students: number;
    avg_completion: number;
}

export interface MaterialProgressData {
    id: number;
    title: string;
    total_questions: number;
    student_progress: StudentMaterialProgress[];
    avg_completion: number;
}

export interface StudentMaterialProgress {
    title: ReactNode;
    id: number;
    name: string;
    progress_percentage: number;
    completed_questions: number;
    total_questions: number;
}

export interface CompletionStatistics {
    total_students: number;
    completed_courses: number;
    in_progress_courses: number;
    not_started_courses: number;
    top_students: TopStudentData[];
}

export interface TopStudentData {
    id: number;
    name: string;
    total_score: number;
    courses_count: number;
    avg_score: number;
}

export interface DetailedMaterialProgressData {
    id: number;
    title: string;
    course: {
        id: number;
        name: string;
    };
    questions: QuestionProgressData[];
    total_students: number;
}

export interface QuestionProgressData {
    id: number;
    title: string;
    student_progress: StudentQuestionProgress[];
    completion_rate: number;
}

export interface StudentQuestionProgress {
    id: number;
    name: string;
    completion_status: boolean;
    score: number;
    attempts: number;
    coding_time: number;
}

export interface StudentDetailedProgressData {
    id: number;
    name: string;
    courses: StudentCourseProgress[];
}

export interface StudentCourseProgress {
    id: number;
    name: string;
    materials: StudentMaterialProgress[];
    progress_percentage: number;
}

export interface StudentMaterialDetailedProgress {
    id: number;
    title: string;
    questions: StudentQuestionDetailedProgress[];
    progress_percentage: number;
}

export interface StudentQuestionDetailedProgress {
    id: number;
    title: string;
    completion_status: boolean;
    score: number;
    attempts: number;
    coding_time: number;
}

export interface StudentLatestWorkData {
    course: {
        id: number;
        name: string;
    };
    material: {
        id: number;
        title: string;
    };
    currentQuestion: {
        id: number;
        title: string;
        isCompleted: boolean;
    };
    nextQuestion?: {
        id: number;
        title: string;
    };
}
