import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/card';
import { Progress } from '@/Components/UI/progress';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/UI/table';

interface TestCaseMetrics {
    question_id: number;
    question_name: string;
    test_case_complete_count: number;
    test_case_total_count: number;
    test_case_completion_rate: number;
}

interface TestCaseMetricsDisplayProps {
    metrics: TestCaseMetrics[];
}

/**
 * Component to display test case metrics in cognitive classification details
 */
export function TestCaseMetricsDisplay({ metrics }: TestCaseMetricsDisplayProps) {
    if (!metrics || metrics.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Test Case Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className='text-sm text-muted-foreground'>No test case metrics available.</p>
                </CardContent>
            </Card>
        );
    }

    // Calculate overall test case completion rate
    const totalCompleted = metrics.reduce(
        (acc, metric) => acc + metric.test_case_complete_count,
        0,
    );
    const totalAvailable = metrics.reduce((acc, metric) => acc + metric.test_case_total_count, 0);
    const overallRate = totalAvailable > 0 ? (totalCompleted / totalAvailable) * 100 : 0;

    // Get color for progress bar based on completion rate
    const getProgressColor = (rate: number) => {
        if (rate >= 80) return 'bg-green-500';
        if (rate >= 50) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Test Case Metrics</CardTitle>
            </CardHeader>
            <CardContent>
                <div className='mb-4'>
                    <div className='mb-2 flex items-center justify-between'>
                        <span className='text-sm font-medium'>Overall Test Case Completion</span>
                        <span className='text-sm font-medium'>{overallRate.toFixed(1)}%</span>
                    </div>
                    <Progress
                        value={overallRate}
                        className={`h-2 ${getProgressColor(overallRate)}`}
                    />
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Question</TableHead>
                            <TableHead>Completed</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Completion Rate</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {metrics.map((metric) => (
                            <TableRow key={metric.question_id}>
                                <TableCell>{metric.question_name}</TableCell>
                                <TableCell>{metric.test_case_complete_count}</TableCell>
                                <TableCell>{metric.test_case_total_count}</TableCell>
                                <TableCell>
                                    <div className='flex items-center'>
                                        <span className='mr-2'>
                                            {(metric.test_case_completion_rate * 100).toFixed(1)}%
                                        </span>
                                        <Progress
                                            value={metric.test_case_completion_rate * 100}
                                            className={`h-2 w-20 ${getProgressColor(metric.test_case_completion_rate * 100)}`}
                                        />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
