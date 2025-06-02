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
import { usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { Brain, Download } from 'lucide-react';
import { useState } from 'react';

interface StudentClassificationSectionProps {
    /** List of courses the student is enrolled in */
    courses: Array<{
        id: number;
        name: string;
    }>;
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
                    <h2 className='text-xl font-semibold'>Klasifikasi Kognitif</h2>
                </div>
                <p className='text-muted-foreground'>
                    Tingkat pemahaman kognitif berdasarkan taksonomi Bloom
                </p>
            </div>

            {isLoading ? (
                <Card>
                    <CardContent className='pt-6'>
                        <p className='text-center text-muted-foreground'>Memuat data kursus...</p>
                    </CardContent>
                </Card>
            ) : courses.length === 0 ? (
                <Card>
                    <CardContent className='pt-6'>
                        <p className='text-center text-muted-foreground'>
                            Belum terdaftar di kursus manapun.
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
                <DialogContent className='max-h-[90vh] max-w-screen-xl overflow-y-auto'>
                    <DialogHeader>
                        <DialogTitle>
                            Riwayat Klasifikasi Kognitif - {selectedCourse?.name}
                        </DialogTitle>
                        <DialogDescription>
                            Lihat perkembangan tingkat kognitif dan tren pembelajaran dari waktu ke
                            waktu
                        </DialogDescription>
                    </DialogHeader>
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
                        <CardDescription>Klik untuk melihat riwayat detail</CardDescription>
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
                        <span className='ml-2 text-sm'>Memuat...</span>
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
                                Terakhir:{' '}
                                {format(
                                    new Date(courseClassification.classified_at),
                                    'dd MMM yyyy',
                                )}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className='py-4 text-center'>
                        <p className='text-sm text-muted-foreground'>Belum ada klasifikasi</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
