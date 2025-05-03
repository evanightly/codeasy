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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/UI/select';
import { Switch } from '@/Components/UI/switch';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { classRoomServiceHook } from '@/Services/classRoomServiceHook';
import { schoolServiceHook } from '@/Services/schoolServiceHook';
import { ROUTES } from '@/Support/Constants/routes';
import { RoleEnum } from '@/Support/Enums/roleEnum';
import { ServiceFilterOptions } from '@/Support/Interfaces/Others';
import { ClassRoomResource, SchoolResource } from '@/Support/Interfaces/Resources';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, usePage } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

interface Props {
    data: ClassRoomResource;
}

export default function Edit({ data }: Props) {
    const { t } = useLaravelReactI18n();
    const { roles, teachedSchools } = usePage().props.auth.user;
    const updateMutation = classRoomServiceHook.useUpdate();

    const formSchema = z.object({
        school_id: z.string().min(1, t('pages.classroom.common.validations.school_id.required')),
        name: z.string().min(1, t('pages.classroom.common.validations.name.required')),
        description: z.string().optional(),
        grade: z.string().min(1, t('pages.classroom.common.validations.grade.required')),
        year: z.string().min(1, t('pages.classroom.common.validations.year.required')),
        active: z.boolean().default(true),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: data?.name || '',
            description: data?.description || '',
            school_id: data?.school_id?.toString() || '',
            grade: data?.grade?.toString() || '',
            year: data?.year?.toString() || '',
            active: data?.active ?? true,
        },
    });

    useEffect(() => {
        if (data) {
            form.reset({
                name: data?.name || '',
                description: data?.description || '',
                school_id: data?.school_id?.toString(),
                grade: data?.grade?.toString(),
                year: data?.year?.toString(),
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

    const fetchSchools = async (filters: ServiceFilterOptions) => {
        const response = await schoolServiceHook.getAll({
            filters: {
                ...filters,
                column_filters: (() => {
                    // Single role logic
                    if (roles.includes(RoleEnum.TEACHER)) {
                        if (teachedSchools.length === 0) {
                            return {
                                id: -1,
                            };
                        }
                        return {
                            id: teachedSchools,
                            // , active: 1
                        };
                    }

                    return {
                        id: -1,
                    };
                })(),
            },
        });
        return response.data;
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
                            <FormField
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {t('pages.classroom.common.fields.school')}
                                        </FormLabel>
                                        <FormControl>
                                            <GenericDataSelector<SchoolResource>
                                                setSelectedData={(school) =>
                                                    field.onChange(school?.toString() ?? '')
                                                }
                                                selectedDataId={
                                                    field.value ? parseInt(field.value) : undefined
                                                }
                                                renderItem={(school) => school?.name ?? ''}
                                                placeholder={t(
                                                    'pages.classroom.common.placeholders.school',
                                                )}
                                                fetchData={fetchSchools}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                                name='school_id'
                                control={form.control}
                            />

                            {/* Name field */}
                            <FormField
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {t('pages.classroom.common.fields.name')}
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
                                            {t('pages.classroom.common.fields.description')}
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

                            {/* Grade and Year fields */}
                            <div className='grid grid-cols-2 gap-4'>
                                <FormField
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                {t('pages.classroom.common.fields.grade')}
                                            </FormLabel>
                                            <Select
                                                value={field.value}
                                                onValueChange={field.onChange}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue
                                                            placeholder={t(
                                                                'pages.classroom.common.placeholders.grade',
                                                            )}
                                                        />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {Array.from(
                                                        { length: 12 },
                                                        (_, i) => i + 1,
                                                    ).map((grade) => (
                                                        <SelectItem
                                                            value={grade.toString()}
                                                            key={grade}
                                                        >
                                                            {grade}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                    name='grade'
                                    control={form.control}
                                />

                                <FormField
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                {t('pages.classroom.common.fields.year')}
                                            </FormLabel>
                                            <FormControl>
                                                <Input type='number' {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                    name='year'
                                    control={form.control}
                                />
                            </div>

                            {/* Active switch */}
                            <FormField
                                render={({ field }) => (
                                    <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                                        <div className='space-y-0.5'>
                                            <FormLabel className='text-base'>
                                                {t('pages.classroom.common.fields.active')}
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
                                {t('pages.classroom.edit.buttons.update')}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </AuthenticatedLayout>
    );
}
