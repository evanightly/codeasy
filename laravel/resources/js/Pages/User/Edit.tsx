import { FilePondUploader } from '@/Components/FilePondUploader';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/UI/avatar';
import { Button } from '@/Components/UI/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/card';
import { Checkbox } from '@/Components/UI/checkbox';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/Components/UI/form';
import { Input } from '@/Components/UI/input';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { roleServiceHook } from '@/Services/roleServiceHook';
import { userServiceHook } from '@/Services/userServiceHook';
import { ROUTES } from '@/Support/Constants/routes';
import { UserResource } from '@/Support/Interfaces/Resources';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

interface Props {
    data: UserResource;
}

export default function Edit({ data: user }: Props) {
    const { t } = useLaravelReactI18n();
    const updateMutation = userServiceHook.useUpdate();
    const { data: roles, isLoading } = roleServiceHook.useGetAll();
    const [profileImage, setProfileImage] = useState<File | null>(null);

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((part) => part[0])
            .join('')
            .toUpperCase();
    };

    const formSchema = z
        .object({
            name: z.string().min(1, t('pages.user.common.validations.name.required')),
            username: z.string().min(1, t('pages.user.common.validations.username.required')),
            email: z
                .string()
                .email(t('pages.user.common.validations.email.invalid'))
                .min(1, t('pages.user.common.validations.email.required')),
            password: z
                .string()
                .min(6, t('pages.user.common.validations.password.min'))
                .or(z.literal('')),
            password_confirmation: z.string().or(z.literal('')),
            role_ids: z.array(z.number()).default([]),
        })
        .refine(
            (data) => {
                if (data.password && data.password.length > 0) {
                    return data.password === data.password_confirmation;
                }
                return true;
            },
            {
                message: t('pages.user.common.validations.password_confirmation.match'),
                path: ['password_confirmation'],
            },
        );

    type FormData = z.infer<typeof formSchema>;

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: user.name || '',
            username: user.username || '',
            email: user.email || '',
            password: '',
            password_confirmation: '',
            role_ids: user.roles?.map((r) => (typeof r === 'number' ? r : r.id)) || [],
        },
    });

    const handleSubmit = async (values: FormData) => {
        const data: Record<string, any> = {
            name: values.name,
            username: values.username,
            email: values.email,
            role_ids: values.role_ids,
        };

        if (values.password && values.password.length > 0) {
            data.password = values.password;
            data.password_confirmation = values.password_confirmation;
        }

        // Create FormData if there's a profile image
        if (profileImage) {
            const formData = new FormData();
            Object.keys(data).forEach((key) => {
                if (Array.isArray(data[key])) {
                    data[key].forEach((value: any) => {
                        formData.append(`${key}[]`, value);
                    });
                } else {
                    formData.append(key, data[key]);
                }
            });
            formData.append('profile_image', profileImage);

            toast.promise(updateMutation.mutateAsync({ id: user.id, data: formData }), {
                loading: t('pages.user.common.messages.pending.update'),
                success: () => {
                    router.visit(route(`${ROUTES.USERS}.index`));
                    return t('pages.user.common.messages.success.update');
                },
                error: t('pages.user.common.messages.error.update'),
            });
        } else {
            // Regular data update
            toast.promise(updateMutation.mutateAsync({ id: user.id, data }), {
                loading: t('pages.user.common.messages.pending.update'),
                success: () => {
                    router.visit(route(`${ROUTES.USERS}.index`));
                    return t('pages.user.common.messages.success.update');
                },
                error: t('pages.user.common.messages.error.update'),
            });
        }
    };

    return (
        <AuthenticatedLayout title={t('pages.user.edit.title', { name: user?.name ?? '' })}>
            <Card>
                <CardHeader>
                    <CardTitle>{t('pages.user.edit.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='mb-6 flex flex-col items-center gap-4 md:flex-row'>
                        <div className='space-y-4'>
                            <Avatar className='h-24 w-24'>
                                {user.profile_image ? (
                                    <AvatarImage src={user.profile_image_url} alt={user.name} />
                                ) : (
                                    <AvatarFallback>{getInitials(user?.name ?? '')}</AvatarFallback>
                                )}
                            </Avatar>
                        </div>

                        <div className='w-full max-w-sm'>
                            <FilePondUploader
                                value={profileImage}
                                onChange={setProfileImage}
                                maxFileSize='1MB'
                                labelIdle={t('pages.user.common.fields.profile_image')}
                                className='mb-1'
                                acceptedFileTypes={['image/png', 'image/jpeg', 'image/jpg']}
                            />
                            <p className='mt-1 text-xs text-gray-500'>
                                {t('pages.profile.upload.hint')}
                            </p>
                        </div>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
                            <FormField
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('pages.user.common.fields.name')}</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder={t(
                                                    'pages.user.common.placeholders.name',
                                                )}
                                                {...field}
                                            />
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
                                            {t('pages.user.common.fields.username')}
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder={t(
                                                    'pages.user.common.placeholders.username',
                                                )}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                                name='username'
                                control={form.control}
                            />

                            <FormField
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('pages.user.common.fields.email')}</FormLabel>
                                        <FormControl>
                                            <Input
                                                type='email'
                                                placeholder={t(
                                                    'pages.user.common.placeholders.email',
                                                )}
                                                {...field}
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
                                            {t('pages.user.common.fields.password')}
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type='password'
                                                placeholder={t(
                                                    'pages.user.common.placeholders.password',
                                                )}
                                                {...field}
                                                value={field.value ?? ''}
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
                                            {t('pages.user.common.fields.password_confirmation')}
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type='password'
                                                placeholder={t(
                                                    'pages.user.common.placeholders.password_confirmation',
                                                )}
                                                {...field}
                                                value={field.value ?? ''}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                                name='password_confirmation'
                                control={form.control}
                            />

                            <div className='space-y-4'>
                                <h3 className='text-lg font-medium'>
                                    {t('pages.user.common.fields.roles')}
                                </h3>
                                {isLoading ? (
                                    <p>{t('action.loading')}</p>
                                ) : (
                                    <FormField
                                        render={({ field }) => (
                                            <div className='grid grid-cols-2 gap-2'>
                                                {roles?.data?.map((role) => (
                                                    <div
                                                        key={role.id}
                                                        className='flex items-center gap-2'
                                                    >
                                                        <Checkbox
                                                            onCheckedChange={(checked) => {
                                                                if (checked) {
                                                                    field.onChange([
                                                                        ...field.value,
                                                                        role.id,
                                                                    ]);
                                                                } else {
                                                                    field.onChange(
                                                                        field.value.filter(
                                                                            (id) => id !== role.id,
                                                                        ),
                                                                    );
                                                                }
                                                            }}
                                                            id={`role-${role.id}`}
                                                            checked={field.value.includes(role.id)}
                                                        />
                                                        <label htmlFor={`role-${role.id}`}>
                                                            {role.name}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        name='role_ids'
                                        control={form.control}
                                    />
                                )}
                            </div>

                            <Button
                                variant='update'
                                type='submit'
                                loading={updateMutation.isPending}
                                disabled={updateMutation.isPending}
                            >
                                {t('pages.user.edit.buttons.update')}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </AuthenticatedLayout>
    );
}
