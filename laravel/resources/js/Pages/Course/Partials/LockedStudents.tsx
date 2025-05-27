import { Alert, AlertDescription, AlertTitle } from '@/Components/UI/alert';
import { Badge } from '@/Components/UI/badge';
import { Button } from '@/Components/UI/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/UI/table';
import { studentScoreServiceHook } from '@/Services/studentScoreServiceHook';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { Clock, Lock, Unlock, User } from 'lucide-react';

interface Props {
    courseId: number;
}

export function LockedStudents({ courseId }: Props) {
    const { t } = useLaravelReactI18n();

    // Service hooks
    const getLockedStudentsQuery = studentScoreServiceHook.useGetLockedStudents({
        course_id: courseId,
    });
    const unlockWorkspaceMutation = studentScoreServiceHook.useUnlockWorkspace();

    const lockedStudents = getLockedStudentsQuery.data || [];

    const handleUnlockWorkspace = async (studentScoreId: number) => {
        try {
            await unlockWorkspaceMutation.mutateAsync({ id: studentScoreId });
            // Refresh the list after unlock
            getLockedStudentsQuery.refetch();
        } catch (error) {
            console.error('Error unlocking workspace:', error);
        }
    };

    const formatTimeUntilUnlock = (unlockAt: string | null) => {
        if (!unlockAt) return null;

        const unlockTime = new Date(unlockAt).getTime();
        const currentTime = Date.now();
        const diff = unlockTime - currentTime;

        if (diff <= 0) return t('pages.course.show.locked_students.unlock_now');

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) return `${days}d ${hours}h ${minutes}m`;
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    const getBadgeVariant = (canReattempt: boolean) => {
        return canReattempt ? 'destructive' : 'secondary';
    };

    if (getLockedStudentsQuery.isPending) {
        return (
            <Card>
                <CardContent className='p-6'>
                    <div className='flex items-center justify-center'>
                        <div className='text-muted-foreground'>
                            {t('pages.course.show.locked_students.loading')}
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className='space-y-6'>
            {/* Header */}
            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                        <Lock className='h-5 w-5' />
                        {t('pages.course.show.locked_students.title')}
                    </CardTitle>
                    <AlertDescription>
                        {t('pages.course.show.locked_students.description')}
                    </AlertDescription>
                </CardHeader>
            </Card>

            {/* Locked Students List */}
            {lockedStudents.length === 0 ? (
                <Alert>
                    <User className='h-4 w-4' />
                    <AlertTitle>
                        {t('pages.course.show.locked_students.no_locked_students')}
                    </AlertTitle>
                    <AlertDescription>
                        {t('pages.course.show.locked_students.no_locked_students_description')}
                    </AlertDescription>
                </Alert>
            ) : (
                <Card>
                    <CardContent className='p-0'>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>
                                        {t('pages.course.show.locked_students.columns.student')}
                                    </TableHead>
                                    <TableHead>
                                        {t('pages.course.show.locked_students.columns.material')}
                                    </TableHead>
                                    <TableHead>
                                        {t('pages.course.show.locked_students.columns.locked_at')}
                                    </TableHead>
                                    <TableHead>
                                        {t('pages.course.show.locked_students.columns.unlock_at')}
                                    </TableHead>
                                    <TableHead>
                                        {t('pages.course.show.locked_students.columns.status')}
                                    </TableHead>
                                    <TableHead>
                                        {t('pages.course.show.locked_students.columns.actions')}
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {lockedStudents.map((studentScore: any) => (
                                    <TableRow key={studentScore.id}>
                                        <TableCell>
                                            <div className='flex items-center gap-2'>
                                                <User className='h-4 w-4 text-muted-foreground' />
                                                {studentScore.user?.name || 'Unknown Student'}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {studentScore.learning_material_question
                                                ?.learning_material?.title || 'Unknown Material'}
                                        </TableCell>
                                        <TableCell>
                                            <div className='flex items-center gap-2'>
                                                <Clock className='h-4 w-4 text-muted-foreground' />
                                                {studentScore.workspace_locked_at
                                                    ? new Date(
                                                          studentScore.workspace_locked_at,
                                                      ).toLocaleString()
                                                    : '-'}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {studentScore.workspace_unlock_at ? (
                                                <div className='flex items-center gap-2'>
                                                    <Clock className='h-4 w-4 text-muted-foreground' />
                                                    <span className='text-sm'>
                                                        {formatTimeUntilUnlock(
                                                            studentScore.workspace_unlock_at,
                                                        )}
                                                    </span>
                                                </div>
                                            ) : (
                                                '-'
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={getBadgeVariant(
                                                    studentScore.can_reattempt || false,
                                                )}
                                            >
                                                {studentScore.can_reattempt
                                                    ? t(
                                                          'pages.course.show.locked_students.status.can_reattempt',
                                                      )
                                                    : t(
                                                          'pages.course.show.locked_students.status.locked',
                                                      )}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant='outline'
                                                size='sm'
                                                onClick={() =>
                                                    handleUnlockWorkspace(studentScore.id)
                                                }
                                                disabled={unlockWorkspaceMutation.isPending}
                                                className='gap-2'
                                            >
                                                <Unlock className='h-4 w-4' />
                                                {t(
                                                    'pages.course.show.locked_students.actions.unlock',
                                                )}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
