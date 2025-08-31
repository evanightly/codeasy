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
import { studentCourseCognitiveClassificationServiceHook } from '@/Services/studentCourseCognitiveClassificationServiceHook';
import { Brain, Eye, Target, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { StudentCourseCognitiveClassificationHistoryViewer } from './StudentCourseCognitiveClassificationHistoryViewer';

// Course cognitive levels classification interfaces
interface CognitiveLevelRate {
    achieved: number;
    total: number;
    rate: number;
}

interface MaterialBreakdown {
    material_id: number;
    material_title: string;
    classification_level: string;
    classification_score: number;
    cognitive_level_rates: Record<string, CognitiveLevelRate>;
    highest_achieved_level: string | null;
}

interface CourseRecommendation {
    type: string;
    message: string;
    priority: string;
    level?: string;
    level_name?: string;
    achieved?: number;
    total?: number;
    current_rate?: number;
    material_id?: number;
    material_title?: string;
    current_level?: string;
    current_score?: number;
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
    const isCognitiveLevels = details?.classification_type === 'cognitive_levels';
    const rawData = details?.raw_data;

    // Render cognitive levels analysis for course - COMMENTED OUT OLD VERSION
    // const renderCourseCognitiveLevelsAnalysis = () => {
    //     if (!isCognitiveLevels || !rawData?.course_cognitive_analysis) {
    //         return null;
    //     }

    //     const analysis = rawData.course_cognitive_analysis;
    //     const aggregatedLevels = analysis.aggregated_cognitive_levels || {};

    //     return (
    //         <Card>
    //             <CardHeader>
    //                 <CardTitle className='flex items-center gap-2'>
    //                     <Brain className='h-5 w-5' />
    //                     Course Cognitive Levels Analysis
    //                 </CardTitle>
    //                 <CardDescription>
    //                     Aggregated cognitive achievement across all materials in the course
    //                 </CardDescription>
    //             </CardHeader>
    //             <CardContent>
    //                 <div className='space-y-4'>
    //                     {Object.entries(aggregatedLevels).map(([level, data]) => {
    //                         const levelData = data as CognitiveLevelRate;
    //                         return (
    //                             <div
    //                                 key={level}
    //                                 className='flex items-center justify-between rounded-lg border p-3'
    //                             >
    //                                 <div className='flex items-center gap-3'>
    //                                     <Badge
    //                                         variant={
    //                                             level === analysis.highest_achieved_level
    //                                                 ? 'default'
    //                                                 : 'outline'
    //                                         }
    //                                     >
    //                                         {level}
    //                                     </Badge>
    //                                     <div>
    //                                         <div className='font-medium'>
    //                                             {getCognitiveLevelName(level)}
    //                                         </div>
    //                                         <div className='text-sm text-muted-foreground'>
    //                                             {levelData.achieved} of {levelData.total} achieved
    //                                         </div>
    //                                     </div>
    //                                 </div>
    //                                 <div className='text-right'>
    //                                     <div className='font-medium'>
    //                                         {formatPercentage(levelData.rate)}
    //                                     </div>
    //                                     <div className='h-2 w-20 overflow-hidden rounded-full bg-muted'>
    //                                         <div
    //                                             style={{ width: `${levelData.rate * 100}%` }}
    //                                             className={`h-full transition-all ${
    //                                                 level === analysis.highest_achieved_level
    //                                                     ? 'bg-primary'
    //                                                     : 'bg-muted-foreground'
    //                                             }`}
    //                                         />
    //                                     </div>
    //                                 </div>
    //                             </div>
    //                         );
    //                     })}
    //                 </div>

    //                 <div className='mt-6 grid grid-cols-1 gap-4 md:grid-cols-3'>
    //                     <div className='rounded-lg bg-muted p-3'>
    //                         <div className='font-medium'>Final Classification</div>
    //                         <div className='text-lg font-bold'>{analysis.final_classification}</div>
    //                         <div className='text-sm text-muted-foreground'>
    //                             Score: {formatNumber(analysis.final_score)}
    //                         </div>
    //                     </div>

    //                     <div className='rounded-lg bg-muted p-3'>
    //                         <div className='font-medium'>Highest Level</div>
    //                         <div className='text-lg font-bold'>
    //                             {getCognitiveLevelName(analysis.highest_achieved_level)}
    //                         </div>
    //                         <div className='text-sm text-muted-foreground'>
    //                             Rate: {formatPercentage(analysis.highest_rate)}
    //                         </div>
    //                     </div>

    //                     <div className='rounded-lg bg-muted p-3'>
    //                         <div className='font-medium'>Overall Progress</div>
    //                         <div className='text-lg font-bold'>
    //                             {rawData.calculation_details?.total_achieved || 0} /{' '}
    //                             {rawData.calculation_details?.total_cognitive_levels || 0}
    //                         </div>
    //                         <div className='text-sm text-muted-foreground'>
    //                             {formatPercentage(
    //                                 rawData.calculation_details?.overall_achievement_rate || 0,
    //                             )}{' '}
    //                             achieved
    //                         </div>
    //                     </div>
    //                 </div>
    //             </CardContent>
    //         </Card>
    //     );
    // };

    // NEW: Render cognitive levels analysis based on actual data structure
    const renderCourseCognitiveLevelsAnalysis = () => {
        if (!isCognitiveLevels || !rawData) {
            return null;
        }

        // Check if we have course_cognitive_analysis (the detailed breakdown)
        const courseAnalysis = rawData.course_cognitive_analysis;
        const materialsData = rawData.material_breakdowns;

        if (!courseAnalysis && !materialsData) {
            return null;
        }

        // If we have course_cognitive_analysis, use it for the detailed breakdown
        if (courseAnalysis && courseAnalysis.aggregated_cognitive_levels) {
            const aggregatedLevels = courseAnalysis.aggregated_cognitive_levels;

            // Map final classification to cognitive level code for highlighting
            const finalClassificationLevel = (() => {
                const mapping: Record<string, string> = {
                    Remember: 'C1',
                    Understand: 'C2',
                    Apply: 'C3',
                    Analyze: 'C4',
                    Evaluate: 'C5',
                    Create: 'C6',
                };
                return (
                    mapping[courseAnalysis.final_classification] ||
                    courseAnalysis.final_classification
                );
            })();

            const highlightedLevel = finalClassificationLevel;

            return (
                <Card>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2'>
                            <Brain className='h-5 w-5' />
                            Course Cognitive Levels Analysis
                        </CardTitle>
                        <CardDescription>
                            Aggregated cognitive achievement across all materials in the course
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className='space-y-4'>
                            {Object.entries(aggregatedLevels).map(([level, data]) => {
                                const levelData = data as CognitiveLevelRate;
                                const isHighlighted = level === highlightedLevel;

                                return (
                                    <div
                                        key={level}
                                        className={`flex items-center justify-between rounded-lg border p-3 ${
                                            isHighlighted ? 'border-primary bg-primary/5' : ''
                                        }`}
                                    >
                                        <div className='flex items-center gap-3'>
                                            <Badge
                                                variant={isHighlighted ? 'default' : 'outline'}
                                                className={
                                                    isHighlighted
                                                        ? 'bg-primary text-primary-foreground'
                                                        : ''
                                                }
                                            >
                                                {level}
                                            </Badge>
                                            <div>
                                                <div className='font-medium'>
                                                    {getCognitiveLevelName(level)}
                                                </div>
                                                <div className='text-sm text-muted-foreground'>
                                                    {levelData.achieved} of {levelData.total}{' '}
                                                    achieved
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
                                                        isHighlighted
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

                        {/* Material Results Display - if available */}
                        {materialsData && (
                            <div className='mt-6 rounded-lg bg-muted/50 p-4'>
                                <h4 className='mb-3 font-medium'>
                                    Material Classification Results:
                                </h4>
                                <div className='grid grid-cols-1 gap-2 md:grid-cols-2'>
                                    {materialsData.map(
                                        (material: MaterialBreakdown, index: number) => (
                                            <div
                                                key={index}
                                                className='flex items-center justify-between rounded bg-background p-2'
                                            >
                                                <span className='text-sm font-medium'>
                                                    {material.material_title}
                                                </span>
                                                <Badge
                                                    variant={
                                                        material.classification_level === 'Create'
                                                            ? 'default'
                                                            : 'outline'
                                                    }
                                                    className='text-xs'
                                                >
                                                    {material.classification_level}
                                                </Badge>
                                            </div>
                                        ),
                                    )}
                                </div>
                            </div>
                        )}

                        <div className='mt-6 grid grid-cols-1 gap-4 md:grid-cols-3'>
                            <div className='rounded-lg bg-muted p-3'>
                                <div className='font-medium'>Final Classification</div>
                                <div className='text-lg font-bold'>
                                    {courseAnalysis.final_classification}
                                </div>
                                <div className='text-sm text-muted-foreground'>
                                    {materialsData
                                        ? (() => {
                                              const finalClassificationCount = materialsData.filter(
                                                  (m: MaterialBreakdown) =>
                                                      m.classification_level ===
                                                      courseAnalysis.final_classification,
                                              ).length;
                                              return `${finalClassificationCount} / ${materialsData.length} materials are having ${courseAnalysis.final_classification.toLowerCase()} (${finalClassificationLevel})`;
                                          })()
                                        : 'No material data'}
                                </div>
                            </div>

                            <div className='rounded-lg bg-muted p-3'>
                                <div className='font-medium'>Highest Level</div>
                                <div className='text-lg font-bold'>
                                    {getCognitiveLevelName(courseAnalysis.highest_achieved_level)} (
                                    {courseAnalysis.highest_achieved_level})
                                </div>
                                <div className='text-sm text-muted-foreground'>
                                    Rate: {formatPercentage(courseAnalysis.highest_rate)}
                                </div>
                            </div>

                            <div className='rounded-lg bg-muted p-3'>
                                <div className='font-medium'>Overall Progress</div>
                                <div className='text-lg font-bold'>
                                    {materialsData ? materialsData.length : 0} Materials
                                </div>
                                <div className='text-sm text-muted-foreground'>
                                    {materialsData
                                        ? `${materialsData.filter((m: MaterialBreakdown) => m.classification_level === 'Create').length} Create levels achieved`
                                        : 'No material data'}
                                </div>
                            </div>
                        </div>

                        {/* Reasoning */}
                        <div className='mt-6 rounded-lg border-l-4 border-primary bg-primary/5 p-4'>
                            <h4 className='font-medium text-primary'>Classification Reasoning:</h4>
                            <p className='mt-1 text-sm text-muted-foreground'>
                                {materialsData && courseAnalysis
                                    ? `Most materials (${materialsData.filter((m: MaterialBreakdown) => m.classification_level === 'Create').length}) achieved Create level, final classification is ${courseAnalysis.final_classification}. Highest cognitive achievement level in course analysis is ${getCognitiveLevelName(courseAnalysis.highest_achieved_level)} (${courseAnalysis.highest_achieved_level}) with ${formatPercentage(courseAnalysis.highest_rate)} achievement rate.`
                                    : `Final classification ${details?.classification_level} is determined by the course-level analysis.`}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            );
        }

        // Fallback: Use material breakdowns only (previous logic)
        const materialBreakdowns = rawData.material_breakdowns;
        if (!materialBreakdowns) return null;

        // Count cognitive levels from actual material results
        const levelCounts: Record<string, number> = {
            C1: 0,
            C2: 0,
            C3: 0,
            C4: 0,
            C5: 0,
            C6: 0,
        };

        const materialResults: Array<{ material_title: string; level: string }> = [];

        // Extract level from each material
        materialBreakdowns.forEach((material: MaterialBreakdown) => {
            const level = material.classification_level;
            materialResults.push({
                material_title: material.material_title,
                level: level,
            });

            // Count occurrences - map text levels to codes
            const levelMapping: Record<string, string> = {
                Remember: 'C1',
                Understand: 'C2',
                Apply: 'C3',
                Analyze: 'C4',
                Evaluate: 'C5',
                Create: 'C6',
            };
            const levelCode = levelMapping[level] || level;
            if (Object.prototype.hasOwnProperty.call(levelCounts, levelCode)) {
                levelCounts[levelCode]++;
            }
        });

        // Calculate total materials
        const totalMaterials = materialBreakdowns.length;

        // Find mode (most frequent) and highest level
        let maxCount = 0;
        let modeLevel = 'C1';
        let highestLevel = 'C1';

        Object.entries(levelCounts).forEach(([level, count]) => {
            if (count > maxCount) {
                maxCount = count;
                modeLevel = level;
            }
            if (count > 0 && level > highestLevel) {
                highestLevel = level;
            }
        });

        // Determine which level should be highlighted (most frequent = Create)
        const shouldHighlightCreate = levelCounts['C6'] >= levelCounts['C4']; // If Create count >= Analyze count
        const highlightedLevel = shouldHighlightCreate
            ? 'C6'
            : details?.classification_level || 'C4';

        return (
            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                        <Brain className='h-5 w-5' />
                        Course Cognitive Levels Analysis
                    </CardTitle>
                    <CardDescription>
                        Aggregated cognitive achievement across all materials in the course
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className='space-y-4'>
                        {Object.entries(levelCounts).map(([level, count]) => {
                            const percentage =
                                totalMaterials > 0 ? (count / totalMaterials) * 100 : 0;
                            const isHighlighted = level === highlightedLevel;

                            return (
                                <div
                                    key={level}
                                    className={`flex items-center justify-between rounded-lg border p-3 ${
                                        isHighlighted ? 'border-primary bg-primary/5' : ''
                                    }`}
                                >
                                    <div className='flex items-center gap-3'>
                                        <Badge
                                            variant={isHighlighted ? 'default' : 'outline'}
                                            className={
                                                isHighlighted
                                                    ? 'bg-primary text-primary-foreground'
                                                    : ''
                                            }
                                        >
                                            {level}
                                        </Badge>
                                        <div>
                                            <div className='font-medium'>
                                                {getCognitiveLevelName(level)}
                                            </div>
                                            <div className='text-sm text-muted-foreground'>
                                                {count} of {totalMaterials} achieved
                                            </div>
                                        </div>
                                    </div>
                                    <div className='text-right'>
                                        <div className='font-medium'>{percentage.toFixed(1)}%</div>
                                        <div className='h-2 w-20 overflow-hidden rounded-full bg-muted'>
                                            <div
                                                style={{ width: `${percentage}%` }}
                                                className={`h-full transition-all ${
                                                    isHighlighted
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

                    {/* Material Results Display */}
                    <div className='mt-6 rounded-lg bg-muted/50 p-4'>
                        <h4 className='mb-3 font-medium'>Material Classification Results:</h4>
                        <div className='grid grid-cols-1 gap-2 md:grid-cols-2'>
                            {materialResults.map((result, index) => (
                                <div
                                    key={index}
                                    className='flex items-center justify-between rounded bg-background p-2'
                                >
                                    <span className='text-sm font-medium'>
                                        {result.material_title}
                                    </span>
                                    <Badge
                                        variant={result.level === 'Create' ? 'default' : 'outline'}
                                        className='text-xs'
                                    >
                                        {result.level}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className='mt-6 grid grid-cols-1 gap-4 md:grid-cols-3'>
                        <div className='rounded-lg bg-muted p-3'>
                            <div className='font-medium'>Final Classification</div>
                            <div className='text-lg font-bold'>{details?.classification_level}</div>
                            <div className='text-sm text-muted-foreground'>
                                Score: {formatNumber(details?.classification_score)}
                            </div>
                        </div>

                        <div className='rounded-lg bg-muted p-3'>
                            <div className='font-medium'>Most Frequent Level</div>
                            <div className='text-lg font-bold'>
                                {getCognitiveLevelName(modeLevel)} ({modeLevel})
                            </div>
                            <div className='text-sm text-muted-foreground'>
                                Appears {maxCount} times
                            </div>
                        </div>

                        <div className='rounded-lg bg-muted p-3'>
                            <div className='font-medium'>Overall Progress</div>
                            <div className='text-lg font-bold'>{totalMaterials} Materials</div>
                            <div className='text-sm text-muted-foreground'>
                                {shouldHighlightCreate
                                    ? `${levelCounts['C6']} Create levels achieved`
                                    : `Most achieved: ${getCognitiveLevelName(modeLevel)}`}
                            </div>
                        </div>
                    </div>

                    {/* Reasoning */}
                    <div className='mt-6 rounded-lg border-l-4 border-primary bg-primary/5 p-4'>
                        <h4 className='font-medium text-primary'>Classification Reasoning:</h4>
                        <p className='mt-1 text-sm text-muted-foreground'>
                            {shouldHighlightCreate
                                ? `Most materials (${levelCounts['C6']}) achieved Create level, but final classification is ${details?.classification_level} based on course-level analysis algorithm.`
                                : `Final classification ${details?.classification_level} is determined by the course-level analysis considering all material performances.`}
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    };

    // Render material breakdowns for cognitive levels
    const renderMaterialBreakdowns = () => {
        if (!isCognitiveLevels || !rawData?.material_breakdowns) {
            return null;
        }

        const materialBreakdowns = rawData.material_breakdowns;

        return (
            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                        <Target className='h-5 w-5' />
                        Material Performance Breakdown
                    </CardTitle>
                    <CardDescription>
                        Cognitive level achievements for each learning material
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className='space-y-4'>
                        {materialBreakdowns.map((material: MaterialBreakdown) => (
                            <div key={material.material_id} className='rounded-lg border p-4'>
                                <div className='mb-3 flex items-center justify-between'>
                                    <div>
                                        <h4 className='font-medium'>{material.material_title}</h4>
                                        <div className='mt-1 flex items-center gap-2'>
                                            <Badge>{material.classification_level}</Badge>
                                            <span className='text-sm text-muted-foreground'>
                                                Score: {formatNumber(material.classification_score)}
                                            </span>
                                        </div>
                                    </div>
                                    {material.highest_achieved_level && (
                                        <Badge variant='outline'>
                                            Highest:{' '}
                                            {getCognitiveLevelName(material.highest_achieved_level)}
                                        </Badge>
                                    )}
                                </div>

                                <div className='grid grid-cols-2 gap-2 md:grid-cols-6'>
                                    {Object.entries(material.cognitive_level_rates).map(
                                        ([level, data]) => {
                                            const levelData = data as CognitiveLevelRate;
                                            return (
                                                <div
                                                    key={level}
                                                    className='rounded bg-muted p-2 text-center'
                                                >
                                                    <div className='text-xs font-medium'>
                                                        {level}
                                                    </div>
                                                    <div className='text-sm font-bold'>
                                                        {levelData.total > 0
                                                            ? formatPercentage(levelData.rate)
                                                            : 'N/A'}
                                                    </div>
                                                    <div className='text-xs text-muted-foreground'>
                                                        {levelData.achieved}/{levelData.total}
                                                    </div>
                                                </div>
                                            );
                                        },
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    };

    // Render recommendations
    const renderRecommendations = () => {
        if (!rawData?.recommendations?.length) {
            return null;
        }

        const recommendations = rawData.recommendations;

        return (
            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                        <TrendingUp className='h-5 w-5' />
                        Recommendations
                    </CardTitle>
                    <CardDescription>Personalized suggestions for improvement</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className='space-y-3'>
                        {recommendations.map((rec: CourseRecommendation, index: number) => (
                            <div key={index} className='flex gap-3 rounded-lg border p-3'>
                                <Badge variant={getPriorityVariant(rec.priority)}>
                                    {rec.priority}
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
                <DialogContent className='max-h-[90vh] max-w-screen-lg overflow-y-auto'>
                    <DialogHeader className='mb-4'>
                        <DialogTitle>Course Classification Details</DialogTitle>
                        <DialogDescription>
                            Detailed breakdown of course-level cognitive classification
                        </DialogDescription>
                    </DialogHeader>

                    {(isPending || isLoading) && (
                        <div className='flex justify-center p-4'>
                            <div className='h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent'></div>
                        </div>
                    )}

                    {details && !isPending && !isLoading && !isError && (
                        <div className='space-y-6'>
                            {/* Course Summary */}
                            <Card>
                                <CardHeader className='pb-2'>
                                    <CardTitle>Classification Summary</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
                                        <div>
                                            <div className='text-sm text-muted-foreground'>
                                                Student
                                            </div>
                                            <div className='font-medium'>{details.user?.name}</div>
                                        </div>
                                        <div>
                                            <div className='text-sm text-muted-foreground'>
                                                Course
                                            </div>
                                            <div className='font-medium'>
                                                {details.course?.name}
                                            </div>
                                        </div>
                                        <div>
                                            <div className='text-sm text-muted-foreground'>
                                                Type
                                            </div>
                                            <Badge variant='outline'>
                                                {details.classification_type}
                                            </Badge>
                                        </div>
                                        <div>
                                            <div className='text-sm text-muted-foreground'>
                                                Level
                                            </div>
                                            <Badge>{details.classification_level}</Badge>
                                        </div>
                                        <div>
                                            <div className='text-sm text-muted-foreground'>
                                                Score
                                            </div>
                                            <div className='font-medium'>
                                                {formatNumber(details.classification_score)}
                                            </div>
                                        </div>
                                        <div>
                                            <div className='text-sm text-muted-foreground'>
                                                Date
                                            </div>
                                            <div className='font-medium'>
                                                {new Date(
                                                    details.classified_at,
                                                ).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Cognitive Levels Analysis */}
                            {isCognitiveLevels && renderCourseCognitiveLevelsAnalysis()}

                            {/* Material Breakdowns */}
                            {isCognitiveLevels && renderMaterialBreakdowns()}

                            {/* Recommendations */}
                            {renderRecommendations()}

                            {/* History Viewer */}
                            <StudentCourseCognitiveClassificationHistoryViewer
                                userId={details.user_id}
                                courseId={details.course_id}
                            />
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
