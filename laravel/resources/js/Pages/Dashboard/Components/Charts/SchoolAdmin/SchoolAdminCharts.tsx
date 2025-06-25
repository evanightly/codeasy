import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/Components/UI/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/Components/UI/chart';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { TrendingUp } from 'lucide-react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Label,
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
    schoolBarData,
    schoolConfig,
    schoolPieData,
    schoolRadarData,
    schoolRadialData,
} from '../../chartData';

export function SchoolAdminCharts() {
    const { t } = useLaravelReactI18n();

    return (
        <>
            <div className='space-y-2'>
                <h1 className='text-2xl font-bold'>{t('pages.dashboard.school_admin.title')}</h1>
                <p className='text-muted-foreground'>
                    {t('pages.dashboard.school_admin.subtitle')}
                </p>
            </div>

            {/* Active Users Card */}
            <ActiveUsersCard />

            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                {/* Population Bar Chart */}
                <Card data-testid='school-admin-population-bar-chart' className='w-full'>
                    <CardHeader>
                        <CardTitle>
                            {t('pages.dashboard.school_admin.charts.population.title')}
                        </CardTitle>
                        <CardDescription>
                            {t('pages.dashboard.school_admin.charts.population.description')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={schoolConfig} className='h-[300px] w-full'>
                            <BarChart data={schoolBarData}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey='name' />
                                <YAxis />
                                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                <Bar radius={4} fill='hsl(var(--chart-1))' dataKey='count' />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                    <CardFooter className='text-sm'>
                        <div className='flex gap-2 font-medium leading-none'>
                            {t('pages.dashboard.school_admin.charts.population.footer')}{' '}
                            <TrendingUp className='h-4 w-4' />
                        </div>
                    </CardFooter>
                </Card>

                {/* Facilities Pie Chart */}
                <Card data-testid='school-admin-facilities-pie-chart' className='w-full'>
                    <CardHeader>
                        <CardTitle>
                            {t('pages.dashboard.school_admin.charts.facilities.title')}
                        </CardTitle>
                        <CardDescription>
                            {t('pages.dashboard.school_admin.charts.facilities.description')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={schoolConfig} className='mx-auto h-[300px] w-full'>
                            <PieChart>
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent nameKey='name' hideLabel />}
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
                                            if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
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
                                                            {t(
                                                                'pages.dashboard.school_admin.charts.facilities.items_label',
                                                            )}
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

                {/* Class Development Radar Chart */}
                <Card data-testid='school-admin-class-development-radar-chart' className='w-full'>
                    <CardHeader>
                        <CardTitle>
                            {t('pages.dashboard.school_admin.charts.class_development.title')}
                        </CardTitle>
                        <CardDescription>
                            {t('pages.dashboard.school_admin.charts.class_development.description')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={schoolConfig} className='mx-auto h-[300px] w-full'>
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

                {/* Level Performance Radial Chart */}
                <Card data-testid='school-admin-level-performance-radial-chart' className='w-full'>
                    <CardHeader>
                        <CardTitle>
                            {t('pages.dashboard.school_admin.charts.level_performance.title')}
                        </CardTitle>
                        <CardDescription>
                            {t('pages.dashboard.school_admin.charts.level_performance.description')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={schoolConfig} className='mx-auto h-[300px] w-full'>
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
    );
}
