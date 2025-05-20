import { Badge } from '@/Components/UI/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/UI/table';
import { studentCourseCognitiveClassificationHistoryServiceHook } from '@/Services/studentCourseCognitiveClassificationHistoryServiceHook';
import { StudentCourseCognitiveClassificationHistoryResource } from '@/Support/Interfaces/Resources';
import { format } from 'date-fns';
import { Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

// Define props for the component
interface StudentCourseCognitiveClassificationHistoryViewerProps {
    userId: number;
    courseId: number;
}

/**
 * Component for viewing the history of a student's cognitive classifications
 * for a specific course
 */
export function StudentCourseCognitiveClassificationHistoryViewer({
    userId,
    courseId,
}: StudentCourseCognitiveClassificationHistoryViewerProps) {
    const [historyRecords, setHistoryRecords] = useState<
        StudentCourseCognitiveClassificationHistoryResource[]
    >([]);
    // Use the history service hook to fetch data
    const { useGetAll } = studentCourseCognitiveClassificationHistoryServiceHook;
    const {
        data: historyData,
        isPending: isHistoryPending,
        isError: isHistoryError,
    } = useGetAll({
        filters: {
            column_filters: {
                user_id: userId,
                course_id: courseId,
            },
            // order_by: '-classified_at', // Most recent first
        },
    });

    useEffect(() => {
        if (historyData?.data) {
            setHistoryRecords(historyData.data);
        }
    }, [historyData]);

    // Get the trend of classification levels
    const getClassificationTrend = () => {
        if (historyRecords.length < 2) return null;

        // Compare the latest two classifications
        const latest = historyRecords[0];
        const previous = historyRecords[1];

        if (!latest || !previous) return null;

        if (latest.classification_score > previous.classification_score) {
            return 'improved';
        } else if (latest.classification_score < previous.classification_score) {
            return 'declined';
        } else {
            return 'unchanged';
        }
    };

    // Function to get badge color based on cognitive level
    const getLevelColor = (level: string) => {
        switch (level) {
            case 'Remember':
                return 'bg-red-100 text-red-800';
            case 'Understand':
                return 'bg-orange-100 text-orange-800';
            case 'Apply':
                return 'bg-yellow-100 text-yellow-800';
            case 'Analyze':
                return 'bg-green-100 text-green-800';
            case 'Evaluate':
                return 'bg-blue-100 text-blue-800';
            case 'Create':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <>
            {isHistoryPending && (
                <div className='flex items-center justify-center p-6'>
                    <div className='h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent'></div>
                </div>
            )}

            {!isHistoryPending && !isHistoryError && historyRecords.length > 0 && (
                <div className='space-y-6'>
                    {/* Trend Card */}
                    {historyRecords.length > 1 && (
                        <Card>
                            <CardContent className='pt-6'>
                                <div className='flex items-center justify-between'>
                                    <div>
                                        <h3 className='font-medium'>Classification Trend</h3>
                                        <p className='text-sm text-muted-foreground'>
                                            {getClassificationTrend() === 'improved'
                                                ? 'Student has shown improvement in cognitive classification.'
                                                : getClassificationTrend() === 'declined'
                                                  ? 'Student has shown a decline in cognitive classification.'
                                                  : "Student's cognitive classification has remained stable."}
                                        </p>
                                    </div>
                                    <Badge
                                        variant={
                                            getClassificationTrend() === 'improved'
                                                ? 'default'
                                                : getClassificationTrend() === 'declined'
                                                  ? 'destructive'
                                                  : 'outline'
                                        }
                                        className='flex items-center gap-1'
                                    >
                                        {getClassificationTrend() === 'improved' && (
                                            <Sparkles className='h-3 w-3' />
                                        )}
                                        {getClassificationTrend()}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* History Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Classification History (Memory Test)</CardTitle>
                        </CardHeader>
                        <CardContent className='max-h-[400px] overflow-y-auto'>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Classification Type</TableHead>
                                        <TableHead>Level</TableHead>
                                        <TableHead>Score</TableHead>
                                        <TableHead>Test Cases</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {historyRecords.map((record) => (
                                        <TableRow key={record.id}>
                                            <TableCell>
                                                {format(
                                                    new Date(record.classified_at),
                                                    'MMM dd, yyyy HH:mm',
                                                )}
                                            </TableCell>
                                            <TableCell>{record.classification_type}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={getLevelColor(
                                                        record.classification_level,
                                                    )}
                                                >
                                                    {record.classification_level}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{record?.classification_score}</TableCell>
                                            <TableCell>
                                                {record.raw_data?.calculation_details
                                                    ?.test_case_metrics
                                                    ? `${record.raw_data.calculation_details.test_case_metrics.completed}/${record.raw_data.calculation_details.test_case_metrics.total}`
                                                    : 'N/A'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            )}

            {!isHistoryPending && historyRecords.length === 0 && (
                <Card>
                    <CardContent className='pt-6'>
                        <p className='text-center text-muted-foreground'>
                            No classification history records found for this student.
                        </p>
                    </CardContent>
                </Card>
            )}

            {isHistoryError && (
                <Card className='border-destructive bg-destructive/10'>
                    <CardContent className='pt-6'>
                        <p className='text-center text-destructive'>
                            Error loading classification history. Please try again.
                        </p>
                    </CardContent>
                </Card>
            )}
        </>
    );
}
