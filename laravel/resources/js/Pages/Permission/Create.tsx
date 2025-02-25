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
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { permissionServiceHook } from '@/Services/permissionServiceHook';
import { PERMISSION_VALID_ACTIONS } from '@/Support/Constants/permissionValidActions';
import { ROUTES } from '@/Support/Constants/routes';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

export default function Create() {
    const { t } = useLaravelReactI18n();
    const createMutation = permissionServiceHook.useCreate();

    const formSchema = z.object({
        name: z
            .string()
            .min(1, t('pages.permission.common.validations.name.required'))
            .regex(
                new RegExp(`^[a-z-]+-(?:${PERMISSION_VALID_ACTIONS.join('|')})$`),
                t('pages.permission.common.validations.name.format', {
                    actions: PERMISSION_VALID_ACTIONS.join(', '),
                }),
            ),
    });

    type FormData = z.infer<typeof formSchema>;

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
        },
    });

    const handleSubmit = async (values: FormData) => {
        const group = values.name.split('-')[0];

        toast.promise(
            createMutation.mutateAsync({
                data: {
                    ...values,
                    group,
                },
            }),
            {
                loading: t('pages.permission.common.messages.pending.create'),
                success: () => {
                    router.visit(route(`${ROUTES.PERMISSIONS}.index`));
                    return t('pages.permission.common.messages.success.create');
                },
                error: t('pages.permission.common.messages.error.create'),
            },
        );
    };

    return (
        <AuthenticatedLayout title={t('pages.permission.create.title')}>
            <Card>
                <CardHeader>
                    <CardTitle>{t('pages.permission.create.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
                            <FormField
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {t('pages.permission.common.fields.name')}
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder={t(
                                                    'pages.permission.common.placeholders.name',
                                                )}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                        <p className='text-sm text-muted-foreground'>
                                            {t('pages.permission.common.help_texts.valid_actions', {
                                                actions: PERMISSION_VALID_ACTIONS.join(', '),
                                            })}
                                        </p>
                                    </FormItem>
                                )}
                                name='name'
                                control={form.control}
                            />

                            <Button
                                variant='update'
                                type='submit'
                                loading={createMutation.isPending}
                                disabled={createMutation.isPending}
                            >
                                {t('pages.permission.create.buttons.create')}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </AuthenticatedLayout>
    );
}
