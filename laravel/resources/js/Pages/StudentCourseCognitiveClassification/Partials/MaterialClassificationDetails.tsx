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
import { studentCognitiveClassificationServiceHook } from '@/Services/studentCognitiveClassificationServiceHook';
import { Eye } from 'lucide-react';
import { useState } from 'react';

interface MaterialClassificationRawData {
    material_name?: string;
    [key: string]: any; // Allow for additional properties
}

interface MaterialClassificationDetailsProps {
    classificationId: number;
}

export function MaterialClassificationDetails({
    classificationId,
}: MaterialClassificationDetailsProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [details, setDetails] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Use the material classification service hook
    const materialMutation =
        studentCognitiveClassificationServiceHook.useGetClassificationDetails();

    const handleOpen = async () => {
        setIsOpen(true);
        setIsLoading(true);
        setIsError(false);

        try {
            // For material-level classification, use the custom method
            const response = await materialMutation.mutateAsync({ id: classificationId });
            setDetails(response.data);
        } catch (error) {
            console.error('Error loading material classification details:', error);
            setIsError(true);
            setErrorMessage('Failed to load material classification details');
        } finally {
            setIsLoading(false);
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
    const rawData = details?.raw_data as MaterialClassificationRawData | undefined;

    // Render material-specific details
    const renderMaterialContent = () => {
        if (!details) return null;

        return (
            <div className='space-y-6'>
                <Card>
                    <CardHeader className='pb-2'>
                        <CardTitle>Material Classification</CardTitle>
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
                                <span className='font-semibold'>Material:</span>
                                <span>{rawData?.material_name || 'Not specified'}</span>
                            </div>
                            <div className='flex justify-between'>
                                <span className='font-semibold'>Level:</span>
                                <Badge>{details.classification_level}</Badge>
                            </div>
                            <div className='flex justify-between'>
                                <span className='font-semibold'>Score:</span>
                                <span>
                                    {formatNumber(
                                        parseFloat(details.classification_score?.toString()),
                                    )}
                                </span>
                            </div>
                            <div className='flex justify-between'>
                                <span className='font-semibold'>Classification Date:</span>
                                <span>{new Date(details.classified_at).toLocaleString()}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className='pb-2'>
                        <CardTitle>Rule Base Mapping</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <table className='w-full'>
                            <thead>
                                <tr className='border-b'>
                                    <th className='py-2 text-left'>Level</th>
                                    <th className='py-2 text-left'>Score Range</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr
                                    className={
                                        details.classification_level === 'Create' ? 'bg-accent' : ''
                                    }
                                >
                                    <td className='py-2'>Create</td>
                                    <td className='py-2'>{'CC ≥ 0.85'}</td>
                                </tr>
                                <tr
                                    className={
                                        details.classification_level === 'Evaluate'
                                            ? 'bg-accent'
                                            : ''
                                    }
                                >
                                    <td className='py-2'>Evaluate</td>
                                    <td className='py-2'>{'0.70 ≤ CC < 0.85'}</td>
                                </tr>
                                <tr
                                    className={
                                        details.classification_level === 'Analyze'
                                            ? 'bg-accent'
                                            : ''
                                    }
                                >
                                    <td className='py-2'>Analyze</td>
                                    <td className='py-2'>{'0.55 ≤ CC < 0.70'}</td>
                                </tr>
                                <tr
                                    className={
                                        details.classification_level === 'Apply' ? 'bg-accent' : ''
                                    }
                                >
                                    <td className='py-2'>Apply</td>
                                    <td className='py-2'>{'0.40 ≤ CC < 0.55'}</td>
                                </tr>
                                <tr
                                    className={
                                        details.classification_level === 'Understand'
                                            ? 'bg-accent'
                                            : ''
                                    }
                                >
                                    <td className='py-2'>Understand</td>
                                    <td className='py-2'>{'0.25 ≤ CC < 0.40'}</td>
                                </tr>
                                <tr
                                    className={
                                        details.classification_level === 'Remember'
                                            ? 'bg-accent'
                                            : ''
                                    }
                                >
                                    <td className='py-2'>Remember</td>
                                    <td className='py-2'>{'CC < 0.25'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </CardContent>
                </Card>

                {/* Add material-specific details */}
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
                                .filter(([key]) => key !== 'material_name')
                                .map(([key, value]) => (
                                    <div key={key}>
                                        <p className='font-medium'>{key}:</p>
                                        <p>
                                            {typeof value === 'object'
                                                ? JSON.stringify(value)
                                                : String(value)}
                                        </p>
                                    </div>
                                ))}
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
                    <DialogHeader>
                        <DialogTitle>Material Classification Details</DialogTitle>
                        <DialogDescription>
                            Detailed information about the material cognitive classification
                        </DialogDescription>
                    </DialogHeader>

                    {isLoading && (
                        <div className='flex justify-center p-4'>
                            <div className='h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent'></div>
                        </div>
                    )}

                    {isError && !isLoading && (
                        <div className='p-4'>
                            <Card className='border-destructive bg-destructive/10'>
                                <CardContent className='pt-6'>
                                    <p className='text-center text-destructive'>
                                        {errorMessage ||
                                            'Error loading classification details. Please try again.'}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {details && !isLoading && !isError && renderMaterialContent()}
                </DialogContent>
            </Dialog>
        </>
    );
}
