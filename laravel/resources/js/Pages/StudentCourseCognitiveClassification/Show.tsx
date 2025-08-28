import { Badge } from '@/Components/UI/badge';
import { Button } from '@/Components/UI/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/UI/card';
import { Separator } from '@/Components/UI/separator';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { StudentCourseCognitiveClassificationResource } from '@/Support/Interfaces/Resources/StudentCourseCognitiveClassificationResource';
import { PageProps } from '@/types';
import { Link } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { ArrowLeft } from 'lucide-react';
import { MaterialClassifications } from './Partials/MaterialClassifications';
import { StudentCourseCognitiveClassificationDetails } from './Partials/StudentCourseCognitiveClassificationDetails';

interface ShowPageProps extends PageProps {
    data: StudentCourseCognitiveClassificationResource;
}

export default function Show({ data }: ShowPageProps) {
    const { t } = useLaravelReactI18n();

    return (
        <AuthenticatedLayout>
            <div className='container space-y-6 py-6'>
                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                        <Link href={route('student-course-cognitive-classifications.index')}>
                            <Button variant='outline' size='icon' className='h-8 w-8'>
                                <ArrowLeft />
                            </Button>
                        </Link>
                        <h1 className='text-2xl font-bold tracking-tight'>
                            {t('pages.student_course_cognitive_classification.show.title')}
                        </h1>
                    </div>
                </div>

                <div className='grid gap-6 md:grid-cols-3'>
                    <Card className='md:col-span-1'>
                        <CardHeader>
                            <div className='flex items-center justify-between'>
                                <div>
                                    <CardTitle>
                                        {t(
                                            'pages.student_course_cognitive_classification.sections.classification_info',
                                        )}
                                    </CardTitle>
                                    <CardDescription>
                                        {t(
                                            'pages.student_course_cognitive_classification.descriptions.classification_info',
                                        )}
                                    </CardDescription>
                                </div>
                                <StudentCourseCognitiveClassificationDetails
                                    classificationId={data.id}
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className='space-y-4'>
                                <div className='flex justify-between'>
                                    <span className='font-medium text-muted-foreground'>
                                        {t(
                                            'pages.student_course_cognitive_classification.fields.student',
                                        )}
                                    </span>
                                    <span className='font-semibold'>{data.user?.name}</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='font-medium text-muted-foreground'>
                                        {t(
                                            'pages.student_course_cognitive_classification.fields.course',
                                        )}
                                    </span>
                                    <span className='font-semibold'>{data.course?.name}</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='font-medium text-muted-foreground'>
                                        {t(
                                            'pages.student_course_cognitive_classification.fields.classification_type',
                                        )}
                                    </span>
                                    <span className='font-semibold'>
                                        {data.classification_type}
                                    </span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='font-medium text-muted-foreground'>
                                        {t(
                                            'pages.student_course_cognitive_classification.fields.classification_level',
                                        )}
                                    </span>
                                    <Badge variant='outline'>{data.classification_level}</Badge>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='font-medium text-muted-foreground'>
                                        {t(
                                            'pages.student_course_cognitive_classification.fields.classification_score',
                                        )}
                                    </span>
                                    <span className='font-semibold'>
                                        {data.classification_score}
                                    </span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='font-medium text-muted-foreground'>
                                        {t(
                                            'pages.student_course_cognitive_classification.fields.classified_at',
                                        )}
                                    </span>
                                    <span className='font-semibold'>
                                        {new Date(data.classified_at).toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            <Separator className='my-4' />

                            <div className='space-y-4'>
                                <h3 className='font-semibold'>
                                    {t(
                                        'pages.student_course_cognitive_classification.fields.recommendations',
                                    )}
                                </h3>
                                {data.classification_type === 'cognitive_levels' &&
                                data.raw_data?.recommendations ? (
                                    <div className='space-y-2'>
                                        {data.raw_data.recommendations.map(
                                            (rec: any, index: number) => (
                                                <div
                                                    key={index}
                                                    className='flex items-start gap-2 rounded border p-2'
                                                >
                                                    <Badge
                                                        variant={
                                                            rec.priority === 'high'
                                                                ? 'destructive'
                                                                : rec.priority === 'medium'
                                                                  ? 'secondary'
                                                                  : 'outline'
                                                        }
                                                        className='text-xs'
                                                    >
                                                        {rec.priority}
                                                    </Badge>
                                                    <div className='flex-1 text-sm'>
                                                        {rec.message}
                                                        {rec.level_name && (
                                                            <div className='mt-1 text-xs text-muted-foreground'>
                                                                Focus: {rec.level_name}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                ) : (
                                    <ul className='list-disc space-y-2 pl-5'>
                                        {data.raw_data?.recommendations?.map(
                                            (rec: string, index: number) => (
                                                <li key={index} className='text-sm'>
                                                    {rec}
                                                </li>
                                            ),
                                        )}
                                    </ul>
                                )}
                            </div>

                            {/* Cognitive Levels Summary */}
                            {data.classification_type === 'cognitive_levels' &&
                                data.raw_data?.course_cognitive_analysis && (
                                    <>
                                        <Separator className='my-4' />
                                        <div className='space-y-4'>
                                            <h3 className='font-semibold'>
                                                Cognitive Levels Achievement
                                            </h3>
                                            <div className='grid grid-cols-2 gap-2'>
                                                {Object.entries(
                                                    data.raw_data.course_cognitive_analysis
                                                        .aggregated_cognitive_levels || {},
                                                ).map(([level, levelData]: [string, any]) => (
                                                    <div
                                                        key={level}
                                                        className='rounded border p-2 text-center'
                                                    >
                                                        <div className='text-xs font-medium'>
                                                            {level}
                                                        </div>
                                                        <div className='text-sm font-bold'>
                                                            {((levelData.rate || 0) * 100).toFixed(
                                                                1,
                                                            )}
                                                            %
                                                        </div>
                                                        <div className='text-xs text-muted-foreground'>
                                                            {levelData.achieved || 0}/
                                                            {levelData.total || 0}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className='text-sm text-muted-foreground'>
                                                Highest Level:{' '}
                                                <strong>
                                                    {data.raw_data.course_cognitive_analysis
                                                        .highest_achieved_level || 'None'}
                                                </strong>
                                            </div>
                                        </div>
                                    </>
                                )}
                        </CardContent>
                    </Card>

                    <Card className='md:col-span-2'>
                        <CardHeader>
                            <CardTitle>
                                {t(
                                    'pages.student_course_cognitive_classification.sections.material_classifications',
                                )}
                            </CardTitle>
                            <CardDescription>
                                {t(
                                    'pages.student_course_cognitive_classification.descriptions.material_classifications',
                                )}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <MaterialClassifications
                                userId={data.user_id}
                                courseId={data.course_id}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
