import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/UI/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/Components/UI/chart';
import { useLaravelReactI18n } from 'laravel-react-i18n';
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
import {
    teacherBarData,
    teacherConfig,
    teacherPieData,
    teacherRadarData,
    teacherRadialData,
} from '../../chartData';

export function TeacherCharts() {
    const { t } = useLaravelReactI18n();

    return (
        <>
            <div className='space-y-2'>
                <h1 className='text-2xl font-bold'>{t('pages.dashboard.teacher.title')}</h1>
                <p className='text-muted-foreground'>{t('pages.dashboard.teacher.subtitle')}</p>
            </div>

            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                {/* Class Average Bar Chart */}
                <Card>
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
                <Card>
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
                <Card>
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
                <Card>
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
        </>
    );
}
