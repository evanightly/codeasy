import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/Components/UI/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/Components/UI/chart';
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
import {
    schoolBarData,
    schoolConfig,
    schoolPieData,
    schoolRadarData,
    schoolRadialData,
} from '../../chartData';

export function SchoolAdminCharts() {
    return (
        <>
            <div className='space-y-2'>
                <h1 className='text-2xl font-bold'>School Admin Overview</h1>
                <p className='text-muted-foreground'>Dashboard ringkasan untuk Sekolah</p>
            </div>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                {/* Population Bar Chart */}
                <Card className='w-full'>
                    <CardHeader>
                        <CardTitle>Populasi Sekolah (Bar Chart)</CardTitle>
                        <CardDescription>Staff, Guru, Siswa</CardDescription>
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
                            Current Stats <TrendingUp className='h-4 w-4' />
                        </div>
                    </CardFooter>
                </Card>

                {/* Facilities Pie Chart */}
                <Card className='w-full'>
                    <CardHeader>
                        <CardTitle>Fasilitas Sekolah (Pie)</CardTitle>
                        <CardDescription>Lab, Projectors, etc.</CardDescription>
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

                {/* Class Development Radar Chart */}
                <Card className='w-full'>
                    <CardHeader>
                        <CardTitle>Perkembangan Kelas (Radar)</CardTitle>
                        <CardDescription>Januari vs Juni</CardDescription>
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
                <Card className='w-full'>
                    <CardHeader>
                        <CardTitle>Performa Nilai (Radial Chart)</CardTitle>
                        <CardDescription>SD, SMP, SMA</CardDescription>
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
