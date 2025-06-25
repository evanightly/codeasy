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
    Line,
    LineChart,
    Pie,
    PieChart,
    PolarAngleAxis,
    PolarGrid,
    Radar,
    RadarChart,
    XAxis,
    YAxis,
} from 'recharts';
import { ActiveUsersCard } from '../../ActiveUsersCard';
import {
    adminBarData,
    adminConfig,
    adminLineData,
    adminPieData,
    adminRadarData,
} from '../../chartData';

export function AdminCharts() {
    const { t } = useLaravelReactI18n();

    return (
        <>
            <div className='space-y-2'>
                <h1 className='text-2xl font-bold'>{t('pages.dashboard.admin.title')}</h1>
                <p className='text-muted-foreground'>{t('pages.dashboard.admin.subtitle')}</p>
            </div>

            {/* Active Users Card */}
            <ActiveUsersCard />

            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                {/* User Growth Bar Chart */}
                <Card data-testid='admin-users-bar-chart' className='w-full'>
                    <CardHeader>
                        <CardTitle>{t('pages.dashboard.admin.charts.users_bar.title')}</CardTitle>
                        <CardDescription>
                            {t('pages.dashboard.admin.charts.users_bar.description')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={adminConfig} className='h-[300px] w-full'>
                            <BarChart data={adminBarData}>
                                <CartesianGrid vertical={false} />
                                <XAxis tickLine={false} dataKey='month' axisLine={false} />
                                <YAxis />
                                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                <Bar radius={4} fill='var(--color-users)' dataKey='users' />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                    <CardFooter className='text-sm'>
                        <div className='flex gap-2 font-medium leading-none'>
                            {t('pages.dashboard.admin.charts.users_bar.footer')}{' '}
                            <TrendingUp className='h-4 w-4' />
                        </div>
                    </CardFooter>
                </Card>

                {/* Roles Distribution Pie Chart */}
                <Card data-testid='admin-roles-pie-chart' className='w-full'>
                    <CardHeader>
                        <CardTitle>
                            {t('pages.dashboard.admin.charts.user_roles_pie.title')}
                        </CardTitle>
                        <CardDescription>
                            {t('pages.dashboard.admin.charts.user_roles_pie.description')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={adminConfig} className='mx-auto h-[300px] w-full'>
                            <PieChart>
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent nameKey='role' hideLabel />}
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
                                            if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
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
                                                            {t(
                                                                'pages.dashboard.admin.charts.user_roles_pie.total_label',
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

                {/* Site Visits Line Chart */}
                <Card data-testid='admin-site-visits-line-chart' className='w-full'>
                    <CardHeader>
                        <CardTitle>
                            {t('pages.dashboard.admin.charts.site_visits_line.title')}
                        </CardTitle>
                        <CardDescription>
                            {t('pages.dashboard.admin.charts.site_visits_line.description')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={adminConfig} className='h-[300px] w-full'>
                            <LineChart data={adminLineData}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey='day' />
                                <YAxis />
                                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
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

                {/* Activity Radar Chart */}
                <Card data-testid='admin-radar-chart' className='w-full'>
                    <CardHeader>
                        <CardTitle>
                            {t('pages.dashboard.admin.charts.radar_example.title')}
                        </CardTitle>
                        <CardDescription>
                            {t('pages.dashboard.admin.charts.radar_example.description')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className='flex justify-center'>
                        <ChartContainer config={adminConfig} className='mx-auto h-[300px] w-full'>
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
    );
}
