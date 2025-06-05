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
import { PermissionResource } from '@/Support/Interfaces/Resources';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

interface Props {
    data: PermissionResource;
}

const formSchema = z.object({
    name: z
        .string()
        .min(1, 'Name is required')
        .regex(
            new RegExp(`^[a-z-]+-(?:${PERMISSION_VALID_ACTIONS.join('|')})$`),
            'Permission name must be in format: resource-action where action is one of: ' +
                PERMISSION_VALID_ACTIONS.join(', '),
        ),
});

type FormData = z.infer<typeof formSchema>;

export default function Edit({ data: permission }: Props) {
    const { t } = useLaravelReactI18n();
    const updateMutation = permissionServiceHook.useUpdate();

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: permission.name || '',
        },
    });

    const handleSubmit = async (values: FormData) => {
        // Extract group from permission name
        const group = values.name.split('-')[0];

        toast.promise(
            updateMutation.mutateAsync({
                id: permission.id,
                data: {
                    ...values,
                    group,
                },
            }),
            {
                loading: t('pages.permission.messages.loading'),
                success: () => {
                    router.visit(route(`${ROUTES.PERMISSIONS}.index`));
                    return t('pages.permission.messages.success');
                },
                error: t('pages.permission.messages.error'),
            },
        );
    };

    return (
        <AuthenticatedLayout title={`Edit Permission: ${permission.name}`}>
            <Card>
                <CardHeader>
                    <CardTitle>{t('pages.permission.edit.title')}</CardTitle>
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
                                loading={updateMutation.isPending}
                                disabled={updateMutation.isPending}
                            >
                                Update Permission
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </AuthenticatedLayout>
    );
}
