import { FilePondUploader } from '@/Components/FilePondUploader';
import { Alert, AlertDescription, AlertTitle } from '@/Components/UI/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/UI/avatar';
import { Button } from '@/Components/UI/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/Components/UI/form';
import { Input } from '@/Components/UI/input';
import { UserResource } from '@/Support/Interfaces/Resources';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, usePage } from '@inertiajs/react';
import axios from 'axios';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

interface UpdateProfileInformationFormProps {
    user: UserResource;
    mustVerifyEmail: boolean;
    status?: string;
}

export default function UpdateProfileInformationForm({
    mustVerifyEmail,
    status,
}: UpdateProfileInformationFormProps) {
    const {
        auth: { user },
    } = usePage().props;
    const { t } = useLaravelReactI18n();
    const [loading, setLoading] = useState(false);
    const [profileImage, setProfileImage] = useState<File | null>(null);

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((part) => part[0])
            .join('')
            .toUpperCase();
    };

    const formSchema = z.object({
        name: z.string().min(1, t('pages.profile.validations.name.required')),
        username: z.string().min(1, t('pages.profile.validations.username.required')),
        email: z
            .string()
            .email(t('pages.profile.validations.email.invalid'))
            .min(1, t('pages.profile.validations.email.required')),
    });

    type FormData = z.infer<typeof formSchema>;

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: user.name || '',
            username: user.username || '',
            email: user.email || '',
        },
    });

    const onSubmit = async (values: FormData) => {
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('name', values.name);
            formData.append('username', values.username);
            formData.append('email', values.email);
            formData.append('_method', 'PUT');

            // Add image if exists
            if (profileImage) {
                formData.append('profile_image', profileImage);
            }

            await axios.post(route('profile.update'), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            toast.success(t('pages.profile.messages.success.update'));

            if (values.email !== user.email) {
                // Redirect to verification notice if email changed
                window.location.href = route('verification.notice');
            } else {
                // Reload page to show updated info
                window.location.reload();
            }
        } catch (error: any) {
            console.error(error);

            if (error.response?.data?.errors) {
                // Set form errors
                Object.entries(error.response.data.errors).forEach(
                    ([key, errorMessages]: [string, any]) => {
                        form.setError(key as any, {
                            type: 'manual',
                            message: errorMessages[0],
                        });
                    },
                );
            } else {
                toast.error(t('pages.profile.messages.error.update'));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='space-y-6'>
            <div>
                <h2 className='text-lg font-medium'>{t('pages.profile.sections.information')}</h2>
                <p className='mt-1 text-sm'>{t('pages.profile.descriptions.information')}</p>
            </div>

            <div className='flex flex-col items-center gap-4 md:flex-row'>
                <div className='space-y-4'>
                    <Avatar className='h-28 w-28'>
                        {user.profile_image ? (
                            <AvatarImage
                                src={user.profile_image_url}
                                className='object-cover'
                                alt={user.name}
                            />
                        ) : (
                            <AvatarFallback className='text-lg'>
                                {getInitials(user?.name ?? '')}
                            </AvatarFallback>
                        )}
                    </Avatar>
                </div>

                <div className='w-full max-w-sm'>
                    <FilePondUploader
                        value={profileImage}
                        onChange={setProfileImage}
                        maxFileSize='1MB'
                        labelIdle={t('pages.profile.upload.label')}
                        className='mb-1'
                        acceptedFileTypes={['image/png', 'image/jpeg', 'image/jpg']}
                    />
                    <p className='mt-1 text-xs text-gray-500'>{t('pages.profile.upload.hint')}</p>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                    <FormField
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('pages.profile.fields.name')}</FormLabel>
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
                                <FormLabel>{t('pages.profile.fields.username')}</FormLabel>
                                <FormControl>
                                    <Input {...field} />
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
                                <FormLabel>{t('pages.profile.fields.email')}</FormLabel>
                                <FormControl>
                                    <Input type='email' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        name='email'
                        control={form.control}
                    />

                    {mustVerifyEmail && user.email_verified_at === null && (
                        <Alert variant='warning'>
                            <AlertTitle>{t('pages.profile.verification.title')}</AlertTitle>
                            <AlertDescription className='flex flex-col gap-2'>
                                {t('pages.profile.verification.message')}
                                <Link
                                    method='post'
                                    href={route('verification.send')}
                                    className='font-medium text-primary hover:underline'
                                    as='button'
                                >
                                    {t('pages.profile.verification.resend_link')}
                                </Link>
                            </AlertDescription>
                        </Alert>
                    )}

                    {status === 'verification-link-sent' && (
                        <Alert>
                            <AlertDescription>
                                {t('pages.profile.verification.sent')}
                            </AlertDescription>
                        </Alert>
                    )}

                    <Button type='submit' loading={loading} disabled={loading}>
                        {t('pages.profile.buttons.save')}
                    </Button>
                </form>
            </Form>
        </div>
    );
}
