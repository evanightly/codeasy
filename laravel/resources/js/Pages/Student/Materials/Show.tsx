import { Badge } from '@/Components/UI/badge';
import { Button } from '@/Components/UI/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/card';
import { Progress } from '@/Components/UI/progress';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { LearningMaterialTypeEnum } from '@/Support/Enums/learningMaterialTypeEnum';
import { CourseResource, LearningMaterialResource } from '@/Support/Interfaces/Resources';
import { Link } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { ArrowLeft, ArrowRight, Check, Clock, Code, FileTextIcon } from 'lucide-react';

interface QuestionProgress {
    id: number;
    title: string;
    order_number: number;
    completed: boolean;
    score: number;
    coding_time: number;
    trial_status: boolean;
}

interface MaterialProgress {
    total: number;
    completed: number;
    percentage: number;
    questions: QuestionProgress[];
}

interface Props {
    course: {
        data: CourseResource;
    };
    material: {
        data: LearningMaterialResource;
    };
    progress: MaterialProgress;
}

export default function Show({ course, material, progress }: Props) {
    const { t } = useLaravelReactI18n();

    const formatTime = (seconds: number) => {
        if (seconds === 0) return '0m';
        const mins = Math.floor(seconds / 60);
        const hrs = Math.floor(mins / 60);

        if (hrs > 0) {
            return `${hrs}h ${mins % 60}m`;
        }
        return `${mins}m`;
    };

    return (
        <AuthenticatedLayout title={material.data.title}>
            <div className='mb-6 flex items-center justify-between'>
                <Link href={route('student.courses.show', course.data.id)}>
                    <Button variant='outline' size='sm' className='gap-1'>
                        <ArrowLeft className='h-4 w-4' />
                        {t('pages.student_courses.actions.back_to_courses')}
                    </Button>
                </Link>
            </div>

            <Card className='mb-6'>
                <CardHeader>
                    <div className='flex items-center gap-2'>
                        <CardTitle>{material.data.title}</CardTitle>
                        <Badge variant='outline' className='flex items-center'>
                            {material.data.type === LearningMaterialTypeEnum.LIVE_CODE ? (
                                <Code className='mr-1 h-4 w-4' />
                            ) : (
                                <FileTextIcon className='mr-1 h-4 w-4' />
                            )}
                            {material.data.type === LearningMaterialTypeEnum.LIVE_CODE
                                ? t('pages.learning_material.common.types.live_code')
                                : material.data.type}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    {material.data.description && (
                        <div className='mb-4'>
                            <h3 className='font-semibold'>
                                {t('pages.student_materials.common.fields.description')}:
                            </h3>
                            <p>{material.data.description}</p>
                        </div>
                    )}

                    <div className='mb-8'>
                        <h3 className='mb-2 font-semibold'>
                            {t('pages.student_materials.show.progress')}:
                        </h3>
                        <div className='space-y-1'>
                            <div className='flex justify-between text-xs text-muted-foreground'>
                                <span>
                                    {t('pages.student_materials.show.completed', {
                                        count: progress.completed,
                                        total: progress.total,
                                    })}
                                </span>
                                <span>{progress.percentage}%</span>
                            </div>
                            <Progress value={progress.percentage} />
                        </div>
                    </div>

                    {/* Questions list */}
                    <div className='space-y-4'>
                        <h2 className='text-xl font-semibold'>
                            {t('pages.student_materials.show.questions')}
                        </h2>

                        {progress.questions.map((question) => (
                            <div
                                key={question.id}
                                className='flex flex-col rounded-lg border p-4 hover:bg-accent/50'
                            >
                                <div className='flex items-center justify-between'>
                                    <h3 className='font-medium'>
                                        <span className='mr-2 inline-block rounded-full bg-muted px-2 py-1 text-xs'>
                                            {question.order_number}
                                        </span>
                                        {question.title}
                                    </h3>
                                    <div className='flex items-center gap-2'>
                                        {question.completed && (
                                            <Badge
                                                variant='success'
                                                className='flex items-center gap-1'
                                            >
                                                <Check className='h-3 w-3' />
                                                {t('pages.student_materials.show.completed_label')}
                                            </Badge>
                                        )}
                                        {question.trial_status && !question.completed && (
                                            <Badge
                                                variant='secondary'
                                                className='flex items-center gap-1'
                                            >
                                                {t('pages.student_materials.show.in_progress')}
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                <div className='mt-2 flex items-center justify-between text-sm text-muted-foreground'>
                                    <div className='flex items-center gap-4'>
                                        {question.coding_time > 0 && (
                                            <div className='flex items-center gap-1'>
                                                <Clock className='h-4 w-4' />
                                                {formatTime(question.coding_time)}
                                            </div>
                                        )}

                                        {question.completed && (
                                            <div>
                                                {t('pages.student_materials.show.score')}:{' '}
                                                {question.score}/100
                                            </div>
                                        )}
                                    </div>

                                    <Link
                                        href={route('student.questions.show', [
                                            course.data.id,
                                            material.data.id,
                                            question.id,
                                        ])}
                                        className='flex items-center gap-1 text-blue-600 hover:underline'
                                    >
                                        {question.trial_status
                                            ? t('pages.student_materials.show.continue')
                                            : t('pages.student_materials.show.start')}
                                        <ArrowRight className='h-4 w-4' />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </AuthenticatedLayout>
    );
}
