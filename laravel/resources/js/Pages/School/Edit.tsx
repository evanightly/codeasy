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
import { schoolServiceHook } from '@/Services/schoolServiceHook';
import { ROUTES } from '@/Support/Constants/routes';
import { SchoolResource } from '@/Support/Interfaces/Resources';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

interface Props {
    data: SchoolResource;
}

export default function Edit({ data: school }: Props) {
    const { t } = useLaravelReactI18n();

    const formSchema = z.object({
        name: z.string().min(1, t('pages.school.common.validations.name.required')),
        address: z.string().min(1, t('pages.school.common.validations.address.required')),
        city: z.string().optional(),
        state: z.string().optional(),
        zip: z.string().optional(),
        phone: z.string().optional(),
        email: z
            .string()
            .email(t('pages.school.common.validations.email.invalid'))
            .optional()
            .or(z.literal('')),
        website: z.string().optional(),
        logo: z.string().optional(),
        active: z.boolean().default(true),
    });

    type FormData = z.infer<typeof formSchema>;

    const updateMutation = schoolServiceHook.useUpdate();

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: school.name || '',
            address: school.address || '',
            city: school.city || '',
            state: school.state || '',
            zip: school.zip || '',
            phone: school.phone || '',
            email: school.email || '',
            website: school.website || '',
            logo: school.logo || '',
            active: school.active ?? true,
        },
    });

    const handleSubmit = async (values: FormData) => {
        toast.promise(
            updateMutation.mutateAsync({
                id: school.id,
                data: values,
            }),
            {
                loading: t('pages.school.common.messages.pending.update'),
                success: () => {
                    router.visit(route(`${ROUTES.SCHOOLS}.index`));
                    return t('pages.school.common.messages.success.update');
                },
                error: t('pages.school.common.messages.error.update'),
            },
        );
    };

    return (
        <AuthenticatedLayout title={t('pages.school.edit.title', { name: school?.name ?? '' })}>
            <Card>
                <CardHeader>
                    <CardTitle>{t('pages.school.edit.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
                            <FormField
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {t('pages.school.common.fields.name')}
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder={t(
                                                    'pages.school.common.placeholders.name',
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
                                            {t('pages.school.common.fields.address')}
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder={t(
                                                    'pages.school.common.placeholders.address',
                                                )}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                                name='address'
                                control={form.control}
                            />

                            <div className='grid grid-cols-2 gap-4'>
                                <FormField
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                {t('pages.school.common.fields.city')}
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder={t(
                                                        'pages.school.common.placeholders.city',
                                                    )}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                    name='city'
                                    control={form.control}
                                />

                                <FormField
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                {t('pages.school.common.fields.state')}
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder={t(
                                                        'pages.school.common.placeholders.state',
                                                    )}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                    name='state'
                                    control={form.control}
                                />
                            </div>

                            <div className='grid grid-cols-2 gap-4'>
                                <FormField
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                {t('pages.school.common.fields.zip')}
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder={t(
                                                        'pages.school.common.placeholders.zip',
                                                    )}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                    name='zip'
                                    control={form.control}
                                />

                                <FormField
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                {t('pages.school.common.fields.phone')}
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder={t(
                                                        'pages.school.common.placeholders.phone',
                                                    )}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                    name='phone'
                                    control={form.control}
                                />
                            </div>

                            <FormField
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {t('pages.school.common.fields.email')}
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type='email'
                                                placeholder={t(
                                                    'pages.school.common.placeholders.email',
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
                                            {t('pages.school.common.fields.website')}
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder={t(
                                                    'pages.school.common.placeholders.website',
                                                )}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                                name='website'
                                control={form.control}
                            />

                            <FormField
                                render={({ field }) => (
                                    <FormItem className='flex items-center justify-between rounded-lg border p-4'>
                                        <div className='space-y-0.5'>
                                            <FormLabel className='text-base'>
                                                {t('pages.school.common.fields.active')}
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
                                variant='update'
                                type='submit'
                                loading={updateMutation.isPending}
                                disabled={updateMutation.isPending}
                            >
                                {t('pages.school.edit.buttons.update')}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </AuthenticatedLayout>
    );
}
