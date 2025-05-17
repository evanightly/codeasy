import { Alert, AlertDescription, AlertTitle } from '@/Components/UI/alert';
import { Button } from '@/Components/UI/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/Components/UI/dialog';
import { Skeleton } from '@/Components/UI/skeleton';
import { studentCourseCognitiveClassificationServiceHook } from '@/Services/studentCourseCognitiveClassificationServiceHook';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { BarChart2 } from 'lucide-react';
import { useMemo } from 'react';

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
    const {
        data: report,
        isLoading,
        isError,
        error,
    } = studentCourseCognitiveClassificationServiceHook.useGetCourseReport(
        courseId,
        classificationType,
    );

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

    // Convert level distribution to percentage
    const getLevelPercentages = () => {
        if (!report) return {};

        const total = report.total_students || 1; // Avoid division by zero
        const percentages: Record<string, number> = {};

        Object.entries(report.level_distribution || {}).forEach(([level, count]) => {
            percentages[level] = Math.round((Number(count) / total) * 100);
        });

        return percentages;
    };

    const levelPercentages = getLevelPercentages();

    const renderBarChart = () => {
        if (!report) return null;

        return (
            <div className='mb-4 mt-6 flex h-64 w-full items-end justify-around gap-2'>
                {Object.entries(report.level_distribution || {}).map(([level, count]) => (
                    <div key={level} className='flex flex-col items-center'>
                        <div
                            style={{
                                backgroundColor:
                                    chartColors[level as keyof typeof chartColors] || 'gray',
                                height: `${Math.max(levelPercentages[level] || 5, 5)}%`,
                            }}
                            className='flex w-16 items-center justify-center rounded-t-md font-medium text-white'
                        >
                            {String(count)}
                        </div>
                        <div className='mt-2 text-xs font-medium'>{level}</div>
                    </div>
                ))}
            </div>
        );
    };

    const renderStudentList = () => {
        if (!report?.classifications?.length) return null;

        return (
            <div className='mt-6 space-y-4'>
                <h3 className='text-lg font-semibold'>Students by Level</h3>

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
                                        {level} ({studentsAtLevel.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className='list-disc space-y-1 pl-5'>
                                        {studentsAtLevel.map((classification: Classification) => (
                                            <li key={classification.id}>
                                                {classification.user?.name || 'Unknown'} -{' '}
                                                <span className='text-muted-foreground'>
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

        return (
            <div className='space-y-6'>
                <div className='space-y-2 text-center'>
                    <h2 className='text-2xl font-bold'>Cognitive Classification Report</h2>
                    <p className='text-muted-foreground'>
                        {report.total_students} student{report.total_students !== 1 ? 's' : ''}{' '}
                        classified
                    </p>
                </div>

                {renderBarChart()}

                <div className='flex flex-wrap justify-center gap-4'>
                    {Object.entries(levelPercentages).map(([level, percentage]) => (
                        <div key={level} className='text-center'>
                            <div
                                style={{
                                    backgroundColor:
                                        chartColors[level as keyof typeof chartColors] || 'gray',
                                }}
                                className='mr-1 inline-block h-4 w-4 rounded-full'
                            ></div>
                            <span className='text-sm font-medium'>
                                {level}: {percentage}%
                            </span>
                        </div>
                    ))}
                </div>

                {renderStudentList()}
            </div>
        );
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                {triggerButton || (
                    <Button>
                        <BarChart2 className='mr-2 h-4 w-4' />
                        {t('pages.student_course_cognitive_classification.buttons.view_report')}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className='max-h-[90vh] max-w-screen-lg overflow-y-auto'>
                <DialogHeader>
                    <DialogTitle>Cognitive Classification Report</DialogTitle>
                </DialogHeader>
                {content()}
            </DialogContent>
        </Dialog>
    );
}
