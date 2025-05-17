import { Card, CardContent } from '@/Components/UI/card';
import { Separator } from '@/Components/UI/separator';
import { Skeleton } from '@/Components/UI/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/UI/table';
import { studentCognitiveClassificationServiceHook } from '@/Services/studentCognitiveClassificationServiceHook';
import { StudentCognitiveClassificationResource } from '@/Support/Interfaces/Resources';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { StudentCognitiveClassificationDetails } from './StudentCognitiveClassificationDetails';

interface MaterialClassificationsProps {
    userId: number | string;
    courseId: number;
}

export function MaterialClassifications({ userId, courseId }: MaterialClassificationsProps) {
    const { t } = useLaravelReactI18n();

    const { data: materialClassifications, isLoading } =
        studentCognitiveClassificationServiceHook.useGetMaterialClassifications(
            Number(userId),
            courseId,
        );

    if (isLoading) {
        return (
            <div className='space-y-4'>
                <Skeleton className='h-8 w-full' />
                <Skeleton className='h-8 w-full' />
                <Skeleton className='h-8 w-full' />
            </div>
        );
    }

    if (!materialClassifications || materialClassifications.length === 0) {
        return (
            <Card>
                <CardContent className='py-6'>
                    <p className='text-center text-muted-foreground'>
                        {t(
                            'pages.student_course_cognitive_classification.messages.no_material_classifications',
                        )}
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className='space-y-4'>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>
                            {t('pages.student_course_cognitive_classification.columns.material')}
                        </TableHead>
                        <TableHead>
                            {t(
                                'pages.student_course_cognitive_classification.columns.classification_level',
                            )}
                        </TableHead>
                        <TableHead>
                            {t(
                                'pages.student_course_cognitive_classification.columns.classification_score',
                            )}
                        </TableHead>
                        <TableHead>
                            {t('pages.student_course_cognitive_classification.columns.actions')}
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {materialClassifications.map(
                        (classification: StudentCognitiveClassificationResource) => (
                            <TableRow key={classification.id}>
                                <TableCell className='font-medium'>
                                    {classification.raw_data.material_name || 'Unknown Material'}
                                </TableCell>
                                <TableCell>{classification.classification_level}</TableCell>
                                <TableCell>
                                    {parseFloat(
                                        classification.classification_score.toString(),
                                    ).toFixed(2)}
                                </TableCell>
                                <TableCell>
                                    <div className='flex items-center space-x-2'>
                                        {classification.id && (
                                            <StudentCognitiveClassificationDetails
                                                classificationId={classification.id}
                                            />
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ),
                    )}
                </TableBody>
            </Table>

            <Separator className='my-4' />

            <div className='grid grid-cols-3 gap-4'>
                {materialClassifications.map((classification) => (
                    <Card key={classification.id} className='p-4'>
                        <h3 className='mb-2 text-lg font-semibold'>
                            {classification.raw_data.material_name || 'Unknown Material'}
                        </h3>
                        <p className='mb-1'>
                            <span className='font-medium'>
                                {t(
                                    'pages.student_course_cognitive_classification.fields.classification_level',
                                )}
                                :{' '}
                            </span>
                            {classification.classification_level}
                        </p>
                        <p className='mb-3'>
                            <span className='font-medium'>
                                {t(
                                    'pages.student_course_cognitive_classification.fields.classification_score',
                                )}
                                :{' '}
                            </span>
                            {parseFloat(classification.classification_score.toString()).toFixed(2)}
                        </p>
                        {classification.id && (
                            <StudentCognitiveClassificationDetails
                                classificationId={classification.id}
                            />
                        )}
                    </Card>
                ))}
            </div>
        </div>
    );
}
