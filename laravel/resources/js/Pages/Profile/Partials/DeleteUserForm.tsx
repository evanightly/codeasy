import { Alert, AlertDescription } from '@/Components/UI/alert';
import { Button } from '@/Components/UI/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/Components/UI/dialog';
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
import { router } from '@inertiajs/react';
import axios from 'axios';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

export default function DeleteUserForm() {
    const { t } = useLaravelReactI18n();
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const formSchema = z.object({
        password: z.string().min(1, t('pages.profile.validations.password.required_for_deletion')),
    });

    type FormData = z.infer<typeof formSchema>;

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            password: '',
        },
    });

    const onSubmit = async (values: FormData) => {
        setLoading(true);

        try {
            await axios.delete(route('profile.destroy'), {
                data: values,
            });

            toast.success(t('pages.profile.messages.success.delete'));

            // Redirect to home page
            router.visit(route('welcome'));
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
                toast.error(t('pages.profile.messages.error.delete'));
            }

            setLoading(false);
        }
    };

    return (
        <div className='space-y-6'>
            <div>
                <h2 className='text-lg font-medium'>
                    {t('pages.profile.sections.delete_account')}
                </h2>
                <p className='mt-1 text-sm'>{t('pages.profile.descriptions.delete_account')}</p>
            </div>

            <Alert variant='destructive'>
                <AlertDescription>{t('pages.profile.warnings.delete_account')}</AlertDescription>
            </Alert>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant='destructive'>
                        {t('pages.profile.buttons.delete_account')}
                    </Button>
                </DialogTrigger>

                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('pages.profile.delete_dialog.title')}</DialogTitle>
                        <DialogDescription>
                            {t('pages.profile.delete_dialog.description')}
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                            <FormField
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('pages.profile.fields.password')}</FormLabel>
                                        <FormControl>
                                            <Input
                                                type='password'
                                                {...field}
                                                autoComplete='current-password'
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                                name='password'
                                control={form.control}
                            />

                            <DialogFooter>
                                <Button
                                    variant='outline'
                                    type='button'
                                    onClick={() => setOpen(false)}
                                >
                                    {t('pages.profile.buttons.cancel')}
                                </Button>
                                <Button
                                    variant='destructive'
                                    type='submit'
                                    loading={loading}
                                    disabled={loading}
                                >
                                    {t('pages.profile.buttons.confirm_delete')}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
