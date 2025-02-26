import { Button } from '@/Components/UI/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/card';
import { Form } from '@/Components/UI/form';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { classRoomServiceHook } from '@/Services/classRoomServiceHook';
import { schoolServiceHook } from '@/Services/schoolServiceHook';
import { ROUTES } from '@/Support/Constants/routes';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

interface Props {
    id: number;
}

export default function Edit({ id }: Props) {
    const { t } = useLaravelReactI18n();
    const updateMutation = classRoomServiceHook.useUpdate();
    const { data: classroom } = classRoomServiceHook.useGet({ id });
    const { data: schools } = schoolServiceHook.useGetAll({
        filters: {
            page_size: 'all',
        },
    });

    const formSchema = z.object({
        school_id: z.string().min(1, t('pages.classroom.common.validations.school_id.required')),
        name: z.string().min(1, t('pages.classroom.common.validations.name.required')),
        description: z.string().optional(),
        grade: z.string().min(1, t('pages.classroom.common.validations.grade.required')),
        year: z.string().min(1, t('pages.classroom.common.validations.year.required')),
        active: z.boolean().default(true),
        student_ids: z.array(z.number()).default([]),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: classroom?.name || '',
            description: classroom?.description || '',
            school_id: classroom?.school_id?.toString() || '',
            grade: classroom?.grade?.toString() || '',
            year: classroom?.year?.toString() || '',
            active: classroom?.active ?? true,
            student_ids: classroom?.students?.map((student) => student.id) || [],
        },
    });

    useEffect(() => {
        if (classroom) {
            form.reset({
                name: classroom.name,
                description: classroom.description,
                school_id: classroom?.school_id?.toString(),
                grade: classroom?.grade?.toString(),
                year: classroom?.year?.toString(),
                active: classroom.active,
                student_ids: classroom?.students?.map((student) => student.id) || [],
            });
        }
    }, [classroom]);

    const handleSubmit = async (values: z.infer<typeof formSchema>) => {
        toast.promise(
            updateMutation.mutateAsync({
                id,
                data: {
                    ...values,
                    school_id: parseInt(values.school_id),
                    grade: parseInt(values.grade),
                    year: parseInt(values.year),
                },
            }),
            {
                loading: t('pages.classroom.common.messages.pending.update'),
                success: () => {
                    router.visit(route(`${ROUTES.CLASS_ROOMS}.index`));
                    return t('pages.classroom.common.messages.success.update');
                },
                error: t('pages.classroom.common.messages.error.update'),
            },
        );
    };

    return (
        <AuthenticatedLayout title={t('pages.classroom.edit.title')}>
            <Card>
                <CardHeader>
                    <CardTitle>{t('pages.classroom.edit.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
                            {/* Same form fields as Create.tsx */}
                            {/* ... School select field ... */}
                            {/* ... Name field ... */}
                            {/* ... Description field ... */}
                            {/* ... Grade and Year fields ... */}
                            {/* ... Active switch ... */}
                            {/* ... Student selection ... */}

                            <Button type='submit' disabled={updateMutation.isPending}>
                                {t('pages.classroom.edit.buttons.update')}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </AuthenticatedLayout>
    );
}
