// TODO: localization not implemented yet

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
import { Separator } from '@/Components/UI/separator';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/UI/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/UI/tabs';
import { studentCognitiveClassificationServiceHook } from '@/Services/studentCognitiveClassificationServiceHook';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { Eye } from 'lucide-react';
import { useState } from 'react';

interface ClassificationCriteria {
    benefits: string[];
    costs: string[];
}

interface CalculationStep {
    name: string;
    description: string;
    column_sums?: number[];
    normalized_matrix?: number[][];
    weights?: number[];
    weighted_matrix?: number[][];
    ideal_best?: number[];
    ideal_worst?: number[];
    separation_best?: number[];
    separation_worst?: number[];
    performance_scores?: number[];
    final_score?: number;
    final_level?: string;
    rules?: Record<string, string>;
    [key: string]: any; // Allow for additional properties
}

interface CalculationDetails {
    criteria: ClassificationCriteria;
    decision_matrix: number[][];
    steps: CalculationStep[];
}

interface _ClassificationDetailsData {
    id: number;
    user_id: number;
    user: {
        id: number;
        name: string;
    };
    course_id: number;
    course: {
        id: number;
        name: string;
    };
    classification_type: string;
    classification_level: string;
    classification_score: string;
    classified_at: string;
    calculation_details: CalculationDetails;
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

    // Get criteria labels from calculation details
    const getCriteriaLabels = (): ClassificationCriteria => {
        if (!details?.data?.calculation_details?.criteria) {
            return { benefits: [], costs: [] };
        }

        return {
            benefits: details.data.calculation_details.criteria.benefits || [],
            costs: details.data.calculation_details.criteria.costs || [],
        };
    };

    // Define the specific metric order for consistent display
    const METRIC_ORDER = [
        'compile_count',
        'coding_time',
        'completion_status',
        'trial_status',
        'variable_count',
        'function_count',
        'test_case_completion_rate',
    ];

    // Display names for metrics in table headers
    const METRIC_DISPLAY_NAMES: Record<string, string> = {
        compile_count: 'compile',
        coding_time: 'waktu',
        completion_status: 'selesai',
        trial_status: 'coba',
        variable_count: 'variables',
        function_count: 'functions',
        test_case_completion_rate: 'test case completion rate',
    };

    // Render decision matrix directly from materials object
    const renderDecisionMatrixFromMaterials = () => {
        console.log(details?.data?.raw_data?.materials);

        const rawData = details?.data?.raw_data;
        const materials = rawData?.materials;

        if (!materials) {
            return <p>No materials data available</p>;
        }

        // Get material IDs and sort them numerically
        const materialIds = Object.keys(materials).sort((a, b) => Number(a) - Number(b));

        // Find all question IDs from the first material to determine the number of questions
        const firstMaterialQuestions = Object.keys(materials[materialIds[0]]).sort(
            (a, b) => Number(a) - Number(b),
        );
        const questionCount = firstMaterialQuestions.length;

        return (
            <div className='overflow-x-auto'>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead rowSpan={2} className='border-r'>
                                Material
                            </TableHead>
                            {Array.from({ length: questionCount }).map((_, idx) => (
                                <TableHead
                                    key={`question-${idx}`}
                                    colSpan={METRIC_ORDER.length}
                                    className='border-r text-center'
                                >
                                    Question {idx + 1}
                                </TableHead>
                            ))}
                        </TableRow>
                        <TableRow>
                            {Array.from({ length: questionCount }).map((_, qIdx) =>
                                METRIC_ORDER.map((metricKey, mIdx) => (
                                    <TableHead key={`metric-${qIdx}-${mIdx}`}>
                                        {METRIC_DISPLAY_NAMES[metricKey]}
                                    </TableHead>
                                )),
                            )}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {materialIds.map((materialId, materialIdx) => {
                            // Get all questions for this material and sort them
                            const questionIds = Object.keys(materials[materialId]).sort(
                                (a, b) => Number(a) - Number(b),
                            );

                            return (
                                <TableRow key={`material-${materialId}`}>
                                    <TableCell className='border-r'>
                                        Material {materialIdx + 1}
                                    </TableCell>
                                    {questionIds.map((questionId) => {
                                        const questionData = materials[materialId][questionId];

                                        // Generate cells in the exact specified order
                                        return METRIC_ORDER.map((metricKey, _metricIdx) => (
                                            <TableCell
                                                key={`cell-${materialId}-${questionId}-${metricKey}`}
                                            >
                                                {formatNumber(questionData[metricKey])}
                                            </TableCell>
                                        ));
                                    })}
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        );
    };

    // Function to properly render decision matrix data based on the required order
    const renderDecisionMatrixData = () => {
        if (!details?.data?.calculation_details?.decision_matrix) {
            return <p>No decision matrix data available</p>;
        }

        const decisionMatrix = details.data.calculation_details.decision_matrix;

        // Determine the number of questions per material
        const metricCount = METRIC_ORDER.length; // 6 metrics per question
        const questionCount = Math.floor(decisionMatrix[0].length / metricCount);

        return (
            <div className='overflow-x-auto'>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead rowSpan={2}>
                                {t('pages.classification.table_headers.material')}
                            </TableHead>
                            {Array.from({ length: questionCount }).map((_, idx) => (
                                <TableHead
                                    key={`question-${idx}`}
                                    colSpan={metricCount}
                                    className='text-center'
                                >
                                    Question {idx + 1}
                                </TableHead>
                            ))}
                        </TableRow>
                        <TableRow>
                            {Array.from({ length: questionCount }).map((_, qIdx) =>
                                METRIC_ORDER.map((metric, mIdx) => (
                                    <TableHead key={`metric-${qIdx}-${mIdx}`}>
                                        {
                                            METRIC_DISPLAY_NAMES[
                                                metric as keyof typeof METRIC_DISPLAY_NAMES
                                            ]
                                        }
                                    </TableHead>
                                )),
                            )}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {decisionMatrix.map((row: number[], rowIdx: number) => (
                            <TableRow key={`row-${rowIdx}`}>
                                <TableCell>Material {rowIdx + 1}</TableCell>
                                {row.map((value: number, colIdx: number) => (
                                    <TableCell key={`cell-${rowIdx}-${colIdx}`}>
                                        {formatNumber(value)}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        );
    };
    console.log(details?.data);

    const renderCriteriaInfo = () => {
        const criteria = getCriteriaLabels();

        const uniqueBenefits = Array.from(
            new Set(criteria.benefits.map((b) => b.replace(/_q\d+$/, ''))),
        );

        const uniqueCosts = Array.from(new Set(criteria.costs.map((c) => c.replace(/_q\d+$/, ''))));

        return (
            <div className='grid grid-cols-2 gap-4'>
                <Card>
                    <CardHeader className='pb-2'>
                        <CardTitle>{t('pages.classification.cards.benefit_criteria')}</CardTitle>
                        <CardDescription>Higher values are better</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className='list-disc pl-5'>
                            {uniqueBenefits.map((benefit, idx) => (
                                <li key={`benefit-${idx}`} className='text-green-600'>
                                    {benefit}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className='pb-2'>
                        <CardTitle>{t('pages.classification.cards.cost_criteria')}</CardTitle>
                        <CardDescription>Lower values are better</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className='list-disc pl-5'>
                            {uniqueCosts.map((cost, idx) => (
                                <li key={`cost-${idx}`} className='text-red-600'>
                                    {cost}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        );
    };

    const renderCalculationSteps = () => {
        if (!details?.data?.calculation_details?.steps) {
            return <p>No calculation steps available</p>;
        }

        const steps = details.data.calculation_details.steps;

        return (
            <div className='space-y-6'>
                {steps.map((step: CalculationStep, index: number) => (
                    <Card key={`step-${index}`}>
                        <CardHeader className='pb-2'>
                            <CardTitle>{step.name}</CardTitle>
                            <CardDescription>{step.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {step.column_sums && (
                                <div className='mb-4'>
                                    <h4 className='mb-2 text-sm font-medium'>
                                        {t('pages.classification.section_headers.column_sums')}
                                    </h4>
                                    <div className='overflow-x-auto'>
                                        <Table>
                                            <TableBody>
                                                <TableRow>
                                                    {step.column_sums.map((sum, idx) => (
                                                        <TableCell key={`sum-${idx}`}>
                                                            {formatNumber(sum)}
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            )}

                            {step.normalized_matrix && (
                                <div className='mb-4'>
                                    <h4 className='mb-2 text-sm font-medium'>
                                        {t(
                                            'pages.classification.section_headers.normalized_matrix',
                                        )}
                                    </h4>
                                    <div className='overflow-x-auto'>
                                        <Table>
                                            <TableBody>
                                                {step.normalized_matrix.map((row, rowIdx) => (
                                                    <TableRow key={`norm-row-${rowIdx}`}>
                                                        {row.map((value, colIdx) => (
                                                            <TableCell
                                                                key={`norm-cell-${rowIdx}-${colIdx}`}
                                                            >
                                                                {formatNumber(value)}
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            )}

                            {step.weights && (
                                <div className='mb-4'>
                                    <h4 className='mb-2 text-sm font-medium'>
                                        {t('pages.classification.section_headers.weights')}
                                    </h4>
                                    <div className='overflow-x-auto'>
                                        <Table>
                                            <TableBody>
                                                <TableRow>
                                                    {step.weights.map((weight, idx) => (
                                                        <TableCell key={`weight-${idx}`}>
                                                            {formatNumber(weight)}
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            )}

                            {step.weighted_matrix && (
                                <div className='mb-4'>
                                    <h4 className='mb-2 text-sm font-medium'>
                                        {t('pages.classification.section_headers.weighted_matrix')}
                                    </h4>
                                    <div className='overflow-x-auto'>
                                        <Table>
                                            <TableBody>
                                                {step.weighted_matrix.map((row, rowIdx) => (
                                                    <TableRow key={`weighted-row-${rowIdx}`}>
                                                        {row.map((value, colIdx) => (
                                                            <TableCell
                                                                key={`weighted-cell-${rowIdx}-${colIdx}`}
                                                            >
                                                                {formatNumber(value)}
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            )}

                            {step.ideal_best && step.ideal_worst && (
                                <div className='mb-4'>
                                    <h4 className='mb-2 text-sm font-medium'>
                                        {t('pages.classification.section_headers.ideal_solutions')}
                                    </h4>
                                    <div className='overflow-x-auto'>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>
                                                        {t(
                                                            'pages.classification.table_headers.solution',
                                                        )}
                                                    </TableHead>
                                                    {step.ideal_best.map((_, idx) => (
                                                        <TableHead key={`ideal-head-${idx}`}>
                                                            C{idx + 1}
                                                        </TableHead>
                                                    ))}
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                <TableRow>
                                                    <TableCell>Ideal Best (A+)</TableCell>
                                                    {step.ideal_best.map((value, idx) => (
                                                        <TableCell key={`ideal-best-${idx}`}>
                                                            {formatNumber(value)}
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell>Ideal Worst (A-)</TableCell>
                                                    {step.ideal_worst.map((value, idx) => (
                                                        <TableCell key={`ideal-worst-${idx}`}>
                                                            {formatNumber(value)}
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            )}

                            {step.separation_best && step.separation_worst && (
                                <div className='mb-4'>
                                    <h4 className='mb-2 text-sm font-medium'>
                                        Separation Measures
                                    </h4>
                                    <div className='overflow-x-auto'>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>
                                                        {t(
                                                            'pages.classification.table_headers.alternative',
                                                        )}
                                                    </TableHead>
                                                    <TableHead>S+ (from ideal best)</TableHead>
                                                    <TableHead>S- (from ideal worst)</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {step.separation_best.map((_, idx) => (
                                                    <TableRow key={`sep-row-${idx}`}>
                                                        <TableCell>Material {idx + 1}</TableCell>
                                                        <TableCell>
                                                            {step.separation_best &&
                                                                formatNumber(
                                                                    step.separation_best[idx],
                                                                )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {step.separation_worst &&
                                                                formatNumber(
                                                                    step.separation_worst[idx],
                                                                )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            )}

                            {step.performance_scores && (
                                <div className='mb-4'>
                                    <h4 className='mb-2 text-sm font-medium'>
                                        {t(
                                            'pages.classification.section_headers.performance_scores',
                                        )}
                                    </h4>
                                    <div className='overflow-x-auto'>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Alternative</TableHead>
                                                    <TableHead>Performance Score (Ci)</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {step.performance_scores.map((score, idx) => (
                                                    <TableRow key={`perf-row-${idx}`}>
                                                        <TableCell>Material {idx + 1}</TableCell>
                                                        <TableCell>{formatNumber(score)}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            )}

                            {step.final_score !== undefined && (
                                <div className='mb-4'>
                                    <h4 className='mb-2 text-sm font-medium'>
                                        {t('pages.classification.section_headers.final_score')}
                                    </h4>
                                    <Badge variant='outline' className='py-2 text-lg'>
                                        {formatNumber(step.final_score)}
                                    </Badge>
                                </div>
                            )}

                            {step.final_level && (
                                <div className='mb-4'>
                                    <h4 className='mb-2 text-sm font-medium'>
                                        {t('pages.classification.section_headers.final_level')}
                                    </h4>
                                    <Badge className='py-2 text-lg'>{step.final_level}</Badge>
                                </div>
                            )}

                            <Separator />

                            {step.rules && (
                                <div className='my-4'>
                                    <h4 className='mb-2 text-sm font-medium'>
                                        Classification Rules
                                    </h4>
                                    <div className='overflow-x-auto'>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Level</TableHead>
                                                    <TableHead>Score Range</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {Object.entries(step.rules).map(
                                                    ([level, rule], idx) => (
                                                        <TableRow key={`rule-${idx}`}>
                                                            <TableCell>{level}</TableCell>
                                                            <TableCell>{rule}</TableCell>
                                                        </TableRow>
                                                    ),
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
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
                        <DialogTitle>{t('pages.classification.dialog.title')}</DialogTitle>
                        <DialogDescription>
                            {t('pages.classification.dialog.description')}
                        </DialogDescription>
                    </DialogHeader>

                    {isPending && <div>{t('pages.classification.status.loading')}</div>}

                    {isError && (
                        <Alert variant='destructive'>
                            <AlertTitle>{t('pages.classification.status.error_title')}</AlertTitle>
                            <AlertDescription>
                                {error?.message || t('pages.classification.status.error_message')}
                            </AlertDescription>
                        </Alert>
                    )}

                    {details && (
                        <div className='flex flex-col gap-4'>
                            <div className='grid grid-cols-2 gap-4'>
                                <Card>
                                    <CardHeader className='pb-2'>
                                        <CardTitle>
                                            {t('pages.classification.cards.classification_result')}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className='flex flex-col gap-2'>
                                            <div className='flex justify-between'>
                                                <span className='font-semibold'>Student:</span>
                                                <span>{details?.data.user?.name}</span>
                                            </div>
                                            <div className='flex justify-between'>
                                                <span className='font-semibold'>Course:</span>
                                                <span>{details?.data.course?.name}</span>
                                            </div>
                                            <div className='flex justify-between'>
                                                <span className='font-semibold'>Method:</span>
                                                <span>{details?.data.classification_type}</span>
                                            </div>
                                            <div className='flex justify-between'>
                                                <span className='font-semibold'>Level:</span>
                                                <Badge>{details?.data.classification_level}</Badge>
                                            </div>
                                            <div className='flex justify-between'>
                                                <span className='font-semibold'>Score:</span>
                                                <span>
                                                    {formatNumber(
                                                        parseFloat(
                                                            details?.data?.classification_score,
                                                        ),
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className='pb-2'>
                                        <CardTitle>
                                            {t('pages.classification.cards.rule_base_mapping')}
                                        </CardTitle>
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
                                                        details?.data.classification_level ===
                                                        'Create'
                                                            ? 'bg-accent'
                                                            : ''
                                                    }
                                                >
                                                    <TableCell>Create</TableCell>
                                                    <TableCell>CC ≥ 0.85</TableCell>
                                                </TableRow>
                                                <TableRow
                                                    className={
                                                        details?.data.classification_level ===
                                                        'Evaluate'
                                                            ? 'bg-accent'
                                                            : ''
                                                    }
                                                >
                                                    <TableCell>Evaluate</TableCell>
                                                    <TableCell>{'0.70 ≤ CC < 0.85'}</TableCell>
                                                </TableRow>
                                                <TableRow
                                                    className={
                                                        details?.data.classification_level ===
                                                        'Analyze'
                                                            ? 'bg-accent'
                                                            : ''
                                                    }
                                                >
                                                    <TableCell>Analyze</TableCell>
                                                    <TableCell>{'0.55 ≤ CC < 0.70'}</TableCell>
                                                </TableRow>
                                                <TableRow
                                                    className={
                                                        details?.data.classification_level ===
                                                        'Apply'
                                                            ? 'bg-accent'
                                                            : ''
                                                    }
                                                >
                                                    <TableCell>Apply</TableCell>
                                                    <TableCell>{'0.40 ≤ CC < 0.55'}</TableCell>
                                                </TableRow>
                                                <TableRow
                                                    className={
                                                        details?.data.classification_level ===
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
                                                        details?.data.classification_level ===
                                                        'Remember'
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
                            </div>

                            <Card className='flex-1'>
                                <CardHeader className='pb-2'>
                                    <CardTitle>
                                        {t('pages.classification.cards.calculation_process')}
                                    </CardTitle>
                                    <CardDescription>
                                        Step-by-step breakdown of the classification calculation
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Tabs defaultValue='rawData'>
                                        <TabsList>
                                            <TabsTrigger value='rawData'>
                                                Decision Matrix Data
                                            </TabsTrigger>
                                            {details?.data.calculation_details && (
                                                <TabsTrigger value='steps'>
                                                    Calculation Steps
                                                </TabsTrigger>
                                            )}
                                            {details?.data.calculation_details && (
                                                <TabsTrigger value='criteria'>
                                                    Criteria Info
                                                </TabsTrigger>
                                            )}
                                        </TabsList>

                                        <TabsContent value='rawData' className='pt-4'>
                                            <h3 className='mb-4 text-lg font-semibold'>
                                                Decision Matrix Data
                                            </h3>
                                            <div className='overflow-x-auto'>
                                                {details?.data?.raw_data?.materials ? (
                                                    renderDecisionMatrixFromMaterials()
                                                ) : details?.data?.calculation_details
                                                      ?.decision_matrix ? (
                                                    renderDecisionMatrixData() // Fallback to the original method if materials not available
                                                ) : (
                                                    <Alert>
                                                        <AlertTitle>
                                                            No Decision Matrix Data Available
                                                        </AlertTitle>
                                                    </Alert>
                                                )}
                                            </div>
                                        </TabsContent>

                                        {details?.data.calculation_details && (
                                            <TabsContent value='steps' className='pt-4'>
                                                {renderCalculationSteps()}
                                            </TabsContent>
                                        )}

                                        {details?.data.calculation_details && (
                                            <TabsContent value='criteria' className='pt-4'>
                                                {renderCriteriaInfo()}
                                            </TabsContent>
                                        )}
                                    </Tabs>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
