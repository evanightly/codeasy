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
    material_id?: number;
    question_metrics?: Array<{
        question_id: number;
        question_name: string;
        order_number: number;
        compile_count: number;
        coding_time: number;
        completion_status: number;
        trial_status: number;
        variable_count: number;
        function_count: number;
        test_case_complete_count: number;
        test_case_total_count: number;
        test_case_completion_rate: number;
    }>;
    recommendations?: string[];
    weak_areas?: string[];
    calculation_details?: {
        criteria?: {
            benefits?: string[];
            costs?: string[];
        };
        steps?: Array<{
            name: string;
            description: string;
            [key: string]: any;
        }>;
        [key: string]: any;
    };
    method?: string;
    classification_level?: string;
    classification_score?: number;
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

    // Get raw data from the response and parse it if it's a string
    const rawData = details?.raw_data
        ? ((typeof details.raw_data === 'string'
              ? JSON.parse(details.raw_data)
              : details.raw_data) as MaterialClassificationRawData)
        : undefined;

    console.log('details', details);

    // Render question metrics in a formatted table
    const renderQuestionMetrics = (metrics: MaterialClassificationRawData['question_metrics']) => {
        if (!metrics || metrics.length === 0) return <p>No question metrics available</p>;

        return (
            <div className='overflow-x-auto'>
                <table className='w-full text-sm'>
                    <thead>
                        <tr className='border-b'>
                            <th className='py-2 text-left'>Question</th>
                            <th className='py-2 text-left'>Compiles</th>
                            <th className='py-2 text-left'>Time (min)</th>
                            <th className='py-2 text-left'>Complete</th>
                            <th className='py-2 text-left'>Trial</th>
                            <th className='py-2 text-left'>Variables</th>
                            <th className='py-2 text-left'>Functions</th>
                            <th className='py-2 text-left'>Test Cases</th>
                        </tr>
                    </thead>
                    <tbody>
                        {metrics.map((metric) => (
                            <tr key={metric.question_id} className='border-b hover:bg-muted/50'>
                                <td className='py-2'>{metric.question_name}</td>
                                <td className='py-2'>{metric.compile_count}</td>
                                <td className='py-2'>{metric.coding_time}</td>
                                <td className='py-2'>{metric.completion_status ? 'Yes' : 'No'}</td>
                                <td className='py-2'>{metric.trial_status ? 'Yes' : 'No'}</td>
                                <td className='py-2'>{metric.variable_count}</td>
                                <td className='py-2'>{metric.function_count}</td>
                                <td className='py-2'>
                                    {metric.test_case_complete_count}/{metric.test_case_total_count}
                                    ({(metric.test_case_completion_rate * 100).toFixed(0)}%)
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    // Render recommendations as a list
    const renderRecommendations = (recommendations: string[] | undefined) => {
        if (!recommendations || recommendations.length === 0)
            return <p>No recommendations available</p>;

        // If recommendations is a string, try to parse it as JSON
        const parsedRecommendations =
            typeof recommendations === 'string' ? JSON.parse(recommendations) : recommendations;

        return (
            <ul className='list-disc space-y-1 pl-5'>
                {parsedRecommendations.map((rec: string, index: number) => (
                    <li key={index} className='text-sm'>
                        {rec}
                    </li>
                ))}
            </ul>
        );
    };

    // Render weak areas as a list
    const renderWeakAreas = (weakAreas: string[] | undefined) => {
        if (!weakAreas || weakAreas.length === 0) return <p>No weak areas identified</p>;

        // If weakAreas is a string, try to parse it as JSON
        const parsedWeakAreas = typeof weakAreas === 'string' ? JSON.parse(weakAreas) : weakAreas;

        return (
            <div className='flex flex-wrap gap-2'>
                {parsedWeakAreas.map((area: string, index: number) => (
                    <Badge variant='outline' key={index} className='capitalize'>
                        {area}
                    </Badge>
                ))}
            </div>
        );
    };

    // Render calculation details in a structured way
    const renderCalculationDetails = (
        details: MaterialClassificationRawData['calculation_details'],
    ) => {
        if (!details) return <p>No calculation details available</p>;

        // If details is a string (JSON), try to parse it
        const parsedDetails = typeof details === 'string' ? JSON.parse(details) : details;

        return (
            <div className='space-y-4'>
                {/* Criteria section */}
                {parsedDetails.criteria && (
                    <div className='space-y-2'>
                        <h4 className='font-semibold'>Criteria Used</h4>
                        <div className='grid grid-cols-2 gap-4'>
                            <div>
                                <p className='text-sm font-medium'>Benefits:</p>
                                <ul className='list-disc pl-5 text-sm'>
                                    {parsedDetails.criteria.benefits?.map(
                                        (benefit: string, idx: number) => (
                                            <li key={idx}>{benefit}</li>
                                        ),
                                    )}
                                </ul>
                            </div>
                            <div>
                                <p className='text-sm font-medium'>Costs:</p>
                                <ul className='list-disc pl-5 text-sm'>
                                    {parsedDetails.criteria.costs?.map(
                                        (cost: string, idx: number) => <li key={idx}>{cost}</li>,
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {/* Decision Matrix section if available */}
                {parsedDetails.decision_matrix && (
                    <div className='space-y-2'>
                        <h4 className='font-semibold'>Decision Matrix</h4>
                        <div className='overflow-x-auto'>
                            <table className='min-w-full text-sm'>
                                <thead>
                                    <tr className='border-b'>
                                        <th className='py-2 text-left'>Question</th>
                                        {/* Cost criteria */}
                                        <th className='py-2 text-center'>compile_count</th>
                                        <th className='py-2 text-center'>coding_time</th>
                                        <th className='py-2 text-center'>trial_status</th>
                                        {/* Benefit criteria */}
                                        <th className='py-2 text-center'>completion_status</th>
                                        <th className='py-2 text-center'>variable_count</th>
                                        <th className='py-2 text-center'>function_count</th>
                                        <th className='py-2 text-center'>test_case_rate</th>
                                    </tr>
                                    <tr className='border-b text-xs'>
                                        <th className='py-1 text-left'></th>
                                        <th className='py-1 text-center text-destructive'>
                                            Cost ↓
                                        </th>
                                        <th className='py-1 text-center text-destructive'>
                                            Cost ↓
                                        </th>
                                        <th className='py-1 text-center text-destructive'>
                                            Cost ↓
                                        </th>
                                        <th className='py-1 text-center text-success'>Benefit ↑</th>
                                        <th className='py-1 text-center text-success'>Benefit ↑</th>
                                        <th className='py-1 text-center text-success'>Benefit ↑</th>
                                        <th className='py-1 text-center text-success'>Benefit ↑</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.isArray(parsedDetails.decision_matrix) &&
                                        parsedDetails.decision_matrix.map(
                                            (row: number[], idx: number) => {
                                                // Get the question name from raw data if available
                                                const questionName =
                                                    rawData?.question_metrics?.[idx]
                                                        ?.question_name || `Question ${idx + 1}`;

                                                return (
                                                    <tr
                                                        key={idx}
                                                        className='border-b hover:bg-muted/50'
                                                    >
                                                        <td className='py-2 font-medium'>
                                                            {questionName}
                                                        </td>
                                                        {row.map(
                                                            (value: number, colIdx: number) => (
                                                                <td
                                                                    key={colIdx}
                                                                    className={'py-2 text-center'}
                                                                >
                                                                    {formatNumber(value)}
                                                                </td>
                                                            ),
                                                        )}
                                                    </tr>
                                                );
                                            },
                                        )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Steps section */}
                {parsedDetails.steps && parsedDetails.steps.length > 0 && (
                    <div className='space-y-4'>
                        <h4 className='font-semibold'>Calculation Steps</h4>
                        <div className='space-y-6'>
                            {/* Step 1: Calculate Column Sums */}
                            {parsedDetails.steps[0] && (
                                <div className='rounded border p-3'>
                                    <p className='font-medium'>1. {parsedDetails.steps[0].name}</p>
                                    <p className='mb-2 text-sm text-muted-foreground'>
                                        {parsedDetails.steps[0].description}
                                    </p>
                                    <div className='mt-2 overflow-x-auto'>
                                        <table className='w-full text-sm'>
                                            <thead>
                                                <tr className='border-b'>
                                                    <th className='py-1 text-center'>
                                                        compile_count
                                                    </th>
                                                    <th className='py-1 text-center'>
                                                        coding_time
                                                    </th>
                                                    <th className='py-1 text-center'>
                                                        trial_status
                                                    </th>
                                                    <th className='py-1 text-center'>
                                                        completion_status
                                                    </th>
                                                    <th className='py-1 text-center'>
                                                        variable_count
                                                    </th>
                                                    <th className='py-1 text-center'>
                                                        function_count
                                                    </th>
                                                    <th className='py-1 text-center'>
                                                        test_case_rate
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    {parsedDetails.steps[0].column_sums.map(
                                                        (sum: number, index: number) => (
                                                            <td
                                                                key={index}
                                                                className='py-1 text-center'
                                                            >
                                                                {formatNumber(sum)}
                                                            </td>
                                                        ),
                                                    )}
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Normalize Decision Matrix */}
                            {parsedDetails.steps[1] && parsedDetails.steps[1].normalized_matrix && (
                                <div className='rounded border p-3'>
                                    <p className='font-medium'>2. {parsedDetails.steps[1].name}</p>
                                    <p className='mb-2 text-sm text-muted-foreground'>
                                        {parsedDetails.steps[1].description}
                                    </p>
                                    <div className='mt-2 overflow-x-auto'>
                                        <table className='w-full text-sm'>
                                            <thead>
                                                <tr className='border-b'>
                                                    <th className='py-1 text-left'>Question</th>
                                                    <th className='py-1 text-center'>
                                                        compile_count
                                                    </th>
                                                    <th className='py-1 text-center'>
                                                        coding_time
                                                    </th>
                                                    <th className='py-1 text-center'>
                                                        trial_status
                                                    </th>
                                                    <th className='py-1 text-center'>
                                                        completion_status
                                                    </th>
                                                    <th className='py-1 text-center'>
                                                        variable_count
                                                    </th>
                                                    <th className='py-1 text-center'>
                                                        function_count
                                                    </th>
                                                    <th className='py-1 text-center'>
                                                        test_case_rate
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {parsedDetails.steps[1].normalized_matrix.map(
                                                    (row: number[], rowIndex: number) => (
                                                        <tr key={rowIndex} className='border-b'>
                                                            <td className='py-1 font-medium'>
                                                                Question {rowIndex + 1}
                                                            </td>
                                                            {row.map(
                                                                (
                                                                    value: number,
                                                                    colIndex: number,
                                                                ) => (
                                                                    <td
                                                                        key={colIndex}
                                                                        className='py-1 text-center'
                                                                    >
                                                                        {formatNumber(value)}
                                                                    </td>
                                                                ),
                                                            )}
                                                        </tr>
                                                    ),
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Define Weights */}
                            {parsedDetails.steps[2] && parsedDetails.steps[2].weights && (
                                <div className='rounded border p-3'>
                                    <p className='font-medium'>3. {parsedDetails.steps[2].name}</p>
                                    <p className='mb-2 text-sm text-muted-foreground'>
                                        {parsedDetails.steps[2].description}
                                    </p>
                                    <div className='mt-2 overflow-x-auto'>
                                        <table className='w-full text-sm'>
                                            <thead>
                                                <tr className='border-b'>
                                                    <th className='py-1 text-center'>
                                                        compile_count
                                                    </th>
                                                    <th className='py-1 text-center'>
                                                        coding_time
                                                    </th>
                                                    <th className='py-1 text-center'>
                                                        trial_status
                                                    </th>
                                                    <th className='py-1 text-center'>
                                                        completion_status
                                                    </th>
                                                    <th className='py-1 text-center'>
                                                        variable_count
                                                    </th>
                                                    <th className='py-1 text-center'>
                                                        function_count
                                                    </th>
                                                    <th className='py-1 text-center'>
                                                        test_case_rate
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    {parsedDetails.steps[2].weights.map(
                                                        (weight: number, index: number) => (
                                                            <td
                                                                key={index}
                                                                className='py-1 text-center'
                                                            >
                                                                {formatNumber(weight)}
                                                            </td>
                                                        ),
                                                    )}
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Apply Weights */}
                            {parsedDetails.steps[3] && parsedDetails.steps[3].weighted_matrix && (
                                <div className='rounded border p-3'>
                                    <p className='font-medium'>4. {parsedDetails.steps[3].name}</p>
                                    <p className='mb-2 text-sm text-muted-foreground'>
                                        {parsedDetails.steps[3].description}
                                    </p>
                                    <div className='mt-2 overflow-x-auto'>
                                        <table className='w-full text-sm'>
                                            <thead>
                                                <tr className='border-b'>
                                                    <th className='py-1 text-left'>Question</th>
                                                    <th className='py-1 text-center'>
                                                        compile_count
                                                    </th>
                                                    <th className='py-1 text-center'>
                                                        coding_time
                                                    </th>
                                                    <th className='py-1 text-center'>
                                                        trial_status
                                                    </th>
                                                    <th className='py-1 text-center'>
                                                        completion_status
                                                    </th>
                                                    <th className='py-1 text-center'>
                                                        variable_count
                                                    </th>
                                                    <th className='py-1 text-center'>
                                                        function_count
                                                    </th>
                                                    <th className='py-1 text-center'>
                                                        test_case_rate
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {parsedDetails.steps[3].weighted_matrix.map(
                                                    (row: number[], rowIndex: number) => (
                                                        <tr key={rowIndex} className='border-b'>
                                                            <td className='py-1 font-medium'>
                                                                Question {rowIndex + 1}
                                                            </td>
                                                            {row.map(
                                                                (
                                                                    value: number,
                                                                    colIndex: number,
                                                                ) => (
                                                                    <td
                                                                        key={colIndex}
                                                                        className='py-1 text-center'
                                                                    >
                                                                        {formatNumber(value)}
                                                                    </td>
                                                                ),
                                                            )}
                                                        </tr>
                                                    ),
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Step 5: Determine Ideal Solutions */}
                            {parsedDetails.steps[4] &&
                                parsedDetails.steps[4].ideal_best &&
                                parsedDetails.steps[4].ideal_worst && (
                                    <div className='rounded border p-3'>
                                        <p className='font-medium'>
                                            5. {parsedDetails.steps[4].name}
                                        </p>
                                        <p className='mb-2 text-sm text-muted-foreground'>
                                            {parsedDetails.steps[4].description}
                                        </p>
                                        <div className='mt-2 overflow-x-auto'>
                                            <table className='w-full text-sm'>
                                                <thead>
                                                    <tr className='border-b'>
                                                        <th className='py-1 text-left'>Solution</th>
                                                        <th className='py-1 text-center'>
                                                            compile_count
                                                        </th>
                                                        <th className='py-1 text-center'>
                                                            coding_time
                                                        </th>
                                                        <th className='py-1 text-center'>
                                                            trial_status
                                                        </th>
                                                        <th className='py-1 text-center'>
                                                            completion_status
                                                        </th>
                                                        <th className='py-1 text-center'>
                                                            variable_count
                                                        </th>
                                                        <th className='py-1 text-center'>
                                                            function_count
                                                        </th>
                                                        <th className='py-1 text-center'>
                                                            test_case_rate
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td className='py-1 font-medium'>
                                                            Ideal Best (A+)
                                                        </td>
                                                        {parsedDetails.steps[4].ideal_best.map(
                                                            (value: number, index: number) => (
                                                                <td
                                                                    key={index}
                                                                    className='py-1 text-center'
                                                                >
                                                                    {formatNumber(value)}
                                                                </td>
                                                            ),
                                                        )}
                                                    </tr>
                                                    <tr>
                                                        <td className='py-1 font-medium'>
                                                            Ideal Worst (A-)
                                                        </td>
                                                        {parsedDetails.steps[4].ideal_worst.map(
                                                            (value: number, index: number) => (
                                                                <td
                                                                    key={index}
                                                                    className='py-1 text-center'
                                                                >
                                                                    {formatNumber(value)}
                                                                </td>
                                                            ),
                                                        )}
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                            {/* Step 6: Calculate Separation Measures */}
                            {parsedDetails.steps[5] &&
                                parsedDetails.steps[5].separation_best &&
                                parsedDetails.steps[5].separation_worst && (
                                    <div className='rounded border p-3'>
                                        <p className='font-medium'>
                                            6. {parsedDetails.steps[5].name}
                                        </p>
                                        <p className='mb-2 text-sm text-muted-foreground'>
                                            {parsedDetails.steps[5].description}
                                        </p>
                                        <div className='mt-2 overflow-x-auto'>
                                            <table className='w-full text-sm'>
                                                <thead>
                                                    <tr className='border-b'>
                                                        <th className='py-1 text-left'>Question</th>
                                                        <th className='py-1 text-center'>
                                                            Distance to Ideal Best (S+)
                                                        </th>
                                                        <th className='py-1 text-center'>
                                                            Distance to Ideal Worst (S-)
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {parsedDetails.steps[5].separation_best.map(
                                                        (value: number, index: number) => (
                                                            <tr key={index} className='border-b'>
                                                                <td className='py-1 font-medium'>
                                                                    Question {index + 1}
                                                                </td>
                                                                <td className='py-1 text-center'>
                                                                    {formatNumber(value)}
                                                                </td>
                                                                <td className='py-1 text-center'>
                                                                    {formatNumber(
                                                                        parsedDetails.steps[5]
                                                                            .separation_worst[
                                                                            index
                                                                        ],
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ),
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                            {/* Step 7: Calculate Performance Score */}
                            {parsedDetails.steps[6] &&
                                parsedDetails.steps[6].performance_scores && (
                                    <div className='rounded border p-3'>
                                        <p className='font-medium'>
                                            7. {parsedDetails.steps[6].name}
                                        </p>
                                        <p className='mb-2 text-sm text-muted-foreground'>
                                            {parsedDetails.steps[6].description}
                                        </p>
                                        <div className='mt-2 overflow-x-auto'>
                                            <table className='w-full text-sm'>
                                                <thead>
                                                    <tr className='border-b'>
                                                        <th className='py-1 text-left'>Question</th>
                                                        <th className='py-1 text-center'>
                                                            Performance Score
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {parsedDetails.steps[6].performance_scores.map(
                                                        (score: number, index: number) => (
                                                            <tr key={index} className='border-b'>
                                                                <td className='py-1 font-medium'>
                                                                    Question {index + 1}
                                                                </td>
                                                                <td className='py-1 text-center'>
                                                                    {formatNumber(score)}
                                                                </td>
                                                            </tr>
                                                        ),
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                            {/* Final Steps: Average Performance & Taxonomy Mapping */}
                            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                                {/* Step 8: Calculate Average Performance */}
                                {parsedDetails.steps[7] && (
                                    <div className='rounded border p-3'>
                                        <p className='font-medium'>
                                            8. {parsedDetails.steps[7].name}
                                        </p>
                                        <p className='mb-2 text-sm text-muted-foreground'>
                                            {parsedDetails.steps[7].description}
                                        </p>
                                        <div className='mt-2 rounded-md bg-muted/50 p-2 text-center'>
                                            <span className='font-medium'>Final Score: </span>
                                            <span className='font-bold'>
                                                {formatNumber(parsedDetails.steps[7].final_score)}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Step 9: Map to Bloom's Taxonomy */}
                                {parsedDetails.steps[8] && (
                                    <div className='rounded border p-3'>
                                        <p className='font-medium'>
                                            9. {parsedDetails.steps[8].name}
                                        </p>
                                        <p className='mb-2 text-sm text-muted-foreground'>
                                            {parsedDetails.steps[8].description}
                                        </p>
                                        <div className='mt-2 rounded-md bg-muted/50 p-2 text-center'>
                                            <span className='font-medium'>Cognitive Level: </span>
                                            <span className='font-bold'>
                                                {parsedDetails.steps[8].final_level}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Handle any other properties that might be in the calculation details */}
                {Object.entries(parsedDetails)
                    .filter(([key]) => !['criteria', 'steps', 'decision_matrix'].includes(key))
                    .map(([key, value]) => (
                        <div key={key} className='space-y-1'>
                            <h4 className='font-semibold'>
                                {key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                            </h4>
                            <div className='text-sm'>
                                {typeof value === 'object' && value !== null ? (
                                    <div className='rounded bg-muted p-2'>
                                        {Array.isArray(value) ? (
                                            <ul className='list-disc pl-5'>
                                                {value.map((item, index) => (
                                                    <li key={index}>
                                                        {typeof item === 'object'
                                                            ? JSON.stringify(item, null, 2)
                                                            : String(item)}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <table className='w-full text-sm'>
                                                <tbody>
                                                    {Object.entries(value).map(([k, v], i) => (
                                                        <tr
                                                            key={i}
                                                            className={
                                                                i % 2 === 0 ? 'bg-muted/50' : ''
                                                            }
                                                        >
                                                            <td className='px-2 py-1 font-medium'>
                                                                {k
                                                                    .replace(/_/g, ' ')
                                                                    .replace(/\b\w/g, (l) =>
                                                                        l.toUpperCase(),
                                                                    )}
                                                            </td>
                                                            <td className='px-2 py-1'>
                                                                {typeof v === 'number'
                                                                    ? formatNumber(v)
                                                                    : String(v)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                ) : (
                                    String(value)
                                )}
                            </div>
                        </div>
                    ))}
            </div>
        );
    };

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
                                <span>
                                    {details.learning_material?.title ||
                                        rawData?.material_name ||
                                        'Not specified'}
                                </span>
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

                {/* Recommendations Card */}
                {rawData?.recommendations && (
                    <Card>
                        <CardHeader className='pb-2'>
                            <CardTitle>Recommendations</CardTitle>
                        </CardHeader>
                        <CardContent>{renderRecommendations(rawData.recommendations)}</CardContent>
                    </Card>
                )}

                {/* Weak Areas Card */}
                {rawData?.weak_areas && (
                    <Card>
                        <CardHeader className='pb-2'>
                            <CardTitle>Areas for Improvement</CardTitle>
                        </CardHeader>
                        <CardContent>{renderWeakAreas(rawData.weak_areas)}</CardContent>
                    </Card>
                )}

                {/* Question Metrics Card */}
                {rawData?.question_metrics && (
                    <Card>
                        <CardHeader className='pb-2'>
                            <CardTitle>Question Performance</CardTitle>
                        </CardHeader>
                        <CardContent>{renderQuestionMetrics(rawData.question_metrics)}</CardContent>
                    </Card>
                )}

                {/* Calculation Details Card */}
                {rawData?.calculation_details && (
                    <Card>
                        <CardHeader className='pb-2'>
                            <CardTitle>
                                Classification Method: {rawData.method || 'TOPSIS'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {renderCalculationDetails(rawData.calculation_details)}
                        </CardContent>
                    </Card>
                )}

                {/* Other Material Details if any */}
                <Card>
                    <CardHeader className='pb-2'>
                        <CardTitle>Additional Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            <div>
                                <p className='font-medium'>Material Name:</p>
                                <p>
                                    {details.learning_material?.title ||
                                        rawData?.material_name ||
                                        'Not specified'}
                                </p>
                            </div>
                            {Object.entries(rawData || {})
                                .filter(
                                    ([key]) =>
                                        ![
                                            'material_name',
                                            'material_id',
                                            'question_metrics',
                                            'recommendations',
                                            'weak_areas',
                                            'calculation_details',
                                            'method',
                                            'classification_level',
                                            'classification_score',
                                        ].includes(key),
                                )
                                .map(([key, value]) => (
                                    <div key={key}>
                                        <p className='font-medium'>
                                            {key
                                                .replace(/_/g, ' ')
                                                .replace(/\b\w/g, (l) => l.toUpperCase())}
                                            :
                                        </p>
                                        <p>
                                            {typeof value === 'object' && value !== null
                                                ? Array.isArray(value)
                                                    ? value.join(', ')
                                                    : Object.entries(value)
                                                          .map(([k, v]) => `${k}: ${v}`)
                                                          .join(', ')
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
