'use client';

import { TrendingUp } from 'lucide-react';

// Recharts imports:
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Label,
    Line,
    LineChart,
    Pie,
    PieChart,
    PolarAngleAxis,
    PolarGrid,
    Radar,
    RadarChart,
    RadialBar,
    RadialBarChart,
    XAxis,
    YAxis,
} from 'recharts';

// UI components & chart helpers from your nyxb/shadcn library:
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/Components/UI/card';
import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/Components/UI/chart';

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { RoleEnum } from '@/Support/Enums/roleEnum';
import { Head, usePage } from '@inertiajs/react';

// New imports for student tracking components
import { Badge } from '@/Components/UI/badge';
import { Button } from '@/Components/UI/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/Components/UI/dialog';
import { Progress } from '@/Components/UI/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/UI/tabs';
import { dashboardServiceHook } from '@/Services/dashboardServiceHook';
import { CourseProgressData, StudentDetailedProgressData } from '@/Support/Interfaces/Resources/DashboardResource';
import { BarChart3, BookOpen, CheckCircle, User, XCircle } from 'lucide-react';
import { useState } from 'react';

// Example role-based chart dashboard
// We'll store each role's dataset. Adjust as needed.
const adminBarData = [
    { month: 'January', users: 150 },
    { month: 'February', users: 245 },
    { month: 'March', users: 310 },
    { month: 'April', users: 380 },
    { month: 'May', users: 430 },
    { month: 'June', users: 512 },
];

const adminPieData = [
    { role: 'Siswa', count: 400, fill: 'hsl(var(--chart-1))' },
    { role: 'Guru', count: 30, fill: 'hsl(var(--chart-2))' },
    { role: 'Admin', count: 5, fill: 'hsl(var(--chart-3))' },
];

const adminLineData = [
    { day: 1, visits: 30 },
    { day: 2, visits: 80 },
    { day: 3, visits: 120 },
    { day: 4, visits: 100 },
    { day: 5, visits: 140 },
    { day: 6, visits: 200 },
    { day: 7, visits: 220 },
];

const adminRadarData = [
    { dimension: 'Traffic', january: 70, june: 95 },
    { dimension: 'Registrations', january: 55, june: 75 },
    { dimension: 'Active Users', january: 60, june: 90 },
    { dimension: 'Feedback', january: 30, june: 55 },
    { dimension: 'Completed Modules', january: 40, june: 80 },
];

/** GURU DATASET */
const guruBarData = [
    { kelas: 'Kelas A', averageScore: 78 },
    { kelas: 'Kelas B', averageScore: 82 },
    { kelas: 'Kelas C', averageScore: 90 },
    { kelas: 'Kelas D', averageScore: 60 },
];

const guruPieData = [
    { label: 'Completed', value: 65, fill: 'hsl(var(--chart-1))' },
    { label: 'On Progress', value: 25, fill: 'hsl(var(--chart-2))' },
    { label: 'Not Attempted', value: 10, fill: 'hsl(var(--chart-3))' },
];

const guruRadarData = [
    { module: 'Data Wrangling', max: 100, score: 75 },
    { module: 'Vis. Dasar', max: 100, score: 80 },
    { module: 'ML Dasar', max: 100, score: 65 },
    { module: 'Python Basic', max: 100, score: 90 },
    { module: 'Pandas/NumPy', max: 100, score: 85 },
];

const guruRadialData = [
    { name: 'Top Siswa A', progress: 90, fill: 'hsl(var(--chart-1))' },
    { name: 'Top Siswa B', progress: 85, fill: 'hsl(var(--chart-2))' },
    { name: 'Top Siswa C', progress: 80, fill: 'hsl(var(--chart-3))' },
    { name: 'Top Siswa D', progress: 78, fill: 'hsl(var(--chart-4))' },
    { name: 'Top Siswa E', progress: 75, fill: 'hsl(var(--chart-5))' },
];

/** SISWA DATASET */
const siswaAreaData = [
    { date: '2025-01-01', progress: 10 },
    { date: '2025-01-05', progress: 20 },
    { date: '2025-01-10', progress: 40 },
    { date: '2025-01-15', progress: 65 },
    { date: '2025-01-20', progress: 75 },
    { date: '2025-01-25', progress: 80 },
    { date: '2025-01-30', progress: 95 },
];

const siswaPieData = [
    { level: 'Remember', value: 4, fill: 'hsl(var(--chart-1))' },
    { level: 'Understand', value: 5, fill: 'hsl(var(--chart-2))' },
    { level: 'Apply', value: 2, fill: 'hsl(var(--chart-3))' },
    { level: 'Analyze', value: 3, fill: 'hsl(var(--chart-4))' },
    { level: 'Evaluate', value: 1, fill: 'hsl(var(--chart-5))' },
    { level: 'Create', value: 0, fill: 'hsl(var(--chart-6))' },
];

const siswaBarData = [
    { modul: 'Intro Data Science', done: 1 },
    { modul: 'Python Basic', done: 1 },
    { modul: 'Pandas/NumPy', done: 0 },
    { modul: 'Matplotlib', done: 0 },
    { modul: 'ML Dasar', done: 0 },
];

/** SCHOOL DATASET (NEW) */
const schoolBarData = [
    { name: 'Guru', count: 23 },
    { name: 'Siswa', count: 560 },
    { name: 'Staff', count: 10 },
];
const schoolPieData = [
    { name: 'Labs/Computers', value: 12, fill: 'hsl(var(--chart-1))' },
    { name: 'Whiteboards', value: 20, fill: 'hsl(var(--chart-2))' },
    { name: 'Projectors', value: 10, fill: 'hsl(var(--chart-3))' },
    { name: 'Others', value: 5, fill: 'hsl(var(--chart-4))' },
];
const schoolRadarData = [
    { dimension: 'Kelas A', january: 20, june: 25 },
    { dimension: 'Kelas B', january: 22, june: 30 },
    { dimension: 'Kelas C', january: 27, june: 36 },
    { dimension: 'Kelas D', january: 15, june: 20 },
    { dimension: 'Kelas E', january: 10, june: 18 },
];
const schoolRadialData = [
    { name: 'Nilai Rata SD', performance: 70, fill: 'hsl(var(--chart-1))' },
    { name: 'Nilai Rata SMP', performance: 85, fill: 'hsl(var(--chart-2))' },
    { name: 'Nilai Rata SMA', performance: 90, fill: 'hsl(var(--chart-3))' },
];

const adminConfig: ChartConfig = {
    users: {
        label: 'Users',
        color: 'hsl(var(--chart-1))',
    },
    role: {
        label: 'Role',
    },
    visits: {
        label: 'Visits',
        color: 'hsl(var(--chart-1))',
    },
    january: {
        label: 'January',
        color: 'hsl(var(--chart-3))',
    },
    june: {
        label: 'June',
        color: 'hsl(var(--chart-2))',
    },
};

const guruConfig: ChartConfig = {
    averageScore: {
        label: 'Average Score',
        color: 'hsl(var(--chart-1))',
    },
    value: {
        label: 'Module Completion',
    },
    score: {
        label: 'Score',
        color: 'hsl(var(--chart-2))',
    },
    progress: {
        label: 'Progress',
        color: 'hsl(var(--chart-3))',
    },
};

const siswaConfig: ChartConfig = {
    progress: {
        label: 'Progress',
        color: 'hsl(var(--chart-1))',
    },
    level: {
        label: 'Bloom Level',
    },
    done: {
        label: 'Done?',
    },
};

/** New config for SCHOOL admin. */
const schoolConfig: ChartConfig = {
    count: {
        label: 'Count',
        color: 'hsl(var(--chart-1))',
    },
    value: {
        label: 'Value',
        color: 'hsl(var(--chart-2))',
    },
    january: {
        label: 'January',
        color: 'hsl(var(--chart-3))',
    },
    june: {
        label: 'June',
        color: 'hsl(var(--chart-4))',
    },
    performance: {
        label: 'Performance',
        color: 'hsl(var(--chart-2))',
    },
};

// Student Task Tracking Components
const StudentTaskTrackingSection = () => {
    const { data: dashboardData, isLoading } = dashboardServiceHook.useGetDashboardData();
    const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
    const [selectedMaterialId, setSelectedMaterialId] = useState<number | null>(null);
    const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);

    // Fetch detailed data when selections change
    const { data: selectedCourseData } = dashboardServiceHook.useGetCourseProgress(
        selectedCourseId || 0,
    );

    const { data: selectedMaterialData } = dashboardServiceHook.useGetMaterialProgress(
        selectedMaterialId || 0,
    );

    const { data: selectedStudentData } = dashboardServiceHook.useGetStudentProgress(
        selectedStudentId || 0,
    );

    if (isLoading) {
        return (
            <Card className='w-full'>
                <CardHeader>
                    <CardTitle>Student Progress Tracking</CardTitle>
                    <CardDescription>Loading dashboard data...</CardDescription>
                </CardHeader>
                <CardContent className='flex justify-center py-6'>
                    <div className='flex items-center space-x-4'>
                        <div className='h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent'></div>
                        <p>Loading student progress data...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!dashboardData?.teacherData) {
        return (
            <Card className='w-full'>
                <CardHeader>
                    <CardTitle>Student Progress Tracking</CardTitle>
                    <CardDescription>No data available</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>No student progress data is currently available.</p>
                </CardContent>
            </Card>
        );
    }

    const { courses, stats } = dashboardData.teacherData;

    return (
        <Card className='w-full'>
            <CardHeader>
                <CardTitle>Student Task Tracking System</CardTitle>
                <CardDescription>
                    Track student progress through courses, materials, and questions
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue='overview' className='w-full'>
                    <TabsList className='mb-4'>
                        <TabsTrigger value='overview'>Overview</TabsTrigger>
                        <TabsTrigger value='courses'>Courses</TabsTrigger>
                        <TabsTrigger value='students'>Students</TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value='overview' className='space-y-4'>
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                            <div className='rounded-lg border bg-card p-4'>
                                <div className='flex items-center gap-2'>
                                    <BookOpen className='h-5 w-5 text-primary' />
                                    <h3 className='text-lg font-medium'>Total Courses</h3>
                                </div>
                                <p className='mt-2 text-3xl font-bold'>{courses.length}</p>
                            </div>

                            <div className='rounded-lg border bg-card p-4'>
                                <div className='flex items-center gap-2'>
                                    <User className='h-5 w-5 text-primary' />
                                    <h3 className='text-lg font-medium'>Total Students</h3>
                                </div>
                                <p className='mt-2 text-3xl font-bold'>{stats.total_students}</p>
                            </div>

                            <div className='rounded-lg border bg-card p-4'>
                                <div className='flex items-center gap-2'>
                                    <CheckCircle className='h-5 w-5 text-green-500' />
                                    <h3 className='text-lg font-medium'>Completed Courses</h3>
                                </div>
                                <p className='mt-2 text-3xl font-bold'>{stats.completed_courses}</p>
                            </div>
                        </div>

                        <div className='mt-6 space-y-2'>
                            <h3 className='text-lg font-medium'>Course Completion Overview</h3>
                            <div className='space-y-4'>
                                {courses.map((course) => (
                                    <div key={course.id} className='space-y-2'>
                                        <div className='flex items-center justify-between'>
                                            <span className='font-medium'>{course.name}</span>
                                            <span className='text-sm'>
                                                {Math.round(course.avg_completion)}% Complete
                                            </span>
                                        </div>
                                        <Progress
                                            value={course.avg_completion}
                                            className='h-2 w-full'
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className='mt-6'>
                            <h3 className='mb-2 text-lg font-medium'>Top Performing Students</h3>
                            <div className='rounded-lg border'>
                                <div className='grid grid-cols-3 gap-4 border-b p-3 font-medium'>
                                    <div>Student</div>
                                    <div>Courses</div>
                                    <div>Avg. Score</div>
                                </div>
                                {stats.top_students.map((student) => (
                                    <div
                                        key={student.id}
                                        className='grid grid-cols-3 gap-4 border-b p-3'
                                    >
                                        <div>{student.name}</div>
                                        <div>{student.courses_count}</div>
                                        <div>{Math.round(student.avg_score)}%</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </TabsContent>

                    {/* Courses Tab */}
                    <TabsContent value='courses' className='space-y-4'>
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                            {courses.map((course) => (
                                <Card key={course.id} className='overflow-hidden'>
                                    <CardHeader className='pb-2'>
                                        <CardTitle>{course.name}</CardTitle>
                                        <CardDescription>
                                            {course.total_students} students enrolled
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className='pb-2'>
                                        <div className='mb-4 flex items-center gap-2'>
                                            <div>
                                                <div className='text-sm text-muted-foreground'>
                                                    Average Completion
                                                </div>
                                                <div className='text-2xl font-bold'>
                                                    {Math.round(course.avg_completion)}%
                                                </div>
                                            </div>
                                            <Progress
                                                value={course.avg_completion}
                                                className='flex-1'
                                            />
                                        </div>

                                        <div className='space-y-2'>
                                            <h4 className='text-sm font-medium'>
                                                Materials ({course.materials.length})
                                            </h4>
                                            <div className='max-h-40 space-y-2 overflow-auto pr-2'>
                                                {course.materials.map((material) => (
                                                    <div key={material.id} className='space-y-1'>
                                                        <div className='flex items-center justify-between text-sm'>
                                                            <span className='line-clamp-1'>
                                                                {material.title}
                                                            </span>
                                                            <span>
                                                                {Math.round(
                                                                    material.avg_completion,
                                                                )}
                                                                %
                                                            </span>
                                                        </div>
                                                        <Progress
                                                            value={material.avg_completion}
                                                            className='h-1.5'
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className='border-t bg-muted/50 px-4 py-2'>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button
                                                    variant='outline'
                                                    size='sm'
                                                    onClick={() => setSelectedCourseId(course.id)}
                                                    className='w-full'
                                                >
                                                    View Details
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className='max-h-[90vh] overflow-auto sm:max-w-[80vw]'>
                                                <DialogHeader>
                                                    <DialogTitle>
                                                        Course Details: {course.name}
                                                    </DialogTitle>
                                                    <DialogDescription>
                                                        Student progress for each learning material
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <CourseDetailsView
                                                    courseData={selectedCourseData}
                                                />
                                            </DialogContent>
                                        </Dialog>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    {/* Students Tab */}
                    <TabsContent value='students'>
                        <p className='mb-4 text-muted-foreground'>
                            Click on a student to view their detailed progress across all courses
                            and materials.
                        </p>

                        <div className='rounded-lg'>
                            <div className='grid grid-cols-4 gap-4 border-b bg-muted p-3 font-medium'>
                                <div>Student Name</div>
                                <div>Courses</div>
                                <div>Progress</div>
                                <div className='text-right'>Actions</div>
                            </div>

                            {courses
                                .flatMap((course) =>
                                    course.materials.flatMap(
                                        (material) => material.student_progress,
                                    ),
                                )
                                // Remove duplicates based on student ID
                                .filter(
                                    (student, index, self) =>
                                        index === self.findIndex((s) => s.id === student.id),
                                )
                                .sort((a, b) => a.name.localeCompare(b.name))
                                .map((student) => (
                                    <div
                                        key={student.id}
                                        className='grid grid-cols-4 gap-4 border-b p-3'
                                    >
                                        <div>{student.name}</div>
                                        <div>
                                            {
                                                courses.filter((course) =>
                                                    course.materials.some((material) =>
                                                        material.student_progress.some(
                                                            (s) => s.id === student.id,
                                                        ),
                                                    ),
                                                ).length
                                            }
                                        </div>
                                        <div>
                                            {Math.round(
                                                courses
                                                    .flatMap((course) =>
                                                        course.materials.flatMap((material) =>
                                                            material.student_progress
                                                                .filter((s) => s.id === student.id)
                                                                .map((s) => s.progress_percentage),
                                                        ),
                                                    )
                                                    .reduce(
                                                        (sum, val, _, array) =>
                                                            sum + val / array.length,
                                                        0,
                                                    ),
                                            )}
                                            %
                                        </div>
                                        <div className='text-right'>
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button
                                                        variant='outline'
                                                        size='sm'
                                                        onClick={() =>
                                                            setSelectedStudentId(student.id)
                                                        }
                                                    >
                                                        View Progress
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className='max-h-[90vh] overflow-auto sm:max-w-[80vw]'>
                                                    <DialogHeader>
                                                        <DialogTitle>
                                                            Student Progress: {student.name}
                                                        </DialogTitle>
                                                        <DialogDescription>
                                                            Detailed progress across all courses and
                                                            materials
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <StudentDetailsView
                                                        studentData={selectedStudentData}
                                                    />
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
};

// Course Details Modal View
const CourseDetailsView = ({ courseData }: { courseData?: CourseProgressData }) => {
    if (!courseData) {
        return (
            <div className='flex h-40 items-center justify-center'>
                <div className='flex items-center space-x-4'>
                    <div className='h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent'></div>
                    <p>Loading course details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className='space-y-6'>
            <div className='flex items-center justify-between'>
                <div>
                    <h3 className='text-lg font-medium'>{courseData.name}</h3>
                    <p className='text-sm text-muted-foreground'>
                        {courseData.total_students} students | {courseData.materials.length}{' '}
                        materials
                    </p>
                </div>
                <div>
                    <Badge
                        variant={
                            courseData.avg_completion >= 75
                                ? 'success'
                                : courseData.avg_completion >= 50
                                  ? 'default'
                                  : 'secondary'
                        }
                    >
                        {Math.round(courseData.avg_completion)}% Avg. Completion
                    </Badge>
                </div>
            </div>

            <div className='space-y-4'>
                <h4 className='text-md font-medium'>Learning Materials</h4>

                {courseData.materials.map((material) => (
                    <Card key={material.id} className='overflow-hidden'>
                        <CardHeader className='pb-2'>
                            <div className='flex items-center justify-between'>
                                <CardTitle className='text-base'>{material.title}</CardTitle>
                                <Badge
                                    variant={
                                        material.avg_completion >= 75
                                            ? 'success'
                                            : material.avg_completion >= 50
                                              ? 'default'
                                              : 'secondary'
                                    }
                                >
                                    {Math.round(material.avg_completion)}%
                                </Badge>
                            </div>
                            <CardDescription>
                                {material.total_questions} questions |{' '}
                                {material.student_progress.length} students
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className='max-h-60 space-y-2 overflow-auto'>
                                <div className='rounded-lg border'>
                                    <div className='grid grid-cols-4 gap-2 border-b bg-muted p-2 text-sm font-medium'>
                                        <div>Student</div>
                                        <div>Completed</div>
                                        <div>Progress</div>
                                        <div>Status</div>
                                    </div>
                                    {material.student_progress.map((student) => (
                                        <div
                                            key={student.id}
                                            className='grid grid-cols-4 gap-2 border-b p-2 text-sm'
                                        >
                                            <div className='font-medium'>{student.name}</div>
                                            <div>
                                                {student.completed_questions}/
                                                {student.total_questions}
                                            </div>
                                            <div>
                                                <Progress
                                                    value={student.progress_percentage}
                                                    className='h-2'
                                                />
                                            </div>
                                            <div>
                                                {student.progress_percentage === 100 ? (
                                                    <span className='flex items-center text-green-500'>
                                                        <CheckCircle className='mr-1 h-3 w-3' />{' '}
                                                        Complete
                                                    </span>
                                                ) : student.progress_percentage > 0 ? (
                                                    <span className='flex items-center text-yellow-500'>
                                                        <BarChart3 className='mr-1 h-3 w-3' /> In
                                                        Progress
                                                    </span>
                                                ) : (
                                                    <span className='flex items-center text-gray-500'>
                                                        <XCircle className='mr-1 h-3 w-3' /> Not
                                                        Started
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

// Student Details Modal View
const StudentDetailsView = ({ studentData }: { studentData?: StudentDetailedProgressData }) => {
    if (!studentData) {
        return (
            <div className='flex h-40 items-center justify-center'>
                <div className='flex items-center space-x-4'>
                    <div className='h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent'></div>
                    <p>Loading student details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className='space-y-6'>
            <div>
                <h3 className='text-lg font-medium'>{studentData.name}</h3>
                <p className='text-sm text-muted-foreground'>
                    Enrolled in {studentData.courses.length} courses
                </p>
            </div>

            <div className='space-y-6'>
                {studentData.courses.map((course) => (
                    <Card key={course.id}>
                        <CardHeader>
                            <div className='flex items-center justify-between'>
                                <CardTitle>{course.name}</CardTitle>
                                <Badge
                                    variant={
                                        course.progress_percentage >= 75
                                            ? 'success'
                                            : course.progress_percentage >= 50
                                              ? 'default'
                                              : 'secondary'
                                    }
                                >
                                    {Math.round(course.progress_percentage)}%
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className='space-y-4'>
                            <Progress value={course.progress_percentage} className='h-2 w-full' />

                            <div className='rounded-lg border'>
                                <div className='grid grid-cols-3 gap-2 border-b bg-muted p-2 text-sm font-medium'>
                                    <div>Material</div>
                                    <div>Progress</div>
                                    <div>Status</div>
                                </div>

                                {course.materials.map((material) => (
                                    <div
                                        key={material.id}
                                        className='grid grid-cols-3 gap-2 border-b p-2 text-sm'
                                    >
                                        <div className='font-medium'>{material.title}</div>
                                        <div className='flex items-center gap-2'>
                                            <Progress
                                                value={material.progress_percentage}
                                                className='h-2 flex-1'
                                            />
                                            <span>{Math.round(material.progress_percentage)}%</span>
                                        </div>
                                        <div>
                                            {material.progress_percentage === 100 ? (
                                                <span className='flex items-center text-green-500'>
                                                    <CheckCircle className='mr-1 h-3 w-3' />{' '}
                                                    Complete
                                                </span>
                                            ) : material.progress_percentage > 0 ? (
                                                <span className='flex items-center text-yellow-500'>
                                                    <BarChart3 className='mr-1 h-3 w-3' /> In
                                                    Progress
                                                </span>
                                            ) : (
                                                <span className='flex items-center text-gray-500'>
                                                    <XCircle className='mr-1 h-3 w-3' /> Not Started
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default function Dashboard() {
    const { roles } = usePage().props.auth.user;

    return (
        <AuthenticatedLayout>
            <Head title='Dashboard' />
            <div className='flex w-full flex-col gap-8 p-4'>
                {/* SUPER ADMIN */}
                {roles.includes(RoleEnum.SUPER_ADMIN) && (
                    <>
                        <div className='space-y-2'>
                            <h1 className='text-2xl font-bold'>Admin Overview</h1>
                            <p className='text-muted-foreground'>
                                Dashboard ringkasan untuk Administrator
                            </p>
                        </div>
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            {/* Example Bar Chart for user growth */}
                            <Card className='w-full'>
                                <CardHeader>
                                    <CardTitle>Users (Bar Chart)</CardTitle>
                                    <CardDescription>6-month Growth</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ChartContainer
                                        config={adminConfig}
                                        className='h-[300px] w-full'
                                    >
                                        <BarChart data={adminBarData}>
                                            <CartesianGrid vertical={false} />
                                            <XAxis
                                                tickLine={false}
                                                dataKey='month'
                                                axisLine={false}
                                            />
                                            <YAxis />
                                            <ChartTooltip
                                                cursor={false}
                                                content={<ChartTooltipContent />}
                                            />
                                            <Bar
                                                radius={4}
                                                fill='var(--color-users)'
                                                dataKey='users'
                                            />
                                        </BarChart>
                                    </ChartContainer>
                                </CardContent>
                                <CardFooter className='text-sm'>
                                    <div className='flex gap-2 font-medium leading-none'>
                                        Trending up <TrendingUp className='h-4 w-4' />
                                    </div>
                                </CardFooter>
                            </Card>

                            {/* Example Pie Chart for roles distribution */}
                            <Card className='w-full'>
                                <CardHeader>
                                    <CardTitle>User Roles (Pie Chart)</CardTitle>
                                    <CardDescription>Admin / Guru / Siswa</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ChartContainer
                                        config={adminConfig}
                                        className='mx-auto h-[300px] w-full'
                                    >
                                        <PieChart>
                                            <ChartTooltip
                                                cursor={false}
                                                content={
                                                    <ChartTooltipContent nameKey='role' hideLabel />
                                                }
                                            />
                                            <Pie
                                                outerRadius={90}
                                                nameKey='role'
                                                innerRadius={50}
                                                dataKey='count'
                                                data={adminPieData}
                                            >
                                                <Label
                                                    content={({ viewBox }) => {
                                                        if (
                                                            viewBox &&
                                                            'cx' in viewBox &&
                                                            'cy' in viewBox
                                                        ) {
                                                            const total = adminPieData.reduce(
                                                                (acc, cur) => acc + cur.count,
                                                                0,
                                                            );
                                                            return (
                                                                <text
                                                                    y={viewBox.cy}
                                                                    x={viewBox.cx}
                                                                    textAnchor='middle'
                                                                    dominantBaseline='middle'
                                                                >
                                                                    <tspan
                                                                        y={viewBox.cy}
                                                                        x={viewBox.cx}
                                                                        className='fill-foreground text-2xl font-bold'
                                                                    >
                                                                        {total}
                                                                    </tspan>
                                                                    <tspan
                                                                        y={(viewBox.cy || 0) + 18}
                                                                        x={viewBox.cx}
                                                                        className='fill-muted-foreground text-xs'
                                                                    >
                                                                        total
                                                                    </tspan>
                                                                </text>
                                                            );
                                                        }
                                                    }}
                                                />
                                            </Pie>
                                        </PieChart>
                                    </ChartContainer>
                                </CardContent>
                            </Card>

                            {/* Example Line Chart for daily visits */}
                            <Card className='w-full'>
                                <CardHeader>
                                    <CardTitle>Site Visits (Line Chart)</CardTitle>
                                    <CardDescription>One-week data</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ChartContainer
                                        config={adminConfig}
                                        className='h-[300px] w-full'
                                    >
                                        <LineChart data={adminLineData}>
                                            <CartesianGrid vertical={false} />
                                            <XAxis dataKey='day' />
                                            <YAxis />
                                            <ChartTooltip
                                                cursor={false}
                                                content={<ChartTooltipContent />}
                                            />
                                            <Line
                                                strokeWidth={2}
                                                stroke='var(--color-visits)'
                                                dot={true}
                                                dataKey='visits'
                                            />
                                        </LineChart>
                                    </ChartContainer>
                                </CardContent>
                            </Card>

                            {/* Example Radar Chart */}
                            <Card className='w-full'>
                                <CardHeader>
                                    <CardTitle>Radar Chart Example</CardTitle>
                                    <CardDescription>January vs June</CardDescription>
                                </CardHeader>
                                <CardContent className='flex justify-center'>
                                    <ChartContainer
                                        config={adminConfig}
                                        className='mx-auto h-[300px] w-full'
                                    >
                                        <RadarChart data={adminRadarData}>
                                            <PolarGrid radialLines={false} />
                                            <PolarAngleAxis dataKey='dimension' />
                                            <ChartTooltip
                                                cursor={false}
                                                content={<ChartTooltipContent indicator='line' />}
                                            />
                                            <Radar
                                                strokeWidth={2}
                                                stroke='var(--color-january)'
                                                fillOpacity={0}
                                                fill='var(--color-january)'
                                                dataKey='january'
                                            />
                                            <Radar
                                                strokeWidth={2}
                                                stroke='var(--color-june)'
                                                fillOpacity={0}
                                                fill='var(--color-june)'
                                                dataKey='june'
                                            />
                                        </RadarChart>
                                    </ChartContainer>
                                </CardContent>
                            </Card>
                        </div>
                    </>
                )}

                {/* SCHOOL ADMIN DASHBOARD (NEW) */}
                {roles.includes(RoleEnum.SCHOOL_ADMIN) && (
                    <>
                        <div className='space-y-2'>
                            <h1 className='text-2xl font-bold'>School Admin Overview</h1>
                            <p className='text-muted-foreground'>
                                Dashboard ringkasan untuk Sekolah
                            </p>
                        </div>
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            {/* bar chart - total staff, guru, siswa */}
                            <Card className='w-full'>
                                <CardHeader>
                                    <CardTitle>Populasi Sekolah (Bar Chart)</CardTitle>
                                    <CardDescription>Staff, Guru, Siswa</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ChartContainer
                                        config={schoolConfig}
                                        className='h-[300px] w-full'
                                    >
                                        <BarChart data={schoolBarData}>
                                            <CartesianGrid vertical={false} />
                                            <XAxis dataKey='name' />
                                            <YAxis />
                                            <ChartTooltip
                                                cursor={false}
                                                content={<ChartTooltipContent />}
                                            />
                                            <Bar
                                                radius={4}
                                                fill='hsl(var(--chart-1))'
                                                dataKey='count'
                                            />
                                        </BarChart>
                                    </ChartContainer>
                                </CardContent>
                                <CardFooter className='text-sm'>
                                    <div className='flex gap-2 font-medium leading-none'>
                                        Current Stats <TrendingUp className='h-4 w-4' />
                                    </div>
                                </CardFooter>
                            </Card>

                            {/* pie chart - inventory/resources */}
                            <Card className='w-full'>
                                <CardHeader>
                                    <CardTitle>Fasilitas Sekolah (Pie)</CardTitle>
                                    <CardDescription>Lab, Projectors, etc.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ChartContainer
                                        config={schoolConfig}
                                        className='mx-auto h-[300px] w-full'
                                    >
                                        <PieChart>
                                            <ChartTooltip
                                                cursor={false}
                                                content={
                                                    <ChartTooltipContent nameKey='name' hideLabel />
                                                }
                                            />
                                            <Pie
                                                outerRadius={90}
                                                nameKey='name'
                                                innerRadius={50}
                                                dataKey='value'
                                                data={schoolPieData}
                                            >
                                                <Label
                                                    content={({ viewBox }) => {
                                                        if (
                                                            viewBox &&
                                                            'cx' in viewBox &&
                                                            'cy' in viewBox
                                                        ) {
                                                            const total = schoolPieData.reduce(
                                                                (acc, cur) => acc + cur.value,
                                                                0,
                                                            );
                                                            return (
                                                                <text
                                                                    y={viewBox.cy}
                                                                    x={viewBox.cx}
                                                                    textAnchor='middle'
                                                                    dominantBaseline='middle'
                                                                >
                                                                    <tspan
                                                                        y={viewBox.cy}
                                                                        x={viewBox.cx}
                                                                        className='fill-foreground text-2xl font-bold'
                                                                    >
                                                                        {total}
                                                                    </tspan>
                                                                    <tspan
                                                                        y={(viewBox.cy || 0) + 18}
                                                                        x={viewBox.cx}
                                                                        className='fill-muted-foreground text-xs'
                                                                    >
                                                                        Items
                                                                    </tspan>
                                                                </text>
                                                            );
                                                        }
                                                    }}
                                                />
                                            </Pie>
                                        </PieChart>
                                    </ChartContainer>
                                </CardContent>
                            </Card>

                            {/* radar chart - comparison january vs june, e.g. total classes? */}
                            <Card className='w-full'>
                                <CardHeader>
                                    <CardTitle>Perkembangan Kelas (Radar)</CardTitle>
                                    <CardDescription>Januari vs Juni</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ChartContainer
                                        config={schoolConfig}
                                        className='mx-auto h-[300px] w-full'
                                    >
                                        <RadarChart data={schoolRadarData}>
                                            <PolarGrid radialLines={false} />
                                            <PolarAngleAxis dataKey='dimension' />
                                            <ChartTooltip
                                                cursor={false}
                                                content={<ChartTooltipContent indicator='line' />}
                                            />
                                            <Radar
                                                strokeWidth={2}
                                                stroke='var(--color-january)'
                                                fillOpacity={0}
                                                fill='var(--color-january)'
                                                dataKey='january'
                                            />
                                            <Radar
                                                strokeWidth={2}
                                                stroke='var(--color-june)'
                                                fillOpacity={0}
                                                fill='var(--color-june)'
                                                dataKey='june'
                                            />
                                        </RadarChart>
                                    </ChartContainer>
                                </CardContent>
                            </Card>

                            {/* radial chart - maybe average performance by levels? */}
                            <Card className='w-full'>
                                <CardHeader>
                                    <CardTitle>Performa Nilai (Radial Chart)</CardTitle>
                                    <CardDescription>SD, SMP, SMA</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ChartContainer
                                        config={schoolConfig}
                                        className='mx-auto h-[300px] w-full'
                                    >
                                        <RadialBarChart
                                            startAngle={180}
                                            outerRadius={100}
                                            innerRadius={30}
                                            endAngle={-180}
                                            data={schoolRadialData}
                                        >
                                            <ChartTooltip
                                                cursor={false}
                                                content={
                                                    <ChartTooltipContent
                                                        nameKey='name'
                                                        key='performance'
                                                        hideLabel
                                                    />
                                                }
                                            />
                                            <RadialBar dataKey='performance' background />
                                        </RadialBarChart>
                                    </ChartContainer>
                                </CardContent>
                            </Card>
                        </div>
                    </>
                )}

                {/* TEACHER */}
                {roles.includes(RoleEnum.TEACHER) && (
                    <>
                        <div className='space-y-2'>
                            <h1 className='text-2xl font-bold'>Guru Overview</h1>
                            <p className='text-muted-foreground'>Dashboard ringkasan untuk Guru</p>
                        </div>

                        {/* Student Task Tracking System */}
                        <StudentTaskTrackingSection />

                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            {/* Kelas average bar chart */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Rata-rata Nilai Tiap Kelas</CardTitle>
                                    <CardDescription>Bar Chart</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ChartContainer
                                        config={guruConfig}
                                        className='h-[300px] w-full'
                                    >
                                        <BarChart data={guruBarData}>
                                            <CartesianGrid vertical={false} />
                                            <XAxis dataKey='kelas' />
                                            <YAxis />
                                            <ChartTooltip
                                                cursor={false}
                                                content={<ChartTooltipContent />}
                                            />
                                            <Bar
                                                radius={4}
                                                fill='var(--color-averageScore)'
                                                dataKey='averageScore'
                                            />
                                        </BarChart>
                                    </ChartContainer>
                                </CardContent>
                            </Card>

                            {/* Completion Pie */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Module Completion (Pie Chart)</CardTitle>
                                    <CardDescription>All Classes</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ChartContainer
                                        config={guruConfig}
                                        className='mx-auto h-[300px] w-full'
                                    >
                                        <PieChart>
                                            <ChartTooltip
                                                cursor={false}
                                                content={
                                                    <ChartTooltipContent
                                                        nameKey='label'
                                                        hideLabel
                                                    />
                                                }
                                            />
                                            <Pie
                                                outerRadius={90}
                                                nameKey='label'
                                                innerRadius={50}
                                                dataKey='value'
                                                data={guruPieData}
                                            />
                                        </PieChart>
                                    </ChartContainer>
                                </CardContent>
                            </Card>

                            {/* Radar chart for modules */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Module Mastery (Radar)</CardTitle>
                                    <CardDescription>Comparison Score by Guru</CardDescription>
                                </CardHeader>
                                <CardContent className='flex justify-center'>
                                    <ChartContainer
                                        config={guruConfig}
                                        className='mx-auto h-[300px] w-full'
                                    >
                                        <RadarChart data={guruRadarData}>
                                            <ChartTooltip
                                                cursor={false}
                                                content={<ChartTooltipContent indicator='line' />}
                                            />
                                            <PolarGrid radialLines={false} />
                                            <PolarAngleAxis dataKey='module' />
                                            <Radar
                                                stroke='var(--color-score)'
                                                fillOpacity={0.15}
                                                fill='var(--color-score)'
                                                dataKey='score'
                                            />
                                        </RadarChart>
                                    </ChartContainer>
                                </CardContent>
                            </Card>

                            {/* Radial bar for top students */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Top 5 Siswa (Radial)</CardTitle>
                                    <CardDescription>Progress Tertinggi</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ChartContainer
                                        config={guruConfig}
                                        className='mx-auto h-[300px] w-full'
                                    >
                                        <RadialBarChart
                                            startAngle={180}
                                            outerRadius={100}
                                            innerRadius={30}
                                            endAngle={-180}
                                            data={guruRadialData}
                                        >
                                            <ChartTooltip
                                                cursor={false}
                                                content={
                                                    <ChartTooltipContent
                                                        nameKey='name'
                                                        key='progress'
                                                        hideLabel
                                                    />
                                                }
                                            />
                                            <RadialBar dataKey='progress' background />
                                        </RadialBarChart>
                                    </ChartContainer>
                                </CardContent>
                            </Card>
                        </div>
                    </>
                )}

                {/* STUDENT */}
                {roles.includes(RoleEnum.STUDENT) && (
                    <>
                        <div className='space-y-2'>
                            <h1 className='text-2xl font-bold'>Siswa Dashboard</h1>
                            <p className='text-muted-foreground'>
                                Lihat perkembangan belajarmu di sini
                            </p>
                        </div>

                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            {/* Area chart progress */}
                            <Card className='w-full'>
                                <CardHeader>
                                    <CardTitle>Progress Belajar (Area Chart)</CardTitle>
                                    <CardDescription>Sejak pertama bergabung</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ChartContainer
                                        config={siswaConfig}
                                        className='h-[300px] w-full'
                                    >
                                        <AreaChart data={siswaAreaData}>
                                            <defs>
                                                <linearGradient
                                                    y2='1'
                                                    y1='0'
                                                    x2='0'
                                                    x1='0'
                                                    id='fillProgress'
                                                >
                                                    <stop
                                                        stopOpacity={0.8}
                                                        stopColor='var(--color-progress)'
                                                        offset='5%'
                                                    />
                                                    <stop
                                                        stopOpacity={0.1}
                                                        stopColor='var(--color-progress)'
                                                        offset='95%'
                                                    />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid vertical={false} />
                                            <XAxis
                                                tickFormatter={(value) => {
                                                    const d = new Date(value);
                                                    return d.toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                    });
                                                }}
                                                dataKey='date'
                                            />
                                            <YAxis />
                                            <ChartTooltip
                                                cursor={false}
                                                content={<ChartTooltipContent />}
                                            />
                                            <Area
                                                type='monotone'
                                                stroke='var(--color-progress)'
                                                fill='url(#fillProgress)'
                                                dataKey='progress'
                                            />
                                        </AreaChart>
                                    </ChartContainer>
                                </CardContent>
                            </Card>

                            {/* Bloom level distribution */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Tingkat Kognitif Bloom (Pie)</CardTitle>
                                    <CardDescription>Hasil Klasifikasi</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ChartContainer
                                        config={siswaConfig}
                                        className='mx-auto h-[300px] w-full'
                                    >
                                        <PieChart>
                                            <ChartTooltip
                                                cursor={false}
                                                content={
                                                    <ChartTooltipContent
                                                        nameKey='level'
                                                        hideLabel
                                                    />
                                                }
                                            />
                                            <Pie
                                                outerRadius={90}
                                                nameKey='level'
                                                innerRadius={50}
                                                dataKey='value'
                                                data={siswaPieData}
                                            />
                                        </PieChart>
                                    </ChartContainer>
                                </CardContent>
                            </Card>

                            {/* Bar Chart - modul tracking */}
                            <Card className='w-full'>
                                <CardHeader>
                                    <CardTitle>Modul Belum Dikerjakan (Bar)</CardTitle>
                                    <CardDescription>Progress modul personal</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ChartContainer
                                        config={siswaConfig}
                                        className='h-[300px] w-full'
                                    >
                                        <BarChart data={siswaBarData}>
                                            <CartesianGrid vertical={false} />
                                            <XAxis dataKey='modul' />
                                            <YAxis />
                                            <ChartTooltip
                                                cursor={false}
                                                content={<ChartTooltipContent />}
                                            />
                                            <Bar
                                                radius={4}
                                                fill='hsl(var(--chart-2))'
                                                dataKey='done'
                                            />
                                        </BarChart>
                                    </ChartContainer>
                                </CardContent>
                                <CardFooter className='text-sm'>
                                    <div className='flex gap-2 font-medium leading-none'>
                                        1 = Selesai, 0 = Belum
                                    </div>
                                </CardFooter>
                            </Card>
                        </div>
                    </>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
