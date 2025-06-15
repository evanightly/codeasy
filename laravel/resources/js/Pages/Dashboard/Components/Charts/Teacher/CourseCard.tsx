import { Badge } from '@/Components/UI/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/UI/card';
import { dashboardServiceHook } from '@/Services/dashboardServiceHook';
import { CourseData } from '@/Support/Interfaces/Resources/DashboardResource';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { BookOpen, Clock, Users, UserX } from 'lucide-react';

interface CourseCardProps {
    course: CourseData;
    onClick: () => void;
}

export function CourseCard({ course, onClick }: CourseCardProps) {
    const { t } = useLaravelReactI18n();
    const { data: studentsNoProgress } = dashboardServiceHook.useGetCourseStudentsNoProgress(
        course.id,
    );

    return (
        <Card
            onClick={onClick}
            className='cursor-pointer transition-all hover:shadow-md hover:ring-2 hover:ring-primary/20'
        >
            <CardHeader className='pb-3'>
                <CardTitle className='flex items-center justify-between text-base'>
                    <span className='truncate'>{course.name}</span>
                    <BookOpen className='h-4 w-4 text-muted-foreground' />
                </CardTitle>
                {course.description && (
                    <CardDescription className='line-clamp-2 text-xs'>
                        {course.description}
                    </CardDescription>
                )}
            </CardHeader>
            <CardContent className='pt-0'>
                <div className='space-y-2'>
                    <div className='flex items-center justify-between text-sm'>
                        <span className='flex items-center gap-1 text-muted-foreground'>
                            <Users className='h-3 w-3' />
                            {t('pages.dashboard.teacher.latest_progress.labels.students')}
                        </span>
                        <Badge variant='secondary'>{course.student_count}</Badge>
                    </div>

                    <div className='flex items-center justify-between text-sm'>
                        <span className='flex items-center gap-1 text-muted-foreground'>
                            <Clock className='h-3 w-3' />
                            {t('pages.dashboard.teacher.latest_progress.labels.recent_activity')}
                        </span>
                        <Badge variant='outline'>{course.recent_activity_count}</Badge>
                    </div>

                    {/* Students with no progress */}
                    <div className='flex items-center justify-between text-sm'>
                        <span className='flex items-center gap-1 text-muted-foreground'>
                            <UserX className='h-3 w-3' />
                            {t('pages.dashboard.teacher.latest_progress.labels.no_progress')}
                        </span>
                        {studentsNoProgress ? (
                            <Badge
                                variant={
                                    studentsNoProgress.total_count > 0 ? 'destructive' : 'secondary'
                                }
                                className={
                                    studentsNoProgress.total_count > 0
                                        ? 'bg-red-100 text-red-700'
                                        : ''
                                }
                            >
                                {studentsNoProgress.total_count}
                            </Badge>
                        ) : (
                            <Badge variant='outline'>...</Badge>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
