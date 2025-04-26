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
import { dashboardServiceHook } from '@/Services/dashboardServiceHook';
import { ROUTES } from '@/Support/Constants/routes';
import { Link } from '@inertiajs/react';
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
    const { data: latestWorkData, isLoading } = dashboardServiceHook.useGetStudentLatestWork();

    return (
        <>
            <div className='space-y-2'>
                <h1 className='text-2xl font-bold'>Siswa Dashboard</h1>
                <p className='text-muted-foreground'>Lihat perkembangan belajarmu di sini</p>
            </div>

            {/* Latest Work Card - New Addition */}
            <div className='mb-4'>
                <Card className='w-full'>
                    <CardHeader>
                        <CardTitle>Progres Pembelajaran Terakhir</CardTitle>
                        <CardDescription>Lanjutkan belajar dari terakhir kali</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className='flex h-20 items-center justify-center'>
                                <p>Memuat data...</p>
                            </div>
                        ) : !latestWorkData ? (
                            <div className='flex h-20 items-center justify-center'>
                                <p>Belum ada progres pembelajaran.</p>
                            </div>
                        ) : (
                            <div className='space-y-4'>
                                <div className='space-y-2'>
                                    <div className='flex items-center justify-between'>
                                        <h3 className='text-lg font-semibold'>Kursus:</h3>
                                        <span>{latestWorkData.course?.name}</span>
                                    </div>
                                    <div className='flex items-center justify-between'>
                                        <h3 className='text-lg font-semibold'>Materi:</h3>
                                        <span>{latestWorkData?.material?.title}</span>
                                    </div>
                                    <div className='flex items-center justify-between'>
                                        <h3 className='text-lg font-semibold'>
                                            Progress pertanyaan saat ini:
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
                                                Lanjutkan Pertanyaan Saat Ini
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
                                                ? 'Lompat ke Pertanyaan Berikutnya'
                                                : 'Mulai Pertanyaan Berikutnya'}
                                        </Link>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
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
