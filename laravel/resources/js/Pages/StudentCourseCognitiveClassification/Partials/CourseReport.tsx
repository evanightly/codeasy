// TODO: localization not implemented yet

import { Alert, AlertDescription, AlertTitle } from '@/Components/UI/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/Components/UI/chart';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/Components/UI/dialog';
import { Skeleton } from '@/Components/UI/skeleton';
import { courseServiceHook } from '@/Services/courseServiceHook';
import { studentCourseCognitiveClassificationServiceHook } from '@/Services/studentCourseCognitiveClassificationServiceHook';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useMemo, useRef } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from 'recharts';
import { CourseReportExport } from './CourseReportExport';

interface CourseReportProps {
    courseId: number;
    classificationType?: string;
    triggerButton?: React.ReactNode;
}

interface Classification {
    id: number;
    classification_level: string;
    classification_score: number | string;
    user?: {
        id: number;
        name: string;
    };
}

interface _ReportData {
    total_students: number;
    level_distribution: Record<string, number>;
    classifications: Classification[];
}

export function CourseReport({
    courseId,
    classificationType = 'topsis',
    triggerButton,
}: CourseReportProps) {
    const { t } = useLaravelReactI18n();
    // Create a ref for the report content div (for PDF export)
    const reportRef = useRef<HTMLDivElement>(null);

    // Helper function to map classification level to cognitive level code
    const getCognitiveLevelCode = (classificationLevel: string): string => {
        const mapping: Record<string, string> = {
            Remember: 'C1',
            Understand: 'C2',
            Apply: 'C3',
            Analyze: 'C4',
            Evaluate: 'C5',
            Create: 'C6',
        };
        return mapping[classificationLevel] || classificationLevel;
    };

    const {
        data: report,
        isLoading,
        isError,
        error,
    } = studentCourseCognitiveClassificationServiceHook.useGetCourseReport(
        courseId,
        classificationType,
    );

    // Fetch course details to show course name in the report
    const { data: courseData } = courseServiceHook.useGet({
        id: courseId,
    });

    const chartColors = useMemo(
        () => ({
            Remember: 'rgba(244, 63, 94, 0.8)', // red
            Understand: 'rgba(249, 115, 22, 0.8)', // orange
            Apply: 'rgba(234, 179, 8, 0.8)', // yellow
            Analyze: 'rgba(34, 197, 94, 0.8)', // green
            Evaluate: 'rgba(6, 182, 212, 0.8)', // cyan
            Create: 'rgba(124, 58, 237, 0.8)', // purple
        }),
        [],
    );

    // Chart configuration for shadcn/ui ChartContainer
    const chartConfig = useMemo(() => {
        const config: Record<string, { label: string; color: string }> = {};
        Object.entries(chartColors).forEach(([level, color]) => {
            config[level] = {
                label: level,
                color,
            };
        });
        return config;
    }, [chartColors]);

    // Transform data for BarChart
    const chartData = useMemo(() => {
        if (!report?.level_distribution) return [];

        return Object.entries(report.level_distribution).map(([level, count]) => ({
            level: `${level} (${getCognitiveLevelCode(level)})`,
            originalLevel: level, // Keep original level for filtering
            count: Number(count),
            fill: chartColors[level as keyof typeof chartColors] || 'gray',
        }));
    }, [report, chartColors]);

    const renderBarChart = () => {
        if (!report || !chartData.length) return null;

        return (
            <Card className='mb-4 mt-6'>
                <CardHeader>
                    <CardTitle className='text-lg font-semibold'>
                        Cognitive Level Distribution
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className='h-64 w-full'>
                        <BarChart
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            data={chartData}
                        >
                            <CartesianGrid strokeDasharray='3 3' className='stroke-muted' />
                            <XAxis tick={{ fontSize: 12 }} dataKey='level' className='text-sm' />
                            <YAxis
                                tick={{ fontSize: 12 }}
                                label={{
                                    value: 'Number of Students',
                                    angle: -90,
                                    position: 'insideLeft',
                                }}
                                className='text-sm'
                            />
                            <ChartTooltip
                                cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
                                content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                        const data = payload[0].payload;
                                        const percentage = Math.round(
                                            (data.count / report.total_students) * 100,
                                        );
                                        return (
                                            <ChartTooltipContent
                                                payload={[
                                                    {
                                                        name: 'Students',
                                                        value: `${data.count} (${percentage}%)`,
                                                        color: data.fill,
                                                    },
                                                ]}
                                                labelKey='level'
                                                label={`${label}`}
                                            />
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Bar
                                radius={[4, 4, 0, 0]}
                                dataKey='count'
                                className='cursor-pointer hover:opacity-80'
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        );
    };

    const renderStudentList = () => {
        if (!report?.classifications?.length) return null;

        return (
            <div className='mt-6 space-y-4'>
                <h3 className='text-lg font-semibold'>
                    {t('pages.classification.section_headers.students_by_level')}
                </h3>

                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    {Object.entries(chartColors).map(([level, color]) => {
                        const studentsAtLevel = report.classifications.filter(
                            (classification: Classification) =>
                                classification.classification_level === level,
                        );

                        if (studentsAtLevel.length === 0) return null;

                        return (
                            <Card key={level}>
                                <CardHeader className='pb-2'>
                                    <CardTitle className='flex items-center'>
                                        <div
                                            style={{ backgroundColor: color }}
                                            className='mr-2 h-4 w-4 rounded-full'
                                        ></div>
                                        {level} ({getCognitiveLevelCode(level)}) -{' '}
                                        {studentsAtLevel.length} students
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className='list-disc space-y-1 pl-5'>
                                        {studentsAtLevel.map((classification: Classification) => (
                                            <li key={classification.id}>
                                                {classification.user?.name || 'Unknown'} -{' '}
                                                <span className='text-muted-foreground'>
                                                    {getCognitiveLevelCode(
                                                        classification.classification_level,
                                                    )}{' '}
                                                    -{' '}
                                                    {parseFloat(
                                                        classification.classification_score.toString(),
                                                    ).toFixed(2)}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        );
    };

    const content = () => {
        if (isLoading) {
            return (
                <div className='space-y-4'>
                    <Skeleton className='h-8 w-3/4' />
                    <Skeleton className='h-64 w-full' />
                    <Skeleton className='h-8 w-1/2' />
                    <div className='grid grid-cols-2 gap-4'>
                        <Skeleton className='h-32 w-full' />
                        <Skeleton className='h-32 w-full' />
                    </div>
                </div>
            );
        }

        if (isError) {
            return (
                <Alert variant='destructive'>
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        {error?.message || 'Failed to load course report data'}
                    </AlertDescription>
                </Alert>
            );
        }

        if (!report || !report.total_students) {
            return (
                <Alert>
                    <AlertTitle>No Data</AlertTitle>
                    <AlertDescription>
                        No classification data is available for this course.
                    </AlertDescription>
                </Alert>
            );
        }

        const courseName = courseData?.name || `Course #${courseId}`;

        return (
            <div className='space-y-6'>
                <div className='flex flex-wrap items-center justify-between gap-4'>
                    <div className='space-y-2'>
                        <p className='text-muted-foreground'>
                            {report.total_students} student{report.total_students !== 1 ? 's' : ''}{' '}
                            classified using {classificationType.toUpperCase()} method
                        </p>
                    </div>

                    {/* Export buttons */}
                    <CourseReportExport
                        reportRef={reportRef}
                        reportData={report}
                        courseName={courseName}
                        classificationType={classificationType}
                    />
                </div>

                <div ref={reportRef} className='space-y-6'>
                    {renderBarChart()}

                    <div className='flex flex-wrap justify-center gap-4'>
                        {Object.entries(report.level_distribution || {}).map(([level, count]) => {
                            const percentage = Math.round(
                                (Number(count) / report.total_students) * 100,
                            );
                            return (
                                <div key={level} className='text-center'>
                                    <div
                                        style={{
                                            backgroundColor:
                                                chartColors[level as keyof typeof chartColors] ||
                                                'gray',
                                        }}
                                        className='mr-1 inline-block h-4 w-4 rounded-full'
                                    ></div>
                                    <span className='text-sm font-medium'>
                                        {level}: {String(count)} ({percentage}%)
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {renderStudentList()}
                </div>
            </div>
        );
    };

    // If triggerButton is provided, render the Dialog wrapper
    if (triggerButton) {
        return (
            <Dialog>
                <DialogTrigger asChild>{triggerButton}</DialogTrigger>
                <DialogContent className='max-h-[90vh] max-w-screen-lg overflow-y-auto'>
                    <DialogHeader>
                        <DialogTitle>{t('pages.classification.report_dialog.title')}</DialogTitle>
                    </DialogHeader>
                    {content()}
                </DialogContent>
            </Dialog>
        );
    }

    // Otherwise, just return the content for direct embedding
    return content();
}
