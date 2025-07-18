import { Badge } from '@/Components/UI/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/UI/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/Components/UI/chart';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/Components/UI/dialog';
import { Skeleton } from '@/Components/UI/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/UI/tabs';
import { dashboardServiceHook } from '@/Services/dashboardServiceHook';
import {
    CourseData,
    TeacherLatestProgressData,
} from '@/Support/Interfaces/Resources/DashboardResource';
import { format } from 'date-fns';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import {
    AlertCircle,
    BookOpen,
    CheckCircle,
    Clock,
    FileText,
    HelpCircle,
    User,
} from 'lucide-react';
import { useState } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
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
import { ActiveUsersCard } from '../../ActiveUsersCard';
import {
    teacherBarData,
    teacherConfig,
    teacherPieData,
    teacherRadarData,
    teacherRadialData,
} from '../../chartData';
import { CourseCard } from './CourseCard';

export function TeacherCharts() {
    const { t } = useLaravelReactI18n();
    const { data: latestProgressData, isLoading: isLatestProgressLoading } =
        dashboardServiceHook.useGetTeacherLatestProgress();
    const { data: teacherCourses, isLoading: isTeacherCoursesLoading } =
        dashboardServiceHook.useGetTeacherCourses();

    const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const { data: selectedCourseProgress, isLoading: isCourseProgressLoading } =
        dashboardServiceHook.useGetCourseLatestProgress(selectedCourseId || 0);

    const { data: courseStudentsNoProgress, isLoading: isStudentsNoProgressLoading } =
        dashboardServiceHook.useGetCourseStudentsNoProgress(selectedCourseId || 0);

    // Helper function to format time ago
    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return format(date, 'MMM dd, HH:mm');
    };

    // Helper function to get status badge
    const getStatusBadge = (activity: TeacherLatestProgressData['activity']) => {
        if (activity.completion_status) {
            return (
                <Badge variant='default' className='bg-green-100 text-green-800 hover:bg-green-100'>
                    <CheckCircle className='mr-1 h-3 w-3' />
                    {t('pages.dashboard.teacher.latest_progress.status.completed')}
                </Badge>
            );
        } else if (activity.trial_status) {
            return (
                <Badge
                    variant='secondary'
                    className='bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                >
                    <AlertCircle className='mr-1 h-3 w-3' />
                    {t('pages.dashboard.teacher.latest_progress.status.in_progress')}
                </Badge>
            );
        } else {
            return (
                <Badge variant='outline' className='bg-gray-100 text-gray-600 hover:bg-gray-100'>
                    <HelpCircle className='mr-1 h-3 w-3' />
                    {t('pages.dashboard.teacher.latest_progress.status.started')}
                </Badge>
            );
        }
    };

    // Render individual progress item
    const renderProgressItem = (
        progressItem: TeacherLatestProgressData,
        index: number | string,
    ) => (
        <div key={index} className='rounded-lg border p-4 transition-colors hover:bg-muted/50'>
            <div className='flex items-start justify-between'>
                <div className='flex-1 space-y-2'>
                    <div className='flex items-center gap-2'>
                        <User className='h-4 w-4 text-muted-foreground' />
                        <span className='font-medium'>{progressItem.student.name}</span>
                        {getStatusBadge(progressItem.activity)}
                    </div>

                    <div className='grid grid-cols-1 gap-2 text-sm text-muted-foreground md:grid-cols-3'>
                        <div className='flex items-center gap-1'>
                            <BookOpen className='h-3 w-3' />
                            <span className='font-medium'>
                                {t('pages.dashboard.teacher.latest_progress.labels.course')}:
                            </span>
                            <span>{progressItem.course.name}</span>
                        </div>

                        <div className='flex items-center gap-1'>
                            <FileText className='h-3 w-3' />
                            <span className='font-medium'>
                                {t('pages.dashboard.teacher.latest_progress.labels.material')}:
                            </span>
                            <span>{progressItem.material.title}</span>
                        </div>

                        <div className='flex items-center gap-1'>
                            <HelpCircle className='h-3 w-3' />
                            <span className='font-medium'>
                                {t('pages.dashboard.teacher.latest_progress.labels.question')}:
                            </span>
                            <span>{progressItem.question.title}</span>
                        </div>
                    </div>

                    <div className='flex items-center gap-4 text-xs text-muted-foreground'>
                        <div className='flex items-center gap-1'>
                            <span className='font-medium'>
                                {t('pages.dashboard.teacher.latest_progress.labels.score')}:
                            </span>
                            <span
                                className={`rounded px-2 py-1 ${
                                    progressItem.activity.score >= 80
                                        ? 'bg-green-100 text-green-800'
                                        : progressItem.activity.score >= 60
                                          ? 'bg-yellow-100 text-yellow-800'
                                          : 'bg-red-100 text-red-800'
                                }`}
                            >
                                {progressItem.activity.score}%
                            </span>
                        </div>

                        <div className='flex items-center gap-1'>
                            <span className='font-medium'>
                                {t('pages.dashboard.teacher.latest_progress.labels.time_spent')}:
                            </span>
                            <span>
                                {Math.floor(progressItem.activity.coding_time / 60)}m{' '}
                                {progressItem.activity.coding_time % 60}s
                            </span>
                        </div>
                    </div>
                </div>

                <div className='text-right'>
                    <div className='text-xs text-muted-foreground'>
                        {formatTimeAgo(progressItem.activity.last_updated)}
                    </div>
                </div>
            </div>
        </div>
    );

    // Render loading state
    const renderLoadingState = () => (
        <div className='space-y-4'>
            {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className='flex items-center space-x-4'>
                    <Skeleton className='h-12 w-12 rounded-full' />
                    <div className='flex-1 space-y-2'>
                        <Skeleton className='h-4 w-[200px]' />
                        <Skeleton className='h-4 w-[300px]' />
                    </div>
                    <Skeleton className='h-6 w-[80px]' />
                </div>
            ))}
        </div>
    );

    // Render empty state
    const renderEmptyState = () => (
        <div className='py-8 text-center'>
            <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted'>
                <User className='h-8 w-8 text-muted-foreground' />
            </div>
            <h3 className='text-lg font-medium text-muted-foreground'>
                {t('pages.dashboard.teacher.latest_progress.no_activity.title')}
            </h3>
            <p className='text-sm text-muted-foreground'>
                {t('pages.dashboard.teacher.latest_progress.no_activity.description')}
            </p>
        </div>
    );

    return (
        <>
            <div className='space-y-2'>
                <h1 className='text-2xl font-bold'>{t('pages.dashboard.teacher.title')}</h1>
                <p className='text-muted-foreground'>{t('pages.dashboard.teacher.subtitle')}</p>
            </div>

            {/* Active Users Card */}
            <ActiveUsersCard />

            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                {/* Class Average Bar Chart */}
                <Card data-testid='teacher-class-scores-bar-chart'>
                    <CardHeader>
                        <CardTitle>
                            {t('pages.dashboard.teacher.chart_titles.class_scores')}
                        </CardTitle>
                        <CardDescription>
                            {t('pages.dashboard.teacher.chart_titles.class_scores_description')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={teacherConfig} className='h-[300px] w-full'>
                            <BarChart data={teacherBarData}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey='kelas' />
                                <YAxis />
                                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                <Bar
                                    radius={4}
                                    fill='var(--color-averageScore)'
                                    dataKey='averageScore'
                                />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* Module Completion Pie Chart */}
                <Card data-testid='teacher-module-completion-pie-chart'>
                    <CardHeader>
                        <CardTitle>
                            {t('pages.dashboard.teacher.chart_titles.module_completion')}
                        </CardTitle>
                        <CardDescription>
                            {t(
                                'pages.dashboard.teacher.chart_titles.module_completion_description',
                            )}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={teacherConfig} className='mx-auto h-[300px] w-full'>
                            <PieChart>
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent nameKey='label' hideLabel />}
                                />
                                <Pie
                                    outerRadius={90}
                                    nameKey='label'
                                    innerRadius={50}
                                    dataKey='value'
                                    data={teacherPieData}
                                />
                            </PieChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* Module Mastery Radar Chart */}
                <Card data-testid='teacher-subject-mastery-radar-chart'>
                    <CardHeader>
                        <CardTitle>
                            {t('pages.dashboard.teacher.chart_titles.subject_mastery')}
                        </CardTitle>
                        <CardDescription>
                            {t('pages.dashboard.teacher.chart_titles.subject_mastery_description')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className='flex justify-center'>
                        <ChartContainer config={teacherConfig} className='mx-auto h-[300px] w-full'>
                            <RadarChart data={teacherRadarData}>
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

                {/* Top Students Radial Chart */}
                <Card data-testid='teacher-top-students-radial-chart'>
                    <CardHeader>
                        <CardTitle>
                            {t('pages.dashboard.teacher.chart_titles.top_students')}
                        </CardTitle>
                        <CardDescription>
                            {t('pages.dashboard.teacher.chart_titles.top_students_description')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={teacherConfig} className='mx-auto h-[300px] w-full'>
                            <RadialBarChart
                                startAngle={180}
                                outerRadius={100}
                                innerRadius={30}
                                endAngle={-180}
                                data={teacherRadialData}
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

            {/* Latest Student Progress Section with Tabs */}
            <Card data-testid='teacher-student-progress-section' className='w-full'>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                        <Clock className='h-5 w-5' />
                        {t('pages.dashboard.teacher.latest_progress.title')}
                    </CardTitle>
                    <CardDescription>
                        {t('pages.dashboard.teacher.latest_progress.description')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue='overview' className='w-full'>
                        <TabsList className='grid w-full grid-cols-2'>
                            <TabsTrigger value='overview'>
                                {t('pages.dashboard.teacher.latest_progress.tabs.overview')}
                            </TabsTrigger>
                            <TabsTrigger value='courses'>
                                {t('pages.dashboard.teacher.latest_progress.tabs.courses')}
                            </TabsTrigger>
                        </TabsList>

                        {/* Overview Tab */}
                        <TabsContent value='overview' className='mt-4'>
                            {isLatestProgressLoading ? (
                                renderLoadingState()
                            ) : !latestProgressData || latestProgressData.length === 0 ? (
                                renderEmptyState()
                            ) : (
                                <div className='space-y-4'>
                                    {latestProgressData
                                        .slice(0, 10)
                                        .map(
                                            (
                                                progressItem: TeacherLatestProgressData,
                                                index: number,
                                            ) => renderProgressItem(progressItem, index),
                                        )}

                                    {latestProgressData.length > 10 && (
                                        <div className='pt-2 text-center text-sm text-muted-foreground'>
                                            {t(
                                                'pages.dashboard.teacher.latest_progress.showing_recent',
                                                {
                                                    count: 10,
                                                    total: latestProgressData.length,
                                                },
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </TabsContent>

                        {/* Courses Tab */}
                        <TabsContent value='courses' className='mt-4'>
                            {isTeacherCoursesLoading ? (
                                renderLoadingState()
                            ) : !teacherCourses || teacherCourses.length === 0 ? (
                                renderEmptyState()
                            ) : (
                                <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                                    {teacherCourses.map((course: CourseData) => (
                                        <CourseCard
                                            onClick={() => {
                                                setSelectedCourseId(course.id);
                                                setIsDialogOpen(true);
                                            }}
                                            key={course.id}
                                            course={course}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Course Progress Dialog */}
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogContent className='max-h-[80vh] max-w-4xl overflow-y-auto'>
                                    <DialogHeader>
                                        <DialogTitle className='flex items-center gap-2'>
                                            <BookOpen className='h-5 w-5' />
                                            {selectedCourseId && teacherCourses
                                                ? teacherCourses.find(
                                                      (c) => c.id === selectedCourseId,
                                                  )?.name
                                                : t(
                                                      'pages.dashboard.teacher.latest_progress.dialog.course_progress_title',
                                                  )}
                                        </DialogTitle>
                                        <DialogDescription>
                                            {t(
                                                'pages.dashboard.teacher.latest_progress.showing_recent_for_course',
                                                {
                                                    count: selectedCourseProgress?.length || 0,
                                                    total: selectedCourseProgress?.length || 0,
                                                    course:
                                                        (selectedCourseId && teacherCourses
                                                            ? teacherCourses.find(
                                                                  (c) => c.id === selectedCourseId,
                                                              )?.name
                                                            : '') || '',
                                                },
                                            )}
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className='mt-4'>
                                        <Tabs defaultValue='recent-progress' className='w-full'>
                                            <TabsList className='grid w-full grid-cols-2'>
                                                <TabsTrigger value='recent-progress'>
                                                    {t(
                                                        'pages.dashboard.teacher.latest_progress.tabs.recent_progress',
                                                    )}
                                                </TabsTrigger>
                                                <TabsTrigger value='no-progress'>
                                                    {t(
                                                        'pages.dashboard.teacher.latest_progress.tabs.no_progress',
                                                    )}
                                                </TabsTrigger>
                                            </TabsList>

                                            {/* Recent Progress Tab */}
                                            <TabsContent value='recent-progress' className='mt-4'>
                                                {isCourseProgressLoading ? (
                                                    renderLoadingState()
                                                ) : !selectedCourseProgress ||
                                                  selectedCourseProgress.length === 0 ? (
                                                    renderEmptyState()
                                                ) : (
                                                    <div className='space-y-4'>
                                                        {selectedCourseProgress.map(
                                                            (
                                                                progressItem: TeacherLatestProgressData,
                                                                index: number,
                                                            ) =>
                                                                renderProgressItem(
                                                                    progressItem,
                                                                    `dialog-${index}`,
                                                                ),
                                                        )}
                                                    </div>
                                                )}
                                            </TabsContent>

                                            {/* No Progress Tab */}
                                            <TabsContent value='no-progress' className='mt-4'>
                                                {isStudentsNoProgressLoading ? (
                                                    <div className='flex h-40 items-center justify-center'>
                                                        <div className='flex items-center space-x-4'>
                                                            <div className='h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent'></div>
                                                            <p>
                                                                {t(
                                                                    'pages.dashboard.teacher.latest_progress.loading.no_progress_data',
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ) : !courseStudentsNoProgress ||
                                                  courseStudentsNoProgress.total_count === 0 ? (
                                                    <div className='flex h-40 items-center justify-center'>
                                                        <div className='text-center'>
                                                            <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100'>
                                                                <CheckCircle className='h-8 w-8 text-green-600' />
                                                            </div>
                                                            <h3 className='text-lg font-medium text-gray-900'>
                                                                {t(
                                                                    'pages.dashboard.teacher.latest_progress.no_progress.all_students_active.title',
                                                                )}
                                                            </h3>
                                                            <p className='text-sm text-gray-500'>
                                                                {t(
                                                                    'pages.dashboard.teacher.latest_progress.no_progress.all_students_active.description',
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className='space-y-4'>
                                                        <div className='flex items-center justify-between'>
                                                            <h4 className='text-lg font-medium'>
                                                                {t(
                                                                    'pages.dashboard.teacher.latest_progress.no_progress.title',
                                                                )}
                                                            </h4>
                                                            <Badge
                                                                variant='outline'
                                                                className='bg-red-50 text-red-700'
                                                            >
                                                                {
                                                                    courseStudentsNoProgress.total_count
                                                                }{' '}
                                                                {t(
                                                                    'pages.dashboard.teacher.latest_progress.no_progress.students_count',
                                                                )}
                                                            </Badge>
                                                        </div>

                                                        <div className='rounded-lg border'>
                                                            <div className='grid grid-cols-3 gap-4 border-b bg-muted p-3 text-sm font-medium'>
                                                                <div>
                                                                    {t(
                                                                        'pages.dashboard.teacher.latest_progress.no_progress.columns.name',
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    {t(
                                                                        'pages.dashboard.teacher.latest_progress.no_progress.columns.email',
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    {t(
                                                                        'pages.dashboard.teacher.latest_progress.no_progress.columns.status',
                                                                    )}
                                                                </div>
                                                            </div>
                                                            {courseStudentsNoProgress.students_no_progress.map(
                                                                (student) => (
                                                                    <div
                                                                        key={student.id}
                                                                        className='grid grid-cols-3 gap-4 border-b p-3 text-sm'
                                                                    >
                                                                        <div className='font-medium'>
                                                                            {student.name}
                                                                        </div>
                                                                        <div className='text-muted-foreground'>
                                                                            {student.email}
                                                                        </div>
                                                                        <div>
                                                                            <Badge
                                                                                variant='secondary'
                                                                                className='bg-gray-100 text-gray-600'
                                                                            >
                                                                                {t(
                                                                                    'pages.dashboard.teacher.latest_progress.no_progress.status.not_started',
                                                                                )}
                                                                            </Badge>
                                                                        </div>
                                                                    </div>
                                                                ),
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </TabsContent>
                                        </Tabs>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </>
    );
}
