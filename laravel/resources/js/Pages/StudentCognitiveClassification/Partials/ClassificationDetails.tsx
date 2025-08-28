import { Alert, AlertDescription, AlertTitle } from '@/Components/UI/alert';
import { Badge } from '@/Components/UI/badge';
import { Button } from '@/Components/UI/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/UI/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/Components/UI/dialog';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/UI/tabs';
import { studentCognitiveClassificationServiceHook } from '@/Services/studentCognitiveClassificationServiceHook';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { Eye } from 'lucide-react';
import { useState } from 'react';

// Cognitive Levels specific interfaces
interface CognitiveLevelData {
    achieved: number;
    total: number;
    rate: number;
}

interface CognitiveLevelsAnalysis {
    rates: Record<string, CognitiveLevelData>;
    highest_achieved_level: string | null;
}

interface CognitiveLevelsRawData {
    cognitive_level_analysis: CognitiveLevelsAnalysis;
    material_info: {
        material_title: string;
        material_id: number;
    };
    calculation_details: {
        steps: Array<{
            step: number;
            name: string;
            description: string;
            [key: string]: any;
        }>;
        method: string;
        rule_base: Record<string, string>;
    };
    recommendations: Array<{
        type: string;
        message: string;
        priority: string;
        [key: string]: any;
    }>;
}

export function ClassificationDetails({ classificationId }: { classificationId: number }) {
    const { t } = useLaravelReactI18n();
    const [isOpen, setIsOpen] = useState(false);
    const {
        mutateAsync: getDetails,
        data: details,
        isPending,
        isError,
        error,
    } = studentCognitiveClassificationServiceHook.useGetClassificationDetails();

    const handleOpen = async () => {
        try {
            await getDetails({ id: classificationId });
            setIsOpen(true);
        } catch (error) {
            console.error('Error fetching classification details:', error);
        }
    };

    // Format numbers to 4 decimal places
    const formatNumber = (num: number | undefined) => {
        return typeof num === 'number' ? num.toFixed(4) : '-';
    };

    // Format percentage
    const formatPercentage = (num: number) => {
        return `${(num * 100).toFixed(1)}%`;
    };

    // Get cognitive level display name
    const getCognitiveLevelName = (level: string): string => {
        const mapping: Record<string, string> = {
            C1: 'Remember',
            C2: 'Understand',
            C3: 'Apply',
            C4: 'Analyze',
            C5: 'Evaluate',
            C6: 'Create',
        };
        return mapping[level] || level;
    };

    // Get priority badge variant
    const getPriorityVariant = (
        priority: string,
    ): 'default' | 'secondary' | 'destructive' | 'outline' => {
        switch (priority) {
            case 'high':
                return 'destructive';
            case 'medium':
                return 'secondary';
            case 'low':
                return 'outline';
            default:
                return 'default';
        }
    };

    // Check if this is a cognitive levels classification
    const isCognitiveLevels = details?.data?.classification_type === 'cognitive_levels';

    // Render cognitive levels breakdown
    const renderCognitiveLevelsBreakdown = () => {
        if (!isCognitiveLevels || !details?.data?.raw_data?.cognitive_level_analysis) {
            return null;
        }

        const analysis = details.data.raw_data.cognitive_level_analysis;
        const rates = analysis.rates || {};

        return (
            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                        <Eye className='h-5 w-5' />
                        Cognitive Levels Analysis
                    </CardTitle>
                    <CardDescription>
                        Breakdown of achievement rates for each cognitive level based on Bloom's
                        taxonomy
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className='space-y-4'>
                        {Object.entries(rates).map(([level, data]) => {
                            const levelData = data as CognitiveLevelData;
                            return (
                                <div
                                    key={level}
                                    className='flex items-center justify-between rounded-lg border p-3'
                                >
                                    <div className='flex items-center gap-3'>
                                        <Badge
                                            variant={
                                                level === analysis.highest_achieved_level
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                        >
                                            {level}
                                        </Badge>
                                        <div>
                                            <div className='font-medium'>
                                                {getCognitiveLevelName(level)}
                                            </div>
                                            <div className='text-sm text-muted-foreground'>
                                                {levelData.achieved} of {levelData.total} achieved
                                            </div>
                                        </div>
                                    </div>
                                    <div className='text-right'>
                                        <div className='font-medium'>
                                            {formatPercentage(levelData.rate)}
                                        </div>
                                        <div className='h-2 w-20 overflow-hidden rounded-full bg-muted'>
                                            <div
                                                style={{ width: `${levelData.rate * 100}%` }}
                                                className={`h-full transition-all ${
                                                    level === analysis.highest_achieved_level
                                                        ? 'bg-primary'
                                                        : 'bg-muted-foreground'
                                                }`}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {analysis.highest_achieved_level && (
                        <div className='mt-4 rounded-lg bg-muted p-3'>
                            <div className='font-medium'>Highest Achieved Level</div>
                            <div className='text-sm text-muted-foreground'>
                                {getCognitiveLevelName(analysis.highest_achieved_level)} (
                                {analysis.highest_achieved_level})
                                {rates[analysis.highest_achieved_level] &&
                                    ` - ${formatPercentage(rates[analysis.highest_achieved_level].rate)}`}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    };

    // Render recommendations with cognitive levels support
    const renderRecommendations = () => {
        if (!details?.data?.raw_data?.recommendations) {
            return null;
        }

        const recommendations = details.data.raw_data.recommendations;

        return (
            <Card>
                <CardHeader>
                    <CardTitle>Recommendations</CardTitle>
                    <CardDescription>Personalized suggestions for improvement</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className='space-y-3'>
                        {recommendations.map((rec: any, index: number) => (
                            <div key={index} className='flex gap-3 rounded-lg border p-3'>
                                <Badge variant={getPriorityVariant(rec.priority || 'medium')}>
                                    {rec.priority || 'Medium'}
                                </Badge>
                                <div className='flex-1'>
                                    <div className='text-sm'>{rec.message}</div>
                                    {rec.type && (
                                        <div className='mt-1 text-xs text-muted-foreground'>
                                            Type: {rec.type.replace(/_/g, ' ')}
                                        </div>
                                    )}
                                    {rec.level_name && (
                                        <div className='text-xs text-muted-foreground'>
                                            Focus Area: {rec.level_name}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <>
            <Button variant='ghost' size='icon' onClick={handleOpen}>
                <Eye className='h-4 w-4' />
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className='flex max-h-[90vh] max-w-screen-2xl flex-col overflow-auto'>
                    <DialogHeader>
                        <DialogTitle>
                            Classification Details
                            {details?.data?.learning_material?.title &&
                                ` - ${details.data.learning_material.title}`}
                        </DialogTitle>
                        <DialogDescription>
                            Detailed breakdown of the cognitive classification process
                        </DialogDescription>
                    </DialogHeader>

                    {isPending && (
                        <div className='flex justify-center p-4'>
                            <div className='h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent'></div>
                        </div>
                    )}

                    {isError && (
                        <Alert variant='destructive'>
                            <AlertTitle>Error Loading Details</AlertTitle>
                            <AlertDescription>
                                {error?.message || 'Failed to load classification details'}
                            </AlertDescription>
                        </Alert>
                    )}

                    {details && (
                        <div className='space-y-6'>
                            {/* Classification Summary */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Classification Summary</CardTitle>
                                    <CardDescription>
                                        Basic information about this classification
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
                                        <div>
                                            <div className='text-sm text-muted-foreground'>
                                                Student
                                            </div>
                                            <div className='font-medium'>
                                                {details.data.user?.name}
                                            </div>
                                        </div>
                                        <div>
                                            <div className='text-sm text-muted-foreground'>
                                                Course
                                            </div>
                                            <div className='font-medium'>
                                                {details.data.course?.name}
                                            </div>
                                        </div>
                                        <div>
                                            <div className='text-sm text-muted-foreground'>
                                                Type
                                            </div>
                                            <Badge variant='outline'>
                                                {details.data.classification_type}
                                            </Badge>
                                        </div>
                                        <div>
                                            <div className='text-sm text-muted-foreground'>
                                                Level
                                            </div>
                                            <Badge>{details.data.classification_level}</Badge>
                                        </div>
                                        <div>
                                            <div className='text-sm text-muted-foreground'>
                                                Score
                                            </div>
                                            <div className='font-medium'>
                                                {formatNumber(
                                                    parseFloat(details.data.classification_score),
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <div className='text-sm text-muted-foreground'>
                                                Date
                                            </div>
                                            <div className='font-medium'>
                                                {new Date(
                                                    details.data.classified_at,
                                                ).toLocaleDateString()}
                                            </div>
                                        </div>
                                        {details.data.learning_material && (
                                            <div className='md:col-span-2'>
                                                <div className='text-sm text-muted-foreground'>
                                                    Material
                                                </div>
                                                <div className='font-medium'>
                                                    {details.data.learning_material.title}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Cognitive Levels Analysis (if applicable) */}
                            {isCognitiveLevels && renderCognitiveLevelsBreakdown()}

                            {/* Recommendations */}
                            {renderRecommendations()}

                            {/* Traditional Classification Details (for non-cognitive levels) */}
                            {!isCognitiveLevels && details.data.calculation_details && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Calculation Details</CardTitle>
                                        <CardDescription>
                                            Step-by-step breakdown of the classification calculation
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Tabs defaultValue='overview'>
                                            <TabsList>
                                                <TabsTrigger value='overview'>Overview</TabsTrigger>
                                                <TabsTrigger value='matrix'>
                                                    Decision Matrix
                                                </TabsTrigger>
                                                <TabsTrigger value='steps'>
                                                    Calculation Steps
                                                </TabsTrigger>
                                            </TabsList>

                                            <TabsContent value='overview' className='pt-4'>
                                                <div className='space-y-4'>
                                                    <div className='grid grid-cols-2 gap-4'>
                                                        <div>
                                                            <div className='text-sm text-muted-foreground'>
                                                                Classification Method
                                                            </div>
                                                            <div className='font-medium'>
                                                                {details.data.classification_type.toUpperCase()}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className='text-sm text-muted-foreground'>
                                                                Final Score
                                                            </div>
                                                            <div className='font-medium'>
                                                                {formatNumber(
                                                                    parseFloat(
                                                                        details.data
                                                                            .classification_score,
                                                                    ),
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </TabsContent>

                                            <TabsContent value='matrix' className='pt-4'>
                                                <Alert>
                                                    <AlertTitle>Decision Matrix</AlertTitle>
                                                    <AlertDescription>
                                                        Traditional classification decision matrix
                                                        would be displayed here.
                                                    </AlertDescription>
                                                </Alert>
                                            </TabsContent>

                                            <TabsContent value='steps' className='pt-4'>
                                                <Alert>
                                                    <AlertTitle>Calculation Steps</AlertTitle>
                                                    <AlertDescription>
                                                        Traditional classification calculation steps
                                                        would be displayed here.
                                                    </AlertDescription>
                                                </Alert>
                                            </TabsContent>
                                        </Tabs>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
