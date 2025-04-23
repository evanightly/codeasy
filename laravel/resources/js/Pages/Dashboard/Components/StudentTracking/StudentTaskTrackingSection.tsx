import { Badge } from '@/Components/UI/badge';
import { Button } from '@/Components/UI/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/UI/card';
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
import {
    CourseProgressData,
    StudentDetailedProgressData,
} from '@/Support/Interfaces/Resources/DashboardResource';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { BarChart3, BookOpen, CheckCircle, User, XCircle } from 'lucide-react';
import { useState } from 'react';

// Course Details Modal View Component
const CourseDetailsView = ({ courseData }: { courseData?: CourseProgressData }) => {
    const { t } = useLaravelReactI18n();

    if (!courseData) {
        return (
            <div className='flex h-40 items-center justify-center'>
                <div className='flex items-center space-x-4'>
                    <div className='h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent'></div>
                    <p>{t('pages.dashboard.student_tracking.loading.course_details')}</p>
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
                        {courseData.total_students}{' '}
                        {t('pages.dashboard.student_tracking.labels.students')} |{' '}
                        {courseData.materials.length}{' '}
                        {t('pages.dashboard.student_tracking.labels.materials')}
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
                        {Math.round(courseData.avg_completion)}%{' '}
                        {t('pages.dashboard.student_tracking.labels.avg_completion')}
                    </Badge>
                </div>
            </div>

            <div className='space-y-4'>
                <h4 className='text-md font-medium'>
                    {t('pages.dashboard.student_tracking.sections.learning_materials')}
                </h4>

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
                                {material.total_questions}{' '}
                                {t('pages.dashboard.student_tracking.labels.questions')} |{' '}
                                {material.student_progress.length}{' '}
                                {t('pages.dashboard.student_tracking.labels.students')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className='max-h-60 space-y-2 overflow-auto'>
                                <div className='rounded-lg border'>
                                    <div className='grid grid-cols-4 gap-2 border-b bg-muted p-2 text-sm font-medium'>
                                        <div>
                                            {t('pages.dashboard.student_tracking.columns.student')}
                                        </div>
                                        <div>
                                            {t(
                                                'pages.dashboard.student_tracking.columns.completed',
                                            )}
                                        </div>
                                        <div>
                                            {t('pages.dashboard.student_tracking.columns.progress')}
                                        </div>
                                        <div>
                                            {t('pages.dashboard.student_tracking.columns.status')}
                                        </div>
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
                                                        {t(
                                                            'pages.dashboard.student_tracking.status.complete',
                                                        )}
                                                    </span>
                                                ) : student.progress_percentage > 0 ? (
                                                    <span className='flex items-center text-yellow-500'>
                                                        <BarChart3 className='mr-1 h-3 w-3' />{' '}
                                                        {t(
                                                            'pages.dashboard.student_tracking.status.in_progress',
                                                        )}
                                                    </span>
                                                ) : (
                                                    <span className='flex items-center text-gray-500'>
                                                        <XCircle className='mr-1 h-3 w-3' />{' '}
                                                        {t(
                                                            'pages.dashboard.student_tracking.status.not_started',
                                                        )}
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

// Student Details Modal View Component
const StudentDetailsView = ({ studentData }: { studentData?: StudentDetailedProgressData }) => {
    const { t } = useLaravelReactI18n();

    if (!studentData) {
        return (
            <div className='flex h-40 items-center justify-center'>
                <div className='flex items-center space-x-4'>
                    <div className='h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent'></div>
                    <p>{t('pages.dashboard.student_tracking.loading.student_details')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className='space-y-6'>
            <div>
                <h3 className='text-lg font-medium'>{studentData.name}</h3>
                <p className='text-sm text-muted-foreground'>
                    {t('pages.dashboard.student_tracking.labels.enrolled_in')}{' '}
                    {studentData.courses.length}{' '}
                    {t('pages.dashboard.student_tracking.labels.courses')}
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
                                    <div>
                                        {t('pages.dashboard.student_tracking.columns.material')}
                                    </div>
                                    <div>
                                        {t('pages.dashboard.student_tracking.columns.progress')}
                                    </div>
                                    <div>
                                        {t('pages.dashboard.student_tracking.columns.status')}
                                    </div>
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
                                                    {t(
                                                        'pages.dashboard.student_tracking.status.complete',
                                                    )}
                                                </span>
                                            ) : material.progress_percentage > 0 ? (
                                                <span className='flex items-center text-yellow-500'>
                                                    <BarChart3 className='mr-1 h-3 w-3' />{' '}
                                                    {t(
                                                        'pages.dashboard.student_tracking.status.in_progress',
                                                    )}
                                                </span>
                                            ) : (
                                                <span className='flex items-center text-gray-500'>
                                                    <XCircle className='mr-1 h-3 w-3' />{' '}
                                                    {t(
                                                        'pages.dashboard.student_tracking.status.not_started',
                                                    )}
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

// Main Student Task Tracking Section Component
export default function StudentTaskTrackingSection() {
    const { t } = useLaravelReactI18n();
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
                    <CardTitle>{t('pages.dashboard.student_tracking.title')}</CardTitle>
                    <CardDescription>
                        {t('pages.dashboard.student_tracking.loading.dashboard_data')}
                    </CardDescription>
                </CardHeader>
                <CardContent className='flex justify-center py-6'>
                    <div className='flex items-center space-x-4'>
                        <div className='h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent'></div>
                        <p>{t('pages.dashboard.student_tracking.loading.progress_data')}</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!dashboardData?.teacherData) {
        return (
            <Card className='w-full'>
                <CardHeader>
                    <CardTitle>{t('pages.dashboard.student_tracking.title')}</CardTitle>
                    <CardDescription>
                        {t('pages.dashboard.student_tracking.no_data.title')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p>{t('pages.dashboard.student_tracking.no_data.description')}</p>
                </CardContent>
            </Card>
        );
    }

    const { courses, stats } = dashboardData.teacherData;

    if (!courses || courses.length === 0) {
        return (
            <Card className='w-full'>
                <CardHeader>
                    <CardTitle>{t('pages.dashboard.student_tracking.no_courses.title')}</CardTitle>
                    <CardDescription>
                        {t('pages.dashboard.student_tracking.no_courses.subtitle')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p>{t('pages.dashboard.student_tracking.no_courses.description')}</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className='w-full'>
            <CardHeader>
                <CardTitle>{t('pages.dashboard.student_tracking.title')}</CardTitle>
                <CardDescription>
                    {t('pages.dashboard.student_tracking.description')}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue='overview' className='w-full'>
                    <TabsList className='mb-4'>
                        <TabsTrigger value='overview'>
                            {t('pages.dashboard.student_tracking.tabs.overview')}
                        </TabsTrigger>
                        <TabsTrigger value='courses'>
                            {t('pages.dashboard.student_tracking.tabs.courses')}
                        </TabsTrigger>
                        <TabsTrigger value='students'>
                            {t('pages.dashboard.student_tracking.tabs.students')}
                        </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value='overview' className='space-y-4'>
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                            <div className='rounded-lg border bg-card p-4'>
                                <div className='flex items-center gap-2'>
                                    <BookOpen className='h-5 w-5 text-primary' />
                                    <h3 className='text-lg font-medium'>
                                        {t('pages.dashboard.student_tracking.stats.total_courses')}
                                    </h3>
                                </div>
                                <p className='mt-2 text-3xl font-bold'>{courses.length}</p>
                            </div>

                            <div className='rounded-lg border bg-card p-4'>
                                <div className='flex items-center gap-2'>
                                    <User className='h-5 w-5 text-primary' />
                                    <h3 className='text-lg font-medium'>
                                        {t('pages.dashboard.student_tracking.stats.total_students')}
                                    </h3>
                                </div>
                                <p className='mt-2 text-3xl font-bold'>{stats.total_students}</p>
                            </div>

                            <div className='rounded-lg border bg-card p-4'>
                                <div className='flex items-center gap-2'>
                                    <CheckCircle className='h-5 w-5 text-green-500' />
                                    <h3 className='text-lg font-medium'>
                                        {t(
                                            'pages.dashboard.student_tracking.stats.completed_courses',
                                        )}
                                    </h3>
                                </div>
                                <p className='mt-2 text-3xl font-bold'>{stats.completed_courses}</p>
                            </div>
                        </div>

                        <div className='mt-6 space-y-2'>
                            <h3 className='text-lg font-medium'>
                                {t('pages.dashboard.student_tracking.sections.course_completion')}
                            </h3>
                            <div className='space-y-4'>
                                {courses.map((course) => (
                                    <div key={course.id} className='space-y-2'>
                                        <div className='flex items-center justify-between'>
                                            <span className='font-medium'>{course.name}</span>
                                            <span className='text-sm'>
                                                {Math.round(course.avg_completion)}%{' '}
                                                {t(
                                                    'pages.dashboard.student_tracking.labels.complete',
                                                )}
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
                            <h3 className='mb-2 text-lg font-medium'>
                                {t('pages.dashboard.student_tracking.sections.top_students')}
                            </h3>
                            <div className='rounded-lg border'>
                                <div className='grid grid-cols-3 gap-4 border-b p-3 font-medium'>
                                    <div>
                                        {t('pages.dashboard.student_tracking.columns.student')}
                                    </div>
                                    <div>
                                        {t('pages.dashboard.student_tracking.columns.courses')}
                                    </div>
                                    <div>
                                        {t('pages.dashboard.student_tracking.columns.avg_score')}
                                    </div>
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
                                            {course.total_students}{' '}
                                            {t(
                                                'pages.dashboard.student_tracking.labels.students_enrolled',
                                            )}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className='pb-2'>
                                        <div className='mb-4 flex items-center gap-2'>
                                            <div>
                                                <div className='text-sm text-muted-foreground'>
                                                    {t(
                                                        'pages.dashboard.student_tracking.labels.avg_completion',
                                                    )}
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
                                                {t(
                                                    'pages.dashboard.student_tracking.labels.materials',
                                                )}{' '}
                                                ({course.materials.length})
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
                                    <CardContent className='border-t bg-muted/50 px-4 py-2'>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button
                                                    variant='outline'
                                                    size='sm'
                                                    onClick={() => setSelectedCourseId(course.id)}
                                                    className='w-full'
                                                >
                                                    {t(
                                                        'pages.dashboard.student_tracking.actions.view_details',
                                                    )}
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className='max-h-[90vh] overflow-auto sm:max-w-[80vw]'>
                                                <DialogHeader>
                                                    <DialogTitle>
                                                        {t(
                                                            'pages.dashboard.student_tracking.dialogs.course_details.title',
                                                            { name: course.name },
                                                        )}
                                                    </DialogTitle>
                                                    <DialogDescription>
                                                        {t(
                                                            'pages.dashboard.student_tracking.dialogs.course_details.description',
                                                        )}
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <CourseDetailsView
                                                    courseData={selectedCourseData}
                                                />
                                            </DialogContent>
                                        </Dialog>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    {/* Students Tab */}
                    <TabsContent value='students'>
                        <p className='mb-4 text-muted-foreground'>
                            {t('pages.dashboard.student_tracking.instructions.click_student')}
                        </p>

                        <div className='rounded-lg border'>
                            <div className='grid grid-cols-4 gap-4 border-b bg-muted p-3 font-medium'>
                                <div>
                                    {t('pages.dashboard.student_tracking.columns.student_name')}
                                </div>
                                <div>{t('pages.dashboard.student_tracking.columns.courses')}</div>
                                <div>{t('pages.dashboard.student_tracking.columns.progress')}</div>
                                <div className='text-right'>
                                    {t('pages.dashboard.student_tracking.columns.actions')}
                                </div>
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
                                                        {t(
                                                            'pages.dashboard.student_tracking.actions.view_progress',
                                                        )}
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className='max-h-[90vh] overflow-auto sm:max-w-[80vw]'>
                                                    <DialogHeader>
                                                        <DialogTitle>
                                                            {t(
                                                                'pages.dashboard.student_tracking.dialogs.student_progress.title',
                                                                { name: student.name },
                                                            )}
                                                        </DialogTitle>
                                                        <DialogDescription>
                                                            {t(
                                                                'pages.dashboard.student_tracking.dialogs.student_progress.description',
                                                            )}
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
}
