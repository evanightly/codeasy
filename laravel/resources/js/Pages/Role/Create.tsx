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
import { permissionServiceHook } from '@/Services/permissionServiceHook';
import { roleServiceHook } from '@/Services/roleServiceHook';
import { ROUTES } from '@/Support/Constants/routes';
import { ServiceFilterOptions } from '@/Support/Interfaces/Others';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

export default function Create() {
    const { t } = useLaravelReactI18n();
    const createMutation = roleServiceHook.useCreate();
    const [permissionFilters, _setPermissionFilters] = useState<ServiceFilterOptions>({
        page: 1,
        page_size: 'all',
    });
    const { data: permissions, isLoading } = permissionServiceHook.useGetAll({
        filters: permissionFilters,
    });

    const formSchema = z.object({
        name: z.string().min(1, t('pages.role.common.validations.name.required')),
        guard_name: z.string().default('web'),
        permissions: z.array(z.number()).default([]),
    });

    type FormData = z.infer<typeof formSchema>;

    const handleSubmit = async (values: FormData) => {
        toast.promise(
            createMutation.mutateAsync({
                data: {
                    ...values,
                    permissions: values.permissions,
                },
            }),
            {
                loading: t('pages.role.common.messages.pending.create'),
                success: () => {
                    router.visit(route(`${ROUTES.ROLES}.index`));
                    return t('pages.role.common.messages.success.create');
                },
                error: t('pages.role.common.messages.error.create'),
            },
        );
    };

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            guard_name: 'web',
            permissions: [],
        },
    });

    // Group permissions by their group property
    const groupedPermissions = permissions?.data?.reduce(
        (acc, permission) => {
            const group = permission.group || 'Other';
            if (!acc[group]) {
                acc[group] = [];
            }
            acc[group].push(permission);
            return acc;
        },
        {} as Record<string, typeof permissions.data>,
    );

    const toggleGroupPermissions = (group: string, checked: boolean) => {
        const groupPermissionIds = groupedPermissions?.[group]?.map((p) => p.id) || [];
        const currentPermissions = form.getValues('permissions');

        if (checked) {
            // Add all permissions from group
            form.setValue('permissions', [
                ...new Set([...currentPermissions, ...groupPermissionIds]),
            ]);
        } else {
            // Remove all permissions from group
            form.setValue(
                'permissions',
                currentPermissions.filter((id) => !groupPermissionIds.includes(id)),
            );
        }
    };

    return (
        <AuthenticatedLayout title={t('pages.role.create.title')}>
            <Card>
                <CardHeader>
                    <CardTitle>{t('pages.role.create.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
                            <FormField
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('pages.role.common.fields.name')}</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder={t(
                                                    'pages.role.common.placeholders.name',
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

                            <div className='space-y-4'>
                                <h3 className='text-lg font-medium'>
                                    {t('pages.role.common.fields.permissions')}
                                </h3>
                                {isLoading ? (
                                    <p>{t('action.loading')}</p>
                                ) : (
                                    <FormField
                                        render={({ field }) => (
                                            <div className='space-y-4'>
                                                {Object.entries(groupedPermissions || {}).map(
                                                    ([group, perms]) => (
                                                        <div key={group} className='space-y-2'>
                                                            <div className='flex items-center gap-2'>
                                                                <Checkbox
                                                                    onCheckedChange={(checked) =>
                                                                        toggleGroupPermissions(
                                                                            group,
                                                                            checked as unknown as boolean,
                                                                        )
                                                                    }
                                                                    data-testid={`group-checkbox-${group.toLowerCase().replace(/\s+/g, '-')}`}
                                                                    checked={perms.every((p) =>
                                                                        field.value.includes(p.id),
                                                                    )}
                                                                />
                                                                <h4 className='font-medium'>
                                                                    {group}
                                                                </h4>
                                                            </div>
                                                            <div className='ml-6 grid grid-cols-2 gap-2'>
                                                                {perms.map((permission) => (
                                                                    <div
                                                                        key={permission.id}
                                                                        className='flex items-center gap-2'
                                                                    >
                                                                        <Checkbox
                                                                            onCheckedChange={(
                                                                                checked,
                                                                            ) => {
                                                                                if (checked) {
                                                                                    field.onChange([
                                                                                        ...field.value,
                                                                                        permission.id,
                                                                                    ]);
                                                                                } else {
                                                                                    field.onChange(
                                                                                        field.value.filter(
                                                                                            (id) =>
                                                                                                id !==
                                                                                                permission.id,
                                                                                        ),
                                                                                    );
                                                                                }
                                                                            }}
                                                                            id={`permission-${permission.id}`}
                                                                            data-testid={`permission-checkbox-${permission.id}`}
                                                                            checked={field.value.includes(
                                                                                permission.id,
                                                                            )}
                                                                        />
                                                                        <label
                                                                            htmlFor={`permission-${permission.id}`}
                                                                        >
                                                                            {permission.name}
                                                                        </label>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        )}
                                        name='permissions'
                                        control={form.control}
                                    />
                                )}
                            </div>

                            <Button
                                variant='update'
                                type='submit'
                                loading={createMutation.isPending}
                                disabled={createMutation.isPending}
                            >
                                {t('pages.role.create.buttons.create')}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </AuthenticatedLayout>
    );
}
