import { Badge } from '@/Components/UI/badge';
import { Button } from '@/Components/UI/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/Components/UI/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/UI/table';
import { studentCognitiveClassificationServiceHook } from '@/Services/studentCognitiveClassificationServiceHook';
import { Eye } from 'lucide-react';
import { useState } from 'react';
import { TestCaseMetricsDisplay } from './TestCaseMetricsDisplay';

// Type for material classification raw_data
interface MaterialClassificationRawData {
    material_name?: string;
    [key: string]: any; // Allow for additional properties
}

// This defines the shape of our component props
interface StudentCognitiveClassificationDetailsProps {
    classificationId: number;
}

/**
 * Component for displaying material classification details
 */
export function StudentCognitiveClassificationDetails({
    classificationId,
}: StudentCognitiveClassificationDetailsProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [detailsData, setDetailsData] = useState<any>(null);
    const [isPending, setIsPending] = useState<boolean>(false);
    const [isError, setIsError] = useState<boolean>(false);

    // Use the material classification service
    const materialClassificationMutation =
        studentCognitiveClassificationServiceHook.useGetClassificationDetails();

    const handleOpen = async () => {
        setIsOpen(true);
        setIsPending(true);

        try {
            // Use the material classification service
            const response = await materialClassificationMutation.mutateAsync({
                id: classificationId,
            });
            setDetailsData(response.data);
            setIsError(false);
        } catch (error) {
            console.error('Error fetching material classification details:', error);
            setIsError(true);
        } finally {
            setIsPending(false);
        }
    };

    // Format numbers to 4 decimal places
    const formatNumber = (num: number | string | undefined) => {
        if (typeof num === 'number') {
            return num.toFixed(4);
        } else if (typeof num === 'string') {
            return parseFloat(num).toFixed(4);
        }
        return '-';
    };

    // Get raw data from the response
    const rawData = detailsData?.raw_data as MaterialClassificationRawData;

    return (
        <>
            <Button variant='ghost' size='icon' onClick={handleOpen}>
                <Eye className='h-4 w-4' />
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className='max-h-[90vh] max-w-screen-lg overflow-y-auto'>
                    <DialogHeader>
                        <DialogTitle>Material Classification Details</DialogTitle>
                        <DialogDescription>
                            Detailed information about the material cognitive classification
                        </DialogDescription>
                    </DialogHeader>

                    {isPending && (
                        <div className='flex justify-center p-4'>
                            <div className='h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent'></div>
                        </div>
                    )}

                    {detailsData && !isPending && !isError && (
                        <div className='space-y-6'>
                            <Card>
                                <CardHeader className='pb-2'>
                                    <CardTitle>Classification Overview</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className='space-y-2'>
                                        <div className='flex justify-between'>
                                            <span className='font-semibold'>Student:</span>
                                            <span>{detailsData.user?.name}</span>
                                        </div>
                                        <div className='flex justify-between'>
                                            <span className='font-semibold'>Course:</span>
                                            <span>{detailsData.course?.name}</span>
                                        </div>
                                        <div className='flex justify-between'>
                                            <span className='font-semibold'>Material:</span>
                                            <span>{rawData?.material_name || 'Not specified'}</span>
                                        </div>
                                        <div className='flex justify-between'>
                                            <span className='font-semibold'>Level:</span>
                                            <Badge>{detailsData.classification_level}</Badge>
                                        </div>
                                        <div className='flex justify-between'>
                                            <span className='font-semibold'>Score:</span>
                                            <span>
                                                {formatNumber(
                                                    parseFloat(
                                                        detailsData.classification_score?.toString(),
                                                    ),
                                                )}
                                            </span>
                                        </div>
                                        <div className='flex justify-between'>
                                            <span className='font-semibold'>
                                                Classification Date:
                                            </span>
                                            <span>
                                                {new Date(
                                                    detailsData.classified_at,
                                                ).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className='pb-2'>
                                    <CardTitle>Rule Base Mapping</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Level</TableHead>
                                                <TableHead>Score Range</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            <TableRow
                                                className={
                                                    detailsData?.classification_level === 'Create'
                                                        ? 'bg-accent'
                                                        : ''
                                                }
                                            >
                                                <TableCell>Create</TableCell>
                                                <TableCell>CC ≥ 0.85</TableCell>
                                            </TableRow>
                                            <TableRow
                                                className={
                                                    detailsData?.classification_level === 'Evaluate'
                                                        ? 'bg-accent'
                                                        : ''
                                                }
                                            >
                                                <TableCell>Evaluate</TableCell>
                                                <TableCell>{'0.70 ≤ CC < 0.85'}</TableCell>
                                            </TableRow>
                                            <TableRow
                                                className={
                                                    detailsData?.classification_level === 'Analyze'
                                                        ? 'bg-accent'
                                                        : ''
                                                }
                                            >
                                                <TableCell>Analyze</TableCell>
                                                <TableCell>{'0.55 ≤ CC < 0.70'}</TableCell>
                                            </TableRow>
                                            <TableRow
                                                className={
                                                    detailsData?.classification_level === 'Apply'
                                                        ? 'bg-accent'
                                                        : ''
                                                }
                                            >
                                                <TableCell>Apply</TableCell>
                                                <TableCell>{'0.40 ≤ CC < 0.55'}</TableCell>
                                            </TableRow>
                                            <TableRow
                                                className={
                                                    detailsData?.classification_level ===
                                                    'Understand'
                                                        ? 'bg-accent'
                                                        : ''
                                                }
                                            >
                                                <TableCell>Understand</TableCell>
                                                <TableCell>{'0.25 ≤ CC < 0.40'}</TableCell>
                                            </TableRow>
                                            <TableRow
                                                className={
                                                    detailsData?.classification_level === 'Remember'
                                                        ? 'bg-accent'
                                                        : ''
                                                }
                                            >
                                                <TableCell>Remember</TableCell>
                                                <TableCell>{'CC < 0.25'}</TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className='pb-2'>
                                    <CardTitle>Material Details</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className='grid grid-cols-2 gap-4'>
                                        <div>
                                            <p className='font-medium'>Material Name:</p>
                                            <p>{rawData?.material_name || 'Not specified'}</p>
                                        </div>
                                        {Object.entries(rawData || {})
                                            .filter(
                                                ([key]) =>
                                                    ![
                                                        'material_name',
                                                        'test_case_metrics',
                                                    ].includes(key),
                                            )
                                            .map(([key, value]) => (
                                                <div key={key}>
                                                    <p className='font-medium'>{key}:</p>
                                                    <p>
                                                        {typeof value === 'object'
                                                            ? JSON.stringify(value)
                                                            : value}
                                                    </p>
                                                </div>
                                            ))}
                                    </div>

                                    {/* Display test case metrics if available */}
                                    {rawData?.test_case_metrics && (
                                        <div className='mt-6'>
                                            <TestCaseMetricsDisplay
                                                metrics={rawData.test_case_metrics}
                                            />
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {isError && !isPending && (
                        <div className='p-4'>
                            <Card className='border-destructive bg-destructive/10'>
                                <CardContent className='pt-6'>
                                    <p className='text-center text-destructive'>
                                        Error loading material classification details. Please try
                                        again.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
