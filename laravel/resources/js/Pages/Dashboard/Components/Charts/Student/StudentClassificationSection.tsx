/* eslint-disable perfectionist/sort-jsx-props */
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
import { Progress } from '@/Components/UI/progress';
import { StudentCourseCognitiveClassificationHistoryViewer } from '@/Pages/StudentCourseCognitiveClassification/Partials/StudentCourseCognitiveClassificationHistoryViewer';
import { studentCourseCognitiveClassificationServiceHook } from '@/Services/studentCourseCognitiveClassificationServiceHook';
import { CourseResource } from '@/Support/Interfaces/Resources';
import { usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { Award, Brain, Calendar, Download, Lightbulb, TrendingUp } from 'lucide-react';
import { useState } from 'react';

interface StudentClassificationSectionProps {
    /** List of courses the student is enrolled in */
    courses: Array<CourseResource>;
    /** Loading state for courses data */
    isLoading?: boolean;
}

/**
 * Component to display student's cognitive classification results
 * Shows courses with current classifications and provides dialog access to history
 */
export function StudentClassificationSection({
    courses,
    isLoading = false,
}: StudentClassificationSectionProps) {
    const { t } = useLaravelReactI18n();
    const { auth } = usePage().props;
    const currentUserId = auth?.user?.id;

    const [selectedCourse, setSelectedCourse] = useState<{ id: number; name: string } | null>(null);
    const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);

    // Hook calls must be at the top level of the component
    const exportCalculationStepsMutation =
        studentCourseCognitiveClassificationServiceHook.useExportCalculationSteps();

    // Function to get badge color based on cognitive level
    const getLevelColor = (level: string) => {
        switch (level?.toLowerCase()) {
            case 'create':
                return 'bg-purple-100 text-purple-800 border-purple-300';
            case 'evaluate':
                return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'analyze':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'apply':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'understand':
                return 'bg-orange-100 text-orange-800 border-orange-300';
            case 'remember':
                return 'bg-gray-100 text-gray-800 border-gray-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    // Function removed - no longer needed for simple card layout

    const handleExportCalculationSteps = (classificationId: number) => {
        if (!classificationId) return;

        exportCalculationStepsMutation.mutate({
            id: classificationId,
        });
    };

    const openCourseDialog = (course: { id: number; name: string }) => {
        setSelectedCourse(course);
        setIsHistoryDialogOpen(true);
    };

    return (
        <div className='space-y-6'>
            <div className='space-y-2'>
                <div className='flex items-center gap-2'>
                    <Brain className='h-5 w-5 text-primary' />
                    <h2 className='text-xl font-semibold'>
                        {t('pages.dashboard.student.cognitive_classification.title')}
                    </h2>
                </div>
                <p className='text-muted-foreground'>
                    {t('pages.dashboard.student.cognitive_classification.description')}
                </p>
            </div>

            {isLoading ? (
                <Card>
                    <CardContent className='pt-6'>
                        <p className='text-center text-muted-foreground'>
                            {t('pages.dashboard.student.cognitive_classification.loading')}
                        </p>
                    </CardContent>
                </Card>
            ) : courses.length === 0 ? (
                <Card>
                    <CardContent className='pt-6'>
                        <p className='text-center text-muted-foreground'>
                            {t('pages.dashboard.student.cognitive_classification.no_courses')}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                    {courses.map((course) => (
                        <SimpleCourseCard
                            key={course.id}
                            course={course}
                            userId={currentUserId}
                            getLevelColor={getLevelColor}
                            onOpenDialog={openCourseDialog}
                            onExportCalculationSteps={handleExportCalculationSteps}
                        />
                    ))}
                </div>
            )}

            {/* Course Classification History Dialog */}
            <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
                <DialogContent className='max-h-[90vh] max-w-screen-xl space-y-4 overflow-y-auto'>
                    <DialogHeader>
                        <DialogTitle>
                            {t(
                                'pages.dashboard.student.cognitive_classification.classification_history_title',
                            )}{' '}
                            {selectedCourse?.name}
                        </DialogTitle>
                        <DialogDescription>
                            {t(
                                'pages.dashboard.student.cognitive_classification.classification_history_subtitle',
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    {/* Course Recommendations and Information Section */}
                    {selectedCourse && currentUserId && (
                        <CourseRecommendationsSection
                            userId={currentUserId}
                            courseId={selectedCourse.id}
                            courseName={selectedCourse.name}
                            getLevelColor={getLevelColor}
                        />
                    )}

                    {selectedCourse && currentUserId && (
                        <StudentCourseCognitiveClassificationHistoryViewer
                            userId={currentUserId}
                            courseId={selectedCourse.id}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

interface SimpleCourseCardProps {
    course: { id: number; name: string };
    userId: number;
    getLevelColor: (level: string) => string;
    onOpenDialog: (course: { id: number; name: string }) => void;
    onExportCalculationSteps: (classificationId: number) => void;
}

/**
 * Simple card component showing course with current classification
 */
function SimpleCourseCard({
    course,
    userId,
    getLevelColor,
    onOpenDialog,
    onExportCalculationSteps,
}: SimpleCourseCardProps) {
    const { t } = useLaravelReactI18n();
    // Get latest course-level classification
    const { data: courseClassification, isLoading } =
        studentCourseCognitiveClassificationServiceHook.useGetCourseClassificationForStudent(
            userId,
            course.id,
            'topsis',
        );

    return (
        <Card className='cursor-pointer transition-all hover:shadow-md'>
            <CardHeader className='pb-3'>
                <div className='flex items-center justify-between'>
                    <div className='flex-1' onClick={() => onOpenDialog(course)}>
                        <CardTitle className='text-lg'>{course.name}</CardTitle>
                        <CardDescription>
                            {t(
                                'pages.dashboard.student.cognitive_classification.card.click_for_details',
                            )}
                        </CardDescription>
                    </div>
                    {courseClassification && (
                        <Button
                            variant='outline'
                            size='sm'
                            onClick={(e) => {
                                e.stopPropagation();
                                onExportCalculationSteps(courseClassification.id);
                            }}
                        >
                            <Download className='h-4 w-4' />
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent onClick={() => onOpenDialog(course)}>
                {isLoading ? (
                    <div className='flex items-center justify-center py-4'>
                        <div className='h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent'></div>
                        <span className='ml-2 text-sm'>
                            {t('pages.dashboard.student.cognitive_classification.card.loading')}
                        </span>
                    </div>
                ) : courseClassification ? (
                    <div className='space-y-3'>
                        <div className='flex items-center justify-between'>
                            <Badge
                                className={getLevelColor(courseClassification.classification_level)}
                            >
                                {courseClassification.classification_level}
                            </Badge>
                            <span className='text-sm text-muted-foreground'>
                                {(courseClassification.classification_score * 100).toFixed(1)}%
                            </span>
                        </div>
                        <div className='space-y-1'>
                            <Progress
                                value={courseClassification.classification_score * 100}
                                className='h-2'
                            />
                            <p className='text-xs text-muted-foreground'>
                                {t(
                                    'pages.dashboard.student.cognitive_classification.card.last_classified',
                                )}{' '}
                                {format(
                                    new Date(courseClassification.classified_at),
                                    'dd MMM yyyy',
                                )}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className='py-4 text-center'>
                        <p className='text-sm text-muted-foreground'>
                            {t(
                                'pages.dashboard.student.cognitive_classification.card.no_classification',
                            )}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

interface CourseRecommendationsSectionProps {
    userId: number;
    courseId: number;
    courseName: string;
    getLevelColor: (level: string) => string;
}

/**
 * Component to display course recommendations and current classification information
 */
function CourseRecommendationsSection({
    userId,
    courseId,
    courseName,
    getLevelColor,
}: CourseRecommendationsSectionProps) {
    const { t } = useLaravelReactI18n();

    // Get latest course-level classification with recommendations
    const { data: courseClassification, isLoading } =
        studentCourseCognitiveClassificationServiceHook.useGetCourseClassificationForStudent(
            userId,
            courseId,
            'topsis',
        );

    if (isLoading) {
        return (
            <Card className='mb-6'>
                <CardContent className='pt-6'>
                    <div className='flex items-center justify-center py-4'>
                        <div className='h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent'></div>
                        <span className='ml-2 text-sm'>
                            {t(
                                'pages.dashboard.student.cognitive_classification.dialog.loading_info',
                            )}
                        </span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!courseClassification) {
        return (
            <Card className='mb-6'>
                <CardContent className='pt-6'>
                    <div className='py-4 text-center'>
                        <p className='text-sm text-muted-foreground'>
                            {t('pages.dashboard.student.cognitive_classification.dialog.no_data')}
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const recommendations = courseClassification.raw_data?.recommendations || [];
    const materialClassifications = courseClassification.raw_data?.material_classifications || [];

    return (
        <div className='mb-6 space-y-4'>
            {/* Current Classification Summary */}
            <Card>
                <CardHeader className='pb-3'>
                    <CardTitle className='flex items-center gap-2'>
                        <Award className='h-5 w-5 text-primary' />
                        {t(
                            'pages.dashboard.student.cognitive_classification.dialog.summary_title',
                        )}{' '}
                        - {courseName}
                    </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                        <div className='space-y-2'>
                            <div className='flex items-center gap-2'>
                                <Brain className='h-4 w-4 text-muted-foreground' />
                                <span className='text-sm font-medium'>
                                    {t(
                                        'pages.dashboard.student.cognitive_classification.dialog.cognitive_level',
                                    )}
                                </span>
                            </div>
                            <Badge
                                className={getLevelColor(courseClassification.classification_level)}
                            >
                                {courseClassification.classification_level}
                            </Badge>
                        </div>
                        <div className='space-y-2'>
                            <div className='flex items-center gap-2'>
                                <TrendingUp className='h-4 w-4 text-muted-foreground' />
                                <span className='text-sm font-medium'>
                                    {t(
                                        'pages.dashboard.student.cognitive_classification.dialog.classification_score',
                                    )}
                                </span>
                            </div>
                            <div className='space-y-1'>
                                <div className='text-lg font-semibold'>
                                    {(courseClassification.classification_score * 100).toFixed(1)}%
                                </div>
                                <Progress
                                    value={courseClassification.classification_score * 100}
                                    className='h-2'
                                />
                            </div>
                        </div>
                        <div className='space-y-2'>
                            <div className='flex items-center gap-2'>
                                <Calendar className='h-4 w-4 text-muted-foreground' />
                                <span className='text-sm font-medium'>
                                    {t(
                                        'pages.dashboard.student.cognitive_classification.dialog.last_updated',
                                    )}
                                </span>
                            </div>
                            <div className='text-sm text-muted-foreground'>
                                {format(
                                    new Date(courseClassification.classified_at),
                                    'dd MMM yyyy, HH:mm',
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Material Performance Summary */}
                    {materialClassifications.length > 0 && (
                        <div className='border-t pt-4'>
                            <h4 className='mb-3 text-sm font-medium'>
                                {t(
                                    'pages.dashboard.student.cognitive_classification.dialog.material_performance',
                                )}
                            </h4>
                            <div className='grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3'>
                                {materialClassifications.map((material: any, index: number) => (
                                    <div
                                        key={material.id || index}
                                        className='flex items-center justify-between rounded-md border p-2'
                                    >
                                        <div className='min-w-0 flex-1'>
                                            <div className='truncate text-xs font-medium'>
                                                {material.material_name ||
                                                    `Material ${material.material_id}`}
                                            </div>
                                            <div className='text-xs text-muted-foreground'>
                                                {t(
                                                    'pages.dashboard.student.cognitive_classification.dialog.score_label',
                                                )}{' '}
                                                {(material.score * 100).toFixed(1)}%
                                            </div>
                                        </div>
                                        <Badge
                                            variant='secondary'
                                            className={`ml-2 text-xs ${getLevelColor(material.level)}`}
                                        >
                                            {material.level}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Recommendations */}
            {recommendations.length > 0 && (
                <Card>
                    <CardHeader className='pb-3'>
                        <CardTitle className='flex items-center gap-2'>
                            <Lightbulb className='h-5 w-5 text-amber-500' />
                            {t(
                                'pages.dashboard.student.cognitive_classification.dialog.recommendations.title',
                            )}
                        </CardTitle>
                        <CardDescription>
                            {t(
                                'pages.dashboard.student.cognitive_classification.dialog.recommendations.subtitle',
                            )}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className='space-y-2'>
                            {recommendations.map((recommendation: string, index: number) => (
                                <li key={index} className='flex items-start gap-2'>
                                    <div className='mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500' />
                                    <span className='text-sm'>{recommendation}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
