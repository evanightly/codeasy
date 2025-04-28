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
import { SchoolResource } from '@/Support/Interfaces/Resources';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, usePage } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

export default function Create() {
    const { teachedSchools, roles, administeredSchools } = usePage().props.auth.user;
    const { t } = useLaravelReactI18n();
    const createMutation = classRoomServiceHook.useCreate();
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
            name: '',
            description: '',
            grade: '',
            year: new Date().getFullYear().toString(),
            active: true,
        },
    });

    const handleSubmit = async (values: z.infer<typeof formSchema>) => {
        toast.promise(
            createMutation.mutateAsync({
                data: {
                    ...values,
                    school_id: parseInt(values.school_id),
                    grade: parseInt(values.grade),
                    year: parseInt(values.year),
                },
            }),
            {
                loading: t('pages.classroom.common.messages.pending.create'),
                success: () => {
                    router.visit(route(`${ROUTES.CLASS_ROOMS}.index`));
                    return t('pages.classroom.common.messages.success.create');
                },
                error: t('pages.classroom.common.messages.error.create'),
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

                    if (roles.includes(RoleEnum.SCHOOL_ADMIN)) {
                        return {
                            id: administeredSchools,
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
        <AuthenticatedLayout title={t('pages.classroom.create.title')}>
            <Card>
                <CardHeader>
                    <CardTitle>{t('pages.classroom.create.title')}</CardTitle>
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
                                            <GenericDataSelector
                                                setSelectedData={(school) => {
                                                    field.onChange(school?.toString() ?? '');
                                                }}
                                                selectedDataId={
                                                    field.value ? parseInt(field.value) : undefined
                                                }
                                                renderItem={(school: SchoolResource) =>
                                                    school?.name ?? ''
                                                }
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

                            <div className='grid grid-cols-2 gap-4'>
                                <FormField
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                {t('pages.classroom.common.fields.grade')}
                                            </FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
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
                                loading={createMutation.isPending}
                                disabled={createMutation.isPending}
                            >
                                {t('pages.classroom.create.buttons.create')}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </AuthenticatedLayout>
    );
}
