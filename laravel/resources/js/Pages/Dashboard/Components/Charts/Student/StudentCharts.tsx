import { Badge } from '@/Components/UI/badge';
import { buttonVariants } from '@/Components/UI/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/Components/UI/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/Components/UI/chart';
import { Progress } from '@/Components/UI/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/UI/tabs';
import { courseServiceHook } from '@/Services/courseServiceHook';
import { dashboardServiceHook } from '@/Services/dashboardServiceHook';
import { ROUTES } from '@/Support/Constants/routes';
import { ChartFilters } from '@/Support/Interfaces/Resources/DashboardResource';
import { Link } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { Calendar, Clock, Target, TrendingUp, Trophy, Users } from 'lucide-react';
import { useState } from 'react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Line,
    LineChart,
    Pie,
    PieChart,
    XAxis,
    YAxis,
} from 'recharts';
import { ActiveUsersCard } from '../../ActiveUsersCard';
import { ChartFilterComponent } from '../../ChartFilterComponent';
import { studentConfig } from '../../chartData';
import { StudentClassificationSection } from './StudentClassificationSection';

export function StudentCharts() {
    const { t } = useLaravelReactI18n();
    const [filters, setFilters] = useState<ChartFilters>({});

    const { data: latestWorkData, isLoading } = dashboardServiceHook.useGetStudentLatestWork();
    // Only fetch enrolled courses for the student using the new intent system
    const { data: coursesData, isPending: isCoursesLoading } =
        courseServiceHook.useGetAllEnrolled();

    // Existing chart data hooks
    const { data: learningProgressData, isLoading: isLoadingProgress } =
        dashboardServiceHook.useGetStudentLearningProgress(filters);
    const { data: cognitiveLevelsData, isLoading: isLoadingCognitive } =
        dashboardServiceHook.useGetStudentCognitiveLevels(filters);
    const { data: moduleProgressData, isLoading: isLoadingModule } =
        dashboardServiceHook.useGetStudentModuleProgress(filters);

    // New chart data hooks
    const { data: dailyActivityData, isLoading: isLoadingActivity } =
        dashboardServiceHook.useGetStudentDailyActivity(filters);
    const { data: weeklyStreakData, isLoading: isLoadingStreak } =
        dashboardServiceHook.useGetStudentWeeklyStreak(filters);
    const { data: scoreTrendsData, isLoading: isLoadingTrends } =
        dashboardServiceHook.useGetStudentScoreTrends(filters);
    const { data: timeAnalysisData, isLoading: isLoadingTime } =
        dashboardServiceHook.useGetStudentTimeAnalysis(filters);
    const { data: difficultyProgressData, isLoading: isLoadingDifficulty } =
        dashboardServiceHook.useGetStudentDifficultyProgress(filters);
    const { data: comparisonStatsData, isLoading: isLoadingComparison } =
        dashboardServiceHook.useGetStudentComparisonStats(filters);
    const { data: achievementSummaryData, isLoading: isLoadingAchievements } =
        dashboardServiceHook.useGetStudentAchievementSummary(filters);

    return (
        <>
            <div className='space-y-2'>
                <h1 className='text-2xl font-bold'>{t('pages.dashboard.student.title')}</h1>
                <p className='text-muted-foreground'>{t('pages.dashboard.student.subtitle')}</p>
            </div>

            {/* Active Users Card */}
            <ActiveUsersCard />

            {/* Latest Work Card - New Addition */}
            <div className='mb-4'>
                <Card data-testid='student-latest-work-progress' className='w-full'>
                    <CardHeader>
                        <CardTitle>
                            {t('pages.dashboard.student.latest_work_progress.title')}
                        </CardTitle>
                        <CardDescription>
                            {t('pages.dashboard.student.latest_work_progress.description')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className='flex h-20 items-center justify-center'>
                                <p>{t('pages.dashboard.student.latest_work_progress.loading')}</p>
                            </div>
                        ) : !latestWorkData ? (
                            <div className='flex h-20 items-center justify-center'>
                                <p>
                                    {t('pages.dashboard.student.latest_work_progress.no_progress')}
                                </p>
                            </div>
                        ) : (
                            <div className='space-y-4'>
                                <div className='space-y-2'>
                                    <div className='flex items-center justify-between'>
                                        <h3 className='text-lg font-semibold'>
                                            {t(
                                                'pages.dashboard.student.latest_work_progress.course_label',
                                            )}
                                        </h3>
                                        <span>{latestWorkData.course?.name}</span>
                                    </div>
                                    <div className='flex items-center justify-between'>
                                        <h3 className='text-lg font-semibold'>
                                            {t(
                                                'pages.dashboard.student.latest_work_progress.material_label',
                                            )}
                                        </h3>
                                        <span>{latestWorkData?.material?.title}</span>
                                    </div>
                                    <div className='flex items-center justify-between'>
                                        <h3 className='text-lg font-semibold'>
                                            {t(
                                                'pages.dashboard.student.latest_work_progress.current_question_label',
                                            )}
                                        </h3>
                                        <span>{latestWorkData?.currentQuestion?.title}</span>
                                    </div>
                                </div>

                                <div className='flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0'>
                                    {!latestWorkData?.currentQuestion?.isCompleted &&
                                        latestWorkData?.course?.id &&
                                        latestWorkData?.material?.id &&
                                        latestWorkData?.currentQuestion?.id && (
                                            <Link
                                                href={route(
                                                    `${ROUTES.STUDENT_COURSE_MATERIAL_QUESTIONS}.show`,
                                                    [
                                                        latestWorkData?.course?.id,
                                                        latestWorkData?.material?.id,
                                                        latestWorkData?.currentQuestion?.id,
                                                    ],
                                                )}
                                                // href={route(
                                                //     'learning-material-questions.show',
                                                //     latestWorkData.currentQuestion.id,
                                                // )}
                                                className={buttonVariants({
                                                    variant: 'outline',
                                                    className: 'flex-1',
                                                })}
                                            >
                                                {t(
                                                    'pages.dashboard.student.latest_work_progress.continue_button',
                                                )}
                                            </Link>
                                        )}

                                    {latestWorkData.nextQuestion && (
                                        <Link
                                            // href={route(
                                            //     'learning-material-questions.show',
                                            //     latestWorkData.nextQuestion.id,
                                            // )}

                                            href={route(
                                                `${ROUTES.STUDENT_COURSE_MATERIAL_QUESTIONS}.show`,
                                                [
                                                    latestWorkData?.course?.id,
                                                    latestWorkData?.material?.id,
                                                    latestWorkData?.currentQuestion?.id,
                                                ],
                                            )}
                                            className={buttonVariants({
                                                variant: !latestWorkData?.currentQuestion
                                                    ?.isCompleted
                                                    ? 'outline'
                                                    : 'default',
                                                className: 'flex-1',
                                            })}
                                        >
                                            {!latestWorkData?.currentQuestion?.isCompleted
                                                ? t(
                                                      'pages.dashboard.student.latest_work_progress.skip_button',
                                                  )
                                                : t(
                                                      'pages.dashboard.student.latest_work_progress.start_next_button',
                                                  )}
                                        </Link>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Classification Section */}
            <div data-testid='student-classification-section'>
                <StudentClassificationSection
                    isLoading={isCoursesLoading}
                    courses={coursesData?.data || []}
                />
            </div>

            {/* Chart Filters */}
            <ChartFilterComponent
                showDateFilters={true}
                showCourseFilter={true}
                onFiltersChange={setFilters}
                filters={filters}
                courses={coursesData?.data || []}
            />

            {/* Charts Section with Tabs */}
            <Tabs defaultValue='basic_charts' className='w-full'>
                <TabsList className='grid w-full grid-cols-3'>
                    <TabsTrigger value='basic_charts'>
                        {t('pages.dashboard.student.charts.tabs.basic_progress')}
                    </TabsTrigger>
                    <TabsTrigger value='activity_analytics'>
                        {t('pages.dashboard.student.charts.tabs.activity_analytics')}
                    </TabsTrigger>
                    <TabsTrigger value='achievements'>
                        {t('pages.dashboard.student.charts.tabs.achievements')}
                    </TabsTrigger>
                </TabsList>

                {/* Basic Charts Tab */}
                <TabsContent value='basic_charts' className='space-y-4'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        {/* Learning Progress Area Chart */}
                        <Card data-testid='student-learning-progress-area-chart' className='w-full'>
                            <CardHeader>
                                <CardTitle>
                                    {t('pages.dashboard.student.charts.learning_progress.title')}
                                </CardTitle>
                                <CardDescription>
                                    {t(
                                        'pages.dashboard.student.charts.learning_progress.description',
                                    )}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isLoadingProgress ? (
                                    <div className='flex h-[300px] items-center justify-center'>
                                        <p>{t('pages.dashboard.student.charts.common.loading')}</p>
                                    </div>
                                ) : (
                                    <ChartContainer
                                        config={studentConfig}
                                        className='h-[300px] w-full'
                                    >
                                        <AreaChart data={learningProgressData || []}>
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
                                )}
                            </CardContent>
                        </Card>

                        {/* Bloom's Taxonomy Levels Pie Chart */}
                        <Card data-testid='student-cognitive-level-pie-chart'>
                            <CardHeader>
                                <CardTitle>
                                    {t('pages.dashboard.student.charts.cognitive_level.title')}
                                </CardTitle>
                                <CardDescription>
                                    {t(
                                        'pages.dashboard.student.charts.cognitive_level.description',
                                    )}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isLoadingCognitive ? (
                                    <div className='flex h-[300px] items-center justify-center'>
                                        <p>{t('pages.dashboard.student.charts.common.loading')}</p>
                                    </div>
                                ) : (
                                    <ChartContainer
                                        config={studentConfig}
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
                                                data={cognitiveLevelsData || []}
                                            />
                                        </PieChart>
                                    </ChartContainer>
                                )}
                            </CardContent>
                        </Card>

                        {/* Module Progress Bar Chart */}
                        <Card data-testid='student-module-progress-bar-chart' className='w-full'>
                            <CardHeader>
                                <CardTitle>
                                    {t('pages.dashboard.student.charts.module_progress.title')}
                                </CardTitle>
                                <CardDescription>
                                    {t(
                                        'pages.dashboard.student.charts.module_progress.description',
                                    )}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isLoadingModule ? (
                                    <div className='flex h-[300px] items-center justify-center'>
                                        <p>{t('pages.dashboard.student.charts.common.loading')}</p>
                                    </div>
                                ) : (
                                    <ChartContainer
                                        config={studentConfig}
                                        className='h-[300px] w-full'
                                    >
                                        <BarChart data={moduleProgressData || []}>
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
                                )}
                            </CardContent>
                            <CardFooter className='text-sm'>
                                <div className='flex gap-2 font-medium leading-none'>
                                    {t('pages.dashboard.student.charts.module_progress.footer')}
                                </div>
                            </CardFooter>
                        </Card>

                        {/* Score Trends Line Chart */}
                        <Card data-testid='student-score-trends-chart' className='w-full'>
                            <CardHeader>
                                <CardTitle className='flex items-center gap-2'>
                                    <TrendingUp className='h-4 w-4' />
                                    {t('pages.dashboard.student.charts.score_trends.title')}
                                </CardTitle>
                                <CardDescription>
                                    {t('pages.dashboard.student.charts.score_trends.description')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isLoadingTrends ? (
                                    <div className='flex h-[300px] items-center justify-center'>
                                        <p>{t('pages.dashboard.student.charts.common.loading')}</p>
                                    </div>
                                ) : (
                                    <ChartContainer
                                        config={studentConfig}
                                        className='h-[300px] w-full'
                                    >
                                        <LineChart data={scoreTrendsData || []}>
                                            <CartesianGrid strokeDasharray='3 3' />
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
                                            <Line
                                                type='monotone'
                                                strokeWidth={2}
                                                stroke='hsl(var(--chart-1))'
                                                dot={{ fill: 'hsl(var(--chart-1))' }}
                                                dataKey='average_score'
                                            />
                                        </LineChart>
                                    </ChartContainer>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Activity & Analytics Tab */}
                <TabsContent value='activity_analytics' className='space-y-4'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        {/* Daily Activity Chart */}
                        <Card data-testid='student-daily-activity-chart' className='w-full'>
                            <CardHeader>
                                <CardTitle className='flex items-center gap-2'>
                                    <Calendar className='h-4 w-4' />
                                    {t('pages.dashboard.student.charts.daily_activity.title')}
                                </CardTitle>
                                <CardDescription>
                                    {t('pages.dashboard.student.charts.daily_activity.description')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isLoadingActivity ? (
                                    <div className='flex h-[300px] items-center justify-center'>
                                        <p>{t('pages.dashboard.student.charts.common.loading')}</p>
                                    </div>
                                ) : (
                                    <ChartContainer
                                        config={studentConfig}
                                        className='h-[300px] w-full'
                                    >
                                        <AreaChart data={dailyActivityData || []}>
                                            <CartesianGrid strokeDasharray='3 3' />
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
                                                stroke='hsl(var(--chart-3))'
                                                fillOpacity={0.6}
                                                fill='hsl(var(--chart-3))'
                                                dataKey='total_time'
                                            />
                                        </AreaChart>
                                    </ChartContainer>
                                )}
                            </CardContent>
                        </Card>

                        {/* Weekly Streak Progress */}
                        <Card data-testid='student-weekly-streak-chart' className='w-full'>
                            <CardHeader>
                                <CardTitle className='flex items-center gap-2'>
                                    <Target className='h-4 w-4' />
                                    {t('pages.dashboard.student.charts.weekly_streak.title')}
                                </CardTitle>
                                <CardDescription>
                                    {t('pages.dashboard.student.charts.weekly_streak.description')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isLoadingStreak ? (
                                    <div className='flex h-[300px] items-center justify-center'>
                                        <p>{t('pages.dashboard.student.charts.common.loading')}</p>
                                    </div>
                                ) : weeklyStreakData ? (
                                    <div className='space-y-4'>
                                        <div className='grid grid-cols-2 gap-4'>
                                            <div className='text-center'>
                                                <div className='text-2xl font-bold text-primary'>
                                                    {weeklyStreakData.current_streak}
                                                </div>
                                                <div className='text-sm text-muted-foreground'>
                                                    {t(
                                                        'pages.dashboard.student.charts.weekly_streak.current_streak',
                                                    )}
                                                </div>
                                            </div>
                                            <div className='text-center'>
                                                <div className='text-2xl font-bold text-primary'>
                                                    {weeklyStreakData.longest_streak}
                                                </div>
                                                <div className='text-sm text-muted-foreground'>
                                                    {t(
                                                        'pages.dashboard.student.charts.weekly_streak.longest_streak',
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <ChartContainer
                                            config={studentConfig}
                                            className='h-[200px] w-full'
                                        >
                                            <BarChart data={weeklyStreakData.weekly_activity || []}>
                                                <CartesianGrid strokeDasharray='3 3' />
                                                <XAxis dataKey='week' />
                                                <YAxis />
                                                <ChartTooltip
                                                    cursor={false}
                                                    content={<ChartTooltipContent />}
                                                />
                                                <Bar
                                                    radius={4}
                                                    fill='hsl(var(--chart-4))'
                                                    dataKey='active_days'
                                                />
                                            </BarChart>
                                        </ChartContainer>
                                    </div>
                                ) : (
                                    <div className='flex h-[300px] items-center justify-center'>
                                        <p>
                                            {t(
                                                'pages.dashboard.student.charts.common.no_streak_data',
                                            )}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Time Analysis Chart */}
                        <Card data-testid='student-time-analysis-chart' className='w-full'>
                            <CardHeader>
                                <CardTitle className='flex items-center gap-2'>
                                    <Clock className='h-4 w-4' />
                                    {t('pages.dashboard.student.charts.time_analysis.title')}
                                </CardTitle>
                                <CardDescription>
                                    {t('pages.dashboard.student.charts.time_analysis.description')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isLoadingTime ? (
                                    <div className='flex h-[300px] items-center justify-center'>
                                        <p>{t('pages.dashboard.student.charts.common.loading')}</p>
                                    </div>
                                ) : timeAnalysisData ? (
                                    <ChartContainer
                                        config={studentConfig}
                                        className='h-[300px] w-full'
                                    >
                                        <BarChart data={timeAnalysisData.time_by_hour || []}>
                                            <CartesianGrid strokeDasharray='3 3' />
                                            <XAxis dataKey='hour' />
                                            <YAxis />
                                            <ChartTooltip
                                                cursor={false}
                                                content={<ChartTooltipContent />}
                                            />{' '}
                                            <Bar
                                                radius={4}
                                                fill='hsl(var(--chart-5))'
                                                dataKey='total_time'
                                            />
                                        </BarChart>
                                    </ChartContainer>
                                ) : (
                                    <div className='flex h-[300px] items-center justify-center'>
                                        <p>
                                            {t(
                                                'pages.dashboard.student.charts.common.no_time_data',
                                            )}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Difficulty Progression Chart */}
                        <Card data-testid='student-difficulty-progression-chart' className='w-full'>
                            <CardHeader>
                                <CardTitle>
                                    {t(
                                        'pages.dashboard.student.charts.difficulty_progression.title',
                                    )}
                                </CardTitle>
                                <CardDescription>
                                    {t(
                                        'pages.dashboard.student.charts.difficulty_progression.description',
                                    )}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isLoadingDifficulty ? (
                                    <div className='flex h-[300px] items-center justify-center'>
                                        <p>{t('pages.dashboard.student.charts.common.loading')}</p>
                                    </div>
                                ) : (
                                    <ChartContainer
                                        config={studentConfig}
                                        className='h-[300px] w-full'
                                    >
                                        <BarChart data={difficultyProgressData || []}>
                                            <CartesianGrid strokeDasharray='3 3' />
                                            <XAxis dataKey='difficulty' />
                                            <YAxis />
                                            <ChartTooltip
                                                cursor={false}
                                                content={<ChartTooltipContent />}
                                            />
                                            <Bar
                                                radius={4}
                                                fill='hsl(var(--chart-2))'
                                                dataKey='completion_rate'
                                            />
                                        </BarChart>
                                    </ChartContainer>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Achievements Tab */}
                <TabsContent value='achievements' className='space-y-4'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        {/* Class Comparison Chart */}
                        <Card data-testid='student-comparison-stats-chart' className='w-full'>
                            <CardHeader>
                                <CardTitle className='flex items-center gap-2'>
                                    <Users className='h-4 w-4' />
                                    {t('pages.dashboard.student.charts.class_comparison.title')}
                                </CardTitle>
                                <CardDescription>
                                    {t(
                                        'pages.dashboard.student.charts.class_comparison.description',
                                    )}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isLoadingComparison ? (
                                    <div className='flex h-[300px] items-center justify-center'>
                                        <p>{t('pages.dashboard.student.charts.common.loading')}</p>
                                    </div>
                                ) : comparisonStatsData ? (
                                    <div className='space-y-4'>
                                        <div className='grid grid-cols-2 gap-4'>
                                            <div className='text-center'>
                                                <div className='text-2xl font-bold text-primary'>
                                                    #{comparisonStatsData.ranking}
                                                </div>
                                                <div className='text-sm text-muted-foreground'>
                                                    {t(
                                                        'pages.dashboard.student.charts.class_comparison.class_rank',
                                                    )}
                                                </div>
                                            </div>
                                            <div className='text-center'>
                                                <div className='text-2xl font-bold text-primary'>
                                                    {Math.round(comparisonStatsData.percentile)}%
                                                </div>
                                                <div className='text-sm text-muted-foreground'>
                                                    {t(
                                                        'pages.dashboard.student.charts.class_comparison.percentile',
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className='space-y-2'>
                                            <div className='flex justify-between text-sm'>
                                                <span>
                                                    {t(
                                                        'pages.dashboard.student.charts.class_comparison.completion_rate',
                                                    )}
                                                </span>
                                                <span>
                                                    {Math.round(
                                                        comparisonStatsData.student_stats
                                                            ?.completion_rate ?? 0,
                                                    )}
                                                    %
                                                </span>
                                            </div>
                                            <Progress
                                                value={
                                                    comparisonStatsData.student_stats
                                                        ?.completion_rate ?? 0
                                                }
                                                className='h-2'
                                            />
                                            <div className='flex justify-between text-xs text-muted-foreground'>
                                                <span>
                                                    {t(
                                                        'pages.dashboard.student.charts.class_comparison.you_label',
                                                    )}
                                                    :{' '}
                                                    {Math.round(
                                                        comparisonStatsData.student_stats
                                                            ?.completion_rate || 0,
                                                    )}
                                                    %
                                                </span>
                                                <span>
                                                    {t(
                                                        'pages.dashboard.student.charts.class_comparison.class_avg_label',
                                                    )}
                                                    :{' '}
                                                    {Math.round(
                                                        comparisonStatsData.class_average
                                                            ?.completion_rate || 0,
                                                    )}
                                                    %
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className='flex h-[300px] items-center justify-center'>
                                        <div className='space-y-2 text-center'>
                                            <p className='text-muted-foreground'>
                                                {!filters.course_id
                                                    ? t(
                                                          'pages.dashboard.student.charts.class_comparison.no_course_selected',
                                                      )
                                                    : t(
                                                          'pages.dashboard.student.charts.common.no_data',
                                                      )}
                                            </p>
                                            {!filters.course_id && (
                                                <p className='text-sm text-muted-foreground'>
                                                    {t(
                                                        'pages.dashboard.student.charts.class_comparison.select_course_hint',
                                                    )}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Achievement Summary */}
                        <Card data-testid='student-achievement-summary-chart' className='w-full'>
                            <CardHeader>
                                <CardTitle className='flex items-center gap-2'>
                                    <Trophy className='h-4 w-4' />
                                    {t('pages.dashboard.student.charts.achievements.title')}
                                </CardTitle>
                                <CardDescription>
                                    {t('pages.dashboard.student.charts.achievements.description')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isLoadingAchievements ? (
                                    <div className='flex h-[300px] items-center justify-center'>
                                        <p>{t('pages.dashboard.student.charts.common.loading')}</p>
                                    </div>
                                ) : achievementSummaryData ? (
                                    <div className='space-y-4'>
                                        <div className='grid grid-cols-2 gap-4'>
                                            <div className='text-center'>
                                                <div className='text-2xl font-bold text-primary'>
                                                    {
                                                        achievementSummaryData.total_questions_completed
                                                    }
                                                </div>
                                                <div className='text-sm text-muted-foreground'>
                                                    {t(
                                                        'pages.dashboard.student.charts.achievements.questions_completed',
                                                    )}
                                                </div>
                                            </div>
                                            <div className='text-center'>
                                                <div className='text-2xl font-bold text-primary'>
                                                    {achievementSummaryData.perfect_scores}
                                                </div>
                                                <div className='text-sm text-muted-foreground'>
                                                    {t(
                                                        'pages.dashboard.student.charts.achievements.perfect_scores',
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Badges */}
                                        {achievementSummaryData.badges &&
                                            achievementSummaryData.badges.length > 0 && (
                                                <div className='space-y-2'>
                                                    <h4 className='font-semibold'>
                                                        {t(
                                                            'pages.dashboard.student.charts.achievements.earned_badges',
                                                        )}
                                                    </h4>
                                                    <div className='flex flex-wrap gap-2'>
                                                        {achievementSummaryData.badges.map(
                                                            (badge, index) => (
                                                                <Badge
                                                                    variant='secondary'
                                                                    key={index}
                                                                    className='flex items-center gap-1'
                                                                >
                                                                    <span>{badge.icon}</span>
                                                                    <span>{badge.name}</span>
                                                                </Badge>
                                                            ),
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                        {/* Milestones */}
                                        {achievementSummaryData.milestones &&
                                            achievementSummaryData.milestones.length > 0 && (
                                                <div className='space-y-2'>
                                                    <h4 className='font-semibold'>
                                                        {t(
                                                            'pages.dashboard.student.charts.achievements.milestones',
                                                        )}
                                                    </h4>
                                                    <div className='space-y-2'>
                                                        {achievementSummaryData.milestones.map(
                                                            (milestone, index) => (
                                                                <div
                                                                    key={index}
                                                                    className='flex items-center justify-between'
                                                                >
                                                                    <span
                                                                        className={`text-sm ${milestone.achieved ? 'text-primary' : 'text-muted-foreground'}`}
                                                                    >
                                                                        {milestone.name}
                                                                    </span>
                                                                    <Badge
                                                                        variant={
                                                                            milestone.achieved
                                                                                ? 'default'
                                                                                : 'outline'
                                                                        }
                                                                    >
                                                                        {milestone.achieved
                                                                            ? '✓'
                                                                            : `${milestone.threshold}`}
                                                                    </Badge>
                                                                </div>
                                                            ),
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                    </div>
                                ) : (
                                    <div className='flex h-[300px] items-center justify-center'>
                                        <p>
                                            {t(
                                                'pages.dashboard.student.charts.common.no_achievement_data',
                                            )}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </>
    );
}
