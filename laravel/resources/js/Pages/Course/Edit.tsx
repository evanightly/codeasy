import GenericDataSelector from '@/Components/GenericDataSelector';
import { Button } from '@/Components/UI/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/card';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/Components/UI/form';
import { Input } from '@/Components/UI/input';
import { Switch } from '@/Components/UI/switch';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { classRoomServiceHook } from '@/Services/classRoomServiceHook';
import { courseServiceHook } from '@/Services/courseServiceHook';
import { ROUTES } from '@/Support/Constants/routes';
import { ServiceFilterOptions } from '@/Support/Interfaces/Others';
import { ClassRoomResource, CourseResource } from '@/Support/Interfaces/Resources';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, usePage } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

interface Props {
    data: { data: CourseResource };
}

export default function Edit({ data: { data } }: Props) {
    const { teachedSchools } = usePage().props.auth.user;
    const { t } = useLaravelReactI18n();
    const updateMutation = courseServiceHook.useUpdate();

    const formSchema = z.object({
        class_room_id: z
            .string()
            .min(1, t('pages.course.common.validations.class_room_id.required')),
        teacher_id: z.string().min(1, t('pages.course.common.validations.teacher_id.required')),
        name: z.string().min(1, t('pages.course.common.validations.name.required')),
        description: z.string().optional(),
        active: z.boolean().default(true),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: data?.name || '',
            description: data?.description || '',
            class_room_id: data?.class_room_id?.toString() || '',
            teacher_id: data?.teacher_id?.toString() || '',
            active: data?.active ?? true,
        },
    });

    useEffect(() => {
        if (data) {
            form.reset({
                name: data?.name || '',
                description: data?.description || '',
                class_room_id: data?.class_room_id?.toString(),
                teacher_id: data?.teacher_id?.toString(),
                active: data?.active ?? true,
            });
        }
    }, [data]);

    const handleSubmit = async (values: z.infer<typeof formSchema>) => {
        toast.promise(
            updateMutation.mutateAsync({
                id: data.id,
                data: {
                    ...values,
                    class_room_id: parseInt(values.class_room_id),
                    teacher_id: parseInt(values.teacher_id),
                },
            }),
            {
                loading: t('pages.course.common.messages.pending.update'),
                success: () => {
                    router.visit(route(`${ROUTES.COURSES}.index`));
                    return t('pages.course.common.messages.success.update');
                },
                error: t('pages.course.common.messages.error.update'),
            },
        );
    };

    const fetchClassRooms = async (filters: ServiceFilterOptions) => {
        const response = await classRoomServiceHook.getAll({
            filters: {
                ...filters,
                column_filters: {
                    active: 1,
                    school_id: teachedSchools,
                },
                relations: 'school',
                class_room_resource: 'id,name,school_id,school',
            },
        });
        return response.data;
    };

    return (
        <AuthenticatedLayout title={t('pages.course.edit.title')}>
            <Card>
                <CardHeader>
                    <CardTitle>{t('pages.course.edit.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
                            <FormField
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {t('pages.course.common.fields.classroom')}
                                        </FormLabel>
                                        <FormControl>
                                            <GenericDataSelector<ClassRoomResource>
                                                setSelectedData={(classRoom) =>
                                                    field.onChange(classRoom?.toString() ?? '')
                                                }
                                                selectedDataId={
                                                    field.value ? parseInt(field.value) : undefined
                                                }
                                                renderItem={(classRoom) =>
                                                    `${classRoom?.name} (${classRoom?.school?.name})`
                                                }
                                                placeholder={t(
                                                    'pages.course.common.placeholders.classroom',
                                                )}
                                                fetchData={fetchClassRooms}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                                name='class_room_id'
                                control={form.control}
                            />

                            {/* Name field */}
                            <FormField
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {t('pages.course.common.fields.name')}
                                        </FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                                name='name'
                                control={form.control}
                            />

                            {/* Description field */}
                            <FormField
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {t('pages.course.common.fields.description')}
                                        </FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                                name='description'
                                control={form.control}
                            />

                            {/* Active switch */}
                            <FormField
                                render={({ field }) => (
                                    <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                                        <div className='space-y-0.5'>
                                            <FormLabel className='text-base'>
                                                {t('pages.course.common.fields.active')}
                                            </FormLabel>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                onCheckedChange={field.onChange}
                                                checked={field.value}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                                name='active'
                                control={form.control}
                            />

                            <Button
                                type='submit'
                                loading={updateMutation.isPending}
                                disabled={updateMutation.isPending}
                            >
                                {t('pages.course.edit.buttons.update')}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </AuthenticatedLayout>
    );
}
