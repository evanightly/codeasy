import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/Components/UI/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/Components/UI/chart';
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
import { studentAreaData, studentBarData, studentConfig, studentPieData } from '../../chartData';

export function StudentCharts() {
    return (
        <>
            <div className='space-y-2'>
                <h1 className='text-2xl font-bold'>Siswa Dashboard</h1>
                <p className='text-muted-foreground'>Lihat perkembangan belajarmu di sini</p>
            </div>

            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                {/* Learning Progress Area Chart */}
                <Card className='w-full'>
                    <CardHeader>
                        <CardTitle>Progress Belajar (Area Chart)</CardTitle>
                        <CardDescription>Sejak pertama bergabung</CardDescription>
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
                <Card>
                    <CardHeader>
                        <CardTitle>Tingkat Kognitif Bloom (Pie)</CardTitle>
                        <CardDescription>Hasil Klasifikasi</CardDescription>
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
                <Card className='w-full'>
                    <CardHeader>
                        <CardTitle>Modul Belum Dikerjakan (Bar)</CardTitle>
                        <CardDescription>Progress modul personal</CardDescription>
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
                            1 = Selesai, 0 = Belum
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </>
    );
}
