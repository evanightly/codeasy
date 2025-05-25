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
import WorkspaceLockTimeoutField from '@/Components/WorkspaceLockTimeoutField';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { classRoomServiceHook } from '@/Services/classRoomServiceHook';
import { courseServiceHook } from '@/Services/courseServiceHook';
import { ROUTES } from '@/Support/Constants/routes';
import { ServiceFilterOptions } from '@/Support/Interfaces/Others';
import { ClassRoomResource } from '@/Support/Interfaces/Resources';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, usePage } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

export default function Create() {
    const { id, teachedSchools } = usePage().props.auth.user;
    const { t } = useLaravelReactI18n();
    const createMutation = courseServiceHook.useCreate();
    const formSchema = z.object({
        class_room_id: z
            .string()
            .min(1, t('pages.course.common.validations.class_room_id.required')),
        teacher_id: z.string().min(1, t('pages.course.common.validations.teacher_id.required')),
        name: z.string().min(1, t('pages.course.common.validations.name.required')),
        description: z.string().optional(),
        active: z.boolean().default(true),
        workspace_lock_timeout_days: z.number().min(0).default(7),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            description: '',
            teacher_id: id.toString(),
            class_room_id: '',
            active: true,
            workspace_lock_timeout_days: 7,
        },
    });

    const handleSubmit = async (values: z.infer<typeof formSchema>) => {
        toast.promise(
            createMutation.mutateAsync({
                data: {
                    ...values,
                    class_room_id: parseInt(values.class_room_id),
                    teacher_id: parseInt(values.teacher_id),
                },
            }),
            {
                loading: t('pages.course.common.messages.pending.create'),
                success: () => {
                    router.visit(route(`${ROUTES.COURSES}.index`));
                    return t('pages.course.common.messages.success.create');
                },
                error: t('pages.course.common.messages.error.create'),
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
        <AuthenticatedLayout title={t('pages.course.create.title')}>
            <Card>
                <CardHeader>
                    <CardTitle>{t('pages.course.create.title')}</CardTitle>
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
                                                setSelectedData={(classRoom) => {
                                                    field.onChange(classRoom?.toString() ?? '');
                                                }}
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

                            {/* Workspace Lock Timeout field */}
                            <FormField
                                render={({ field }) => (
                                    <WorkspaceLockTimeoutField
                                        value={field.value}
                                        onChange={field.onChange}
                                    />
                                )}
                                name='workspace_lock_timeout_days'
                                control={form.control}
                            />

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
                                loading={createMutation.isPending}
                                disabled={createMutation.isPending}
                            >
                                {t('pages.course.create.buttons.create')}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </AuthenticatedLayout>
    );
}
