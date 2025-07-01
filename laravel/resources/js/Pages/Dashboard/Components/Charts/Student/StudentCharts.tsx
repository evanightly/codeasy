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
import { courseServiceHook } from '@/Services/courseServiceHook';
import { dashboardServiceHook } from '@/Services/dashboardServiceHook';
import { ROUTES } from '@/Support/Constants/routes';
import { Link } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Pie,
    PieChart,
    XAxis,
    YAxis,
} from 'recharts';
import { ActiveUsersCard } from '../../ActiveUsersCard';
import { studentAreaData, studentBarData, studentConfig, studentPieData } from '../../chartData';
import { StudentClassificationSection } from './StudentClassificationSection';

export function StudentCharts() {
    const { t } = useLaravelReactI18n();
    const { data: latestWorkData, isLoading } = dashboardServiceHook.useGetStudentLatestWork();
    // Only fetch enrolled courses for the student using the new intent system
    const { data: coursesData, isPending: isCoursesLoading } =
        courseServiceHook.useGetAllEnrolled();

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

            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                {/* Learning Progress Area Chart */}
                <Card data-testid='student-learning-progress-area-chart' className='w-full'>
                    <CardHeader>
                        <CardTitle>
                            {t('pages.dashboard.student.charts.learning_progress.title')}
                        </CardTitle>
                        <CardDescription>
                            {t('pages.dashboard.student.charts.learning_progress.description')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={studentConfig} className='h-[300px] w-full'>
                            <AreaChart data={studentAreaData}>
                                <defs>
                                    <linearGradient y2='1' y1='0' x2='0' x1='0' id='fillProgress'>
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
                                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
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

                {/* Bloom's Taxonomy Levels Pie Chart */}
                <Card data-testid='student-cognitive-level-pie-chart'>
                    <CardHeader>
                        <CardTitle>
                            {t('pages.dashboard.student.charts.cognitive_level.title')}
                        </CardTitle>
                        <CardDescription>
                            {t('pages.dashboard.student.charts.cognitive_level.description')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={studentConfig} className='mx-auto h-[300px] w-full'>
                            <PieChart>
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent nameKey='level' hideLabel />}
                                />
                                <Pie
                                    outerRadius={90}
                                    nameKey='level'
                                    innerRadius={50}
                                    dataKey='value'
                                    data={studentPieData}
                                />
                            </PieChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* Module Progress Bar Chart */}
                <Card data-testid='student-module-progress-bar-chart' className='w-full'>
                    <CardHeader>
                        <CardTitle>
                            {t('pages.dashboard.student.charts.module_progress.title')}
                        </CardTitle>
                        <CardDescription>
                            {t('pages.dashboard.student.charts.module_progress.description')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={studentConfig} className='h-[300px] w-full'>
                            <BarChart data={studentBarData}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey='modul' />
                                <YAxis />
                                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                <Bar radius={4} fill='hsl(var(--chart-2))' dataKey='done' />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                    <CardFooter className='text-sm'>
                        <div className='flex gap-2 font-medium leading-none'>
                            {t('pages.dashboard.student.charts.module_progress.footer')}
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </>
    );
}
