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
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

export default function UpdatePasswordForm() {
    const { t } = useLaravelReactI18n();
    const [loading, setLoading] = useState(false);

    const formSchema = z
        .object({
            current_password: z
                .string()
                .min(1, t('pages.profile.validations.current_password.required')),
            password: z.string().min(8, t('pages.profile.validations.password.min')),
            password_confirmation: z
                .string()
                .min(1, t('pages.profile.validations.password_confirmation.required')),
        })
        .refine((data) => data.password === data.password_confirmation, {
            message: t('pages.profile.validations.password_confirmation.match'),
            path: ['password_confirmation'],
        });

    type FormData = z.infer<typeof formSchema>;

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            current_password: '',
            password: '',
            password_confirmation: '',
        },
    });

    const onSubmit = async (values: FormData) => {
        setLoading(true);

        try {
            await axios.put(route('password.update'), values);
            toast.success(t('pages.profile.messages.success.password'));

            // Reset form
            form.reset();
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
                toast.error(t('pages.profile.messages.error.password'));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='space-y-6'>
            <div>
                <h2 className='text-lg font-medium'>{t('pages.profile.sections.password')}</h2>
                <p className='mt-1 text-sm'>{t('pages.profile.descriptions.password')}</p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                    <FormField
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('pages.profile.fields.current_password')}</FormLabel>
                                <FormControl>
                                    <Input type='password' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        name='current_password'
                        control={form.control}
                    />

                    <FormField
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('pages.profile.fields.new_password')}</FormLabel>
                                <FormControl>
                                    <Input type='password' {...field} />
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
                                <FormLabel>{t('pages.profile.fields.confirm_password')}</FormLabel>
                                <FormControl>
                                    <Input type='password' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        name='password_confirmation'
                        control={form.control}
                    />

                    <Button type='submit' loading={loading} disabled={loading}>
                        {t('pages.profile.buttons.save')}
                    </Button>
                </form>
            </Form>
        </div>
    );
}
