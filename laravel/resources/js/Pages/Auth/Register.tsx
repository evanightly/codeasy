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
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/UI/select';
import GuestLayout from '@/Layouts/GuestLayout';
import { authServiceHook } from '@/Services/authServiceHook';
import { schoolServiceHook } from '@/Services/schoolServiceHook';
import { ROUTES } from '@/Support/Constants/routes';
import { RoleEnum } from '@/Support/Enums/roleEnum';
import { ServiceFilterOptions } from '@/Support/Interfaces/Others';
import { SchoolResource } from '@/Support/Interfaces/Resources';
import { zodResolver } from '@hookform/resolvers/zod';
import { Head, Link, router } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

export default function Register() {
    const { t } = useLaravelReactI18n();
    const registerMutation = authServiceHook.useRegister();

    // Define form schema with Zod
    const formSchema = z
        .object({
            name: z.string().min(1, t('validation.required', { attribute: 'name' })),
            email: z
                .string()
                .min(1, t('validation.required', { attribute: 'email' }))
                .email(t('validation.email', { attribute: 'email' })),
            password: z
                .string()
                .min(8, t('validation.min.string', { attribute: 'password', min: 8 })),
            password_confirmation: z
                .string()
                .min(1, t('validation.required', { attribute: 'password confirmation' })),
            role: z.string().nullish(), // Make role nullable
            school_id: z.number().nullish(), // nullish allows both null and undefined
        })
        .refine((data) => data.password === data.password_confirmation, {
            message: t('validation.confirmed', { attribute: 'password' }),
            path: ['password_confirmation'],
        })
        .refine((data) => !(data.role === RoleEnum.TEACHER && !data.school_id), {
            message: t('validation.required_if', {
                attribute: 'school',
                other: 'role',
                value: RoleEnum.TEACHER,
            }),
            path: ['school_id'],
        });

    // Setup form with react-hook-form
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            password_confirmation: '',
            role: null, // Default to null instead of empty string
            school_id: null,
        },
    });

    // Watch role to show/hide school selector
    const selectedRole = form.watch('role');
    const showSchoolSelector = selectedRole === RoleEnum.TEACHER;

    // Reset school_id when role changes
    useEffect(() => {
        if (selectedRole !== RoleEnum.TEACHER) {
            form.setValue('school_id', null);
        }
    }, [selectedRole, form]);

    const handleSubmit = async (values: z.infer<typeof formSchema>) => {
        toast.promise(
            registerMutation.mutateAsync({
                data: values,
            }),
            {
                loading: t('pages.auth.register.messages.pending'),
                success: () => {
                    router.visit(route(`${ROUTES.DASHBOARD}.index`));
                    return t('pages.auth.register.messages.success');
                },
                error: (error) => {
                    // Handle specific validation errors
                    if (error.response?.data?.errors) {
                        Object.entries(error.response.data.errors).forEach(([key, messages]) => {
                            if (key in form.formState.errors) {
                                form.setError(key as any, {
                                    type: 'manual',
                                    message: Array.isArray(messages) ? messages[0] : messages,
                                });
                            }
                        });
                    }
                    return t('pages.auth.register.messages.error');
                },
            },
        );
    };

    const fetchSchools = async (filters: ServiceFilterOptions) => {
        const response = await schoolServiceHook.getAll({
            filters: {
                ...filters,
            },
        });
        return response.data;
    };

    const roles = Object.entries(RoleEnum).filter(
        // Filter out admin roles - only allow Teacher and Student registration
        ([_, value]) => value === RoleEnum.TEACHER || value === RoleEnum.STUDENT,
    );

    return (
        <GuestLayout>
            <Head title={t('pages.auth.register.title')} />
            <Card className='bg-background-2'>
                <CardHeader>
                    <CardTitle>{t('pages.auth.register.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
                            <FormField
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {t('pages.auth.register.fields.name')}
                                        </FormLabel>
                                        <FormControl>
                                            <Input {...field} autoFocus autoComplete='name' />
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
                                            {t('pages.auth.register.fields.email')}
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type='email'
                                                autoComplete='username'
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                                name='email'
                                control={form.control}
                            />

                            <FormField
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {t('pages.auth.register.fields.role')}
                                        </FormLabel>
                                        <Select
                                            value={field.value || ''} // Handle null value
                                            onValueChange={(value) => {
                                                // If the special "reset" value is selected
                                                if (value === 'reset') {
                                                    field.onChange(null); // Set to null instead of empty string
                                                    form.setValue('school_id', null);
                                                    return;
                                                }
                                                field.onChange(value || null); // Convert empty string to null if needed
                                            }}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue
                                                        placeholder={t(
                                                            'pages.auth.register.fields.select_role',
                                                        )}
                                                    />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectGroup>
                                                    {field.value && (
                                                        <SelectItem
                                                            value='reset'
                                                            className='font-medium text-destructive'
                                                        >
                                                            {t(
                                                                'pages.auth.register.fields.reset_role',
                                                            )}
                                                        </SelectItem>
                                                    )}
                                                    {roles.map(([key, value]) => (
                                                        <SelectItem value={value} key={key}>
                                                            {value}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                                name='role'
                                control={form.control}
                            />

                            {showSchoolSelector && (
                                <FormField
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                {t('pages.auth.register.fields.school')}
                                            </FormLabel>
                                            <FormControl>
                                                <GenericDataSelector<SchoolResource>
                                                    setSelectedData={(id) => field.onChange(id)}
                                                    selectedDataId={field.value}
                                                    renderItem={(item) => item?.name ?? ''}
                                                    placeholder={t(
                                                        'pages.auth.register.fields.select_school',
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
                            )}

                            <FormField
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {t('pages.auth.register.fields.password')}
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type='password'
                                                autoComplete='new-password'
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                                name='password'
                                control={form.control}
                            />

                            <FormField
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {t('pages.auth.register.fields.password_confirmation')}
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type='password'
                                                autoComplete='new-password'
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                                name='password_confirmation'
                                control={form.control}
                            />

                            <div className='flex items-center justify-end'>
                                <Link href={route(ROUTES.LOGIN)}>
                                    {t('pages.auth.register.fields.already_registered')}
                                </Link>

                                <Button
                                    type='submit'
                                    loading={registerMutation.isPending}
                                    disabled={registerMutation.isPending}
                                    className='ml-4'
                                >
                                    {t('pages.auth.register.buttons.register')}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </GuestLayout>
    );
}
