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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/UI/tabs';
import { studentCourseCognitiveClassificationServiceHook } from '@/Services/studentCourseCognitiveClassificationServiceHook';
import { Eye } from 'lucide-react';
import { useState } from 'react';
import { StudentCourseCognitiveClassificationHistoryViewer } from './StudentCourseCognitiveClassificationHistoryViewer';

// Define the expected structure of the material classification data in raw_data
interface MaterialClassification {
    id: number;
    material_id: number;
    material_name?: string;
    level: string;
    score: number;
}

interface CalculationDetails {
    material_count: number;
    average_score: number;
}

// Define the expected structure of raw_data in StudentCourseCognitiveClassification
interface CourseClassificationRawData {
    material_classifications?: MaterialClassification[];
    recommendations?: string[];
    calculation_details?: CalculationDetails;
}

// This defines the shape of our component props
interface StudentCourseCognitiveClassificationDetailsProps {
    classificationId: number;
}

/**
 * Component for displaying course-level classification details
 */
export function StudentCourseCognitiveClassificationDetails({
    classificationId,
}: StudentCourseCognitiveClassificationDetailsProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, setIsPending] = useState<boolean>(false);
    const [isError, setIsError] = useState<boolean>(false);

    // Use the course classification service hook
    const {
        data: details,
        refetch,
        isLoading,
        // error is unused
    } = studentCourseCognitiveClassificationServiceHook.useGet({
        id: classificationId,
        // Skip specifying useQueryOptions to avoid TypeScript errors
    });

    const handleOpen = async () => {
        setIsOpen(true);
        setIsPending(true);

        try {
            await refetch();
            setIsError(false);
        } catch (error) {
            console.error('Error fetching course classification details:', error);
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
    const rawData = details?.raw_data as CourseClassificationRawData | undefined;

    // Render material classifications
    const renderMaterialClassifications = () => {
        const materialClassifications = rawData?.material_classifications;

        if (!materialClassifications?.length) {
            return <p>No material classifications available</p>;
        }

        return (
            <div className='space-y-4'>
                <h3 className='text-lg font-semibold'>Material Classifications</h3>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Material Name</TableHead>
                            <TableHead>Level</TableHead>
                            <TableHead>Score</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {materialClassifications.map((material: MaterialClassification) => (
                            <TableRow key={material.id}>
                                <TableCell>
                                    {material.material_name || `Material ${material.material_id}`}
                                </TableCell>
                                <TableCell>
                                    <Badge>{material.level}</Badge>
                                </TableCell>
                                <TableCell>{formatNumber(material.score)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        );
    };

    // Render recommendations
    const renderRecommendations = () => {
        const recommendations = rawData?.recommendations;

        if (!recommendations?.length) {
            return <p>No recommendations available</p>;
        }

        return (
            <div className='space-y-4'>
                <h3 className='text-lg font-semibold'>Recommendations</h3>
                <Card>
                    <CardContent className='pt-6'>
                        <ul className='list-disc space-y-2 pl-5'>
                            {recommendations.map((recommendation: string, index: number) => (
                                <li key={index}>{recommendation}</li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        );
    };

    // Render calculation details
    const renderCalculationDetails = () => {
        const calculationDetails = rawData?.calculation_details;

        if (!calculationDetails) {
            return <p>No calculation details available</p>;
        }

        return (
            <div className='space-y-4'>
                <h3 className='text-lg font-semibold'>Calculation Details</h3>
                <Card>
                    <CardContent className='pt-6'>
                        <div className='grid grid-cols-2 gap-4'>
                            <div>
                                <p className='font-medium'>Material Count:</p>
                                <p>{calculationDetails.material_count}</p>
                            </div>
                            <div>
                                <p className='font-medium'>Average Score:</p>
                                <p>{formatNumber(calculationDetails.average_score)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    };

    return (
        <>
            <Button variant='ghost' size='icon' onClick={handleOpen}>
                <Eye className='h-4 w-4' />
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className='max-h-[90vh] max-w-screen-lg overflow-y-auto'>
                    <DialogHeader className='mb-4'>
                        <DialogTitle>Course Classification Details</DialogTitle>
                        <DialogDescription>
                            Detailed information about the course cognitive classification
                        </DialogDescription>
                    </DialogHeader>

                    {(isPending || isLoading) && (
                        <div className='flex justify-center p-4'>
                            <div className='h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent'></div>
                        </div>
                    )}

                    {details && !isPending && !isLoading && !isError && (
                        <div className='space-y-6'>
                            <Card>
                                <CardHeader className='pb-2'>
                                    <CardTitle>Classification Overview</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className='space-y-2'>
                                        <div className='flex justify-between'>
                                            <span className='font-semibold'>Student:</span>
                                            <span>{details.user?.name}</span>
                                        </div>
                                        <div className='flex justify-between'>
                                            <span className='font-semibold'>Course:</span>
                                            <span>{details.course?.name}</span>
                                        </div>
                                        <div className='flex justify-between'>
                                            <span className='font-semibold'>Level:</span>
                                            <Badge>{details.classification_level}</Badge>
                                        </div>
                                        <div className='flex justify-between'>
                                            <span className='font-semibold'>Score:</span>
                                            <span>
                                                {formatNumber(
                                                    parseFloat(
                                                        details.classification_score?.toString(),
                                                    ),
                                                )}
                                            </span>
                                        </div>
                                        <div className='flex justify-between'>
                                            <span className='font-semibold'>
                                                Classification Date:
                                            </span>
                                            <span>
                                                {new Date(details.classified_at).toLocaleString()}
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
                                                    details.classification_level === 'Create'
                                                        ? 'bg-accent'
                                                        : ''
                                                }
                                            >
                                                <TableCell>Create</TableCell>
                                                <TableCell>CC ≥ 0.85</TableCell>
                                            </TableRow>
                                            <TableRow
                                                className={
                                                    details.classification_level === 'Evaluate'
                                                        ? 'bg-accent'
                                                        : ''
                                                }
                                            >
                                                <TableCell>Evaluate</TableCell>
                                                <TableCell>{'0.70 ≤ CC < 0.85'}</TableCell>
                                            </TableRow>
                                            <TableRow
                                                className={
                                                    details.classification_level === 'Analyze'
                                                        ? 'bg-accent'
                                                        : ''
                                                }
                                            >
                                                <TableCell>Analyze</TableCell>
                                                <TableCell>{'0.55 ≤ CC < 0.70'}</TableCell>
                                            </TableRow>
                                            <TableRow
                                                className={
                                                    details.classification_level === 'Apply'
                                                        ? 'bg-accent'
                                                        : ''
                                                }
                                            >
                                                <TableCell>Apply</TableCell>
                                                <TableCell>{'0.40 ≤ CC < 0.55'}</TableCell>
                                            </TableRow>
                                            <TableRow
                                                className={
                                                    details.classification_level === 'Understand'
                                                        ? 'bg-accent'
                                                        : ''
                                                }
                                            >
                                                <TableCell>Understand</TableCell>
                                                <TableCell>{'0.25 ≤ CC < 0.40'}</TableCell>
                                            </TableRow>
                                            <TableRow
                                                className={
                                                    details.classification_level === 'Remember'
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

                            <StudentCourseCognitiveClassificationHistoryViewer
                                userId={details.user_id}
                                courseId={details.course_id}
                            />

                            <Tabs defaultValue='materials'>
                                <TabsList className='grid w-full grid-cols-3'>
                                    <TabsTrigger value='materials'>Materials</TabsTrigger>
                                    <TabsTrigger value='recommendations'>
                                        Recommendations
                                    </TabsTrigger>
                                    <TabsTrigger value='calculation'>Calculation</TabsTrigger>
                                </TabsList>
                                <TabsContent value='materials' className='pt-4'>
                                    {renderMaterialClassifications()}
                                </TabsContent>
                                <TabsContent value='recommendations' className='pt-4'>
                                    {renderRecommendations()}
                                </TabsContent>
                                <TabsContent value='calculation' className='pt-4'>
                                    {renderCalculationDetails()}
                                </TabsContent>
                            </Tabs>
                        </div>
                    )}

                    {isError && !isPending && !isLoading && (
                        <div className='p-4'>
                            <Card className='border-destructive bg-destructive/10'>
                                <CardContent className='pt-6'>
                                    <p className='text-center text-destructive'>
                                        Error loading course classification details. Please try
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
