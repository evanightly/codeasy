import { Button } from '@/Components/UI/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/Components/UI/dialog';
import { studentScoreServiceHook } from '@/Services/studentScoreServiceHook';
import { LearningMaterialResource } from '@/Support/Interfaces/Resources';
import { router } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Props {
    material: LearningMaterialResource;
    hasCompletedQuestions: boolean;
    firstQuestionId?: number;
}

export default function ReAttemptAllDialog({
    material,
    hasCompletedQuestions,
    firstQuestionId,
}: Props) {
    const { t } = useLaravelReactI18n();
    const [open, setOpen] = useState(false);

    const allowReAttemptAllMutation = studentScoreServiceHook.useAllowReAttemptAll();

    const handleReAttemptAll = async () => {
        if (!firstQuestionId) {
            toast.error(t('pages.student_questions.workspace.allow_reattempt_all.error'));
            return;
        }

        try {
            await allowReAttemptAllMutation.mutateAsync({
                id: firstQuestionId, // We need any question ID from the material for the route
                material_id: material.id,
            });

            toast.success(t('pages.student_questions.workspace.allow_reattempt_all.success'));
            setOpen(false);

            // Refresh the page to show updated progress
            router.reload();
        } catch (res: any) {
            toast.error(res.response.data.error);
        }
    };

    // Don't show the button if there are no completed questions
    if (!hasCompletedQuestions) {
        return null;
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant='outline' size='sm' className='gap-2'>
                    <RotateCcw className='h-4 w-4' />
                    {t('pages.student_questions.workspace.allow_reattempt_all.button')}
                </Button>
            </DialogTrigger>
            <DialogContent className='space-y-3 sm:max-w-md'>
                <DialogHeader>
                    <DialogTitle>
                        {t('pages.student_questions.workspace.allow_reattempt_all.dialog.title')}
                    </DialogTitle>
                    <DialogDescription>
                        {t(
                            'pages.student_questions.workspace.allow_reattempt_all.dialog.description',
                        )}
                    </DialogDescription>
                </DialogHeader>

                <div className='rounded-lg border border-amber-200 bg-amber-50 p-3'>
                    <h4 className='mb-1 font-medium text-amber-800'>
                        {t(
                            'pages.student_questions.workspace.allow_reattempt_all.dialog.warning_title',
                        )}
                    </h4>
                    <p className='text-sm text-amber-700'>
                        {t(
                            'pages.student_questions.workspace.allow_reattempt_all.dialog.warning_description',
                        )}
                    </p>
                </div>

                <div className='flex justify-end gap-2'>
                    <Button variant='outline' onClick={() => setOpen(false)}>
                        {t('pages.student_questions.workspace.allow_reattempt_all.dialog.cancel')}
                    </Button>
                    <Button
                        onClick={handleReAttemptAll}
                        disabled={allowReAttemptAllMutation.isPending}
                        className='gap-1'
                    >
                        {allowReAttemptAllMutation.isPending ? (
                            <>Processing...</>
                        ) : (
                            <>
                                <RotateCcw className='h-4 w-4' />
                                {t(
                                    'pages.student_questions.workspace.allow_reattempt_all.dialog.confirm',
                                )}
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
