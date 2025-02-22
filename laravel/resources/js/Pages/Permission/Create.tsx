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
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

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

export default function Create() {
    const createMutation = permissionServiceHook.useCreate();

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
        },
    });

    const handleSubmit = async (values: FormData) => {
        // Extract group from permission name
        const group = values.name.split('-')[0];

        toast.promise(
            createMutation.mutateAsync({
                data: {
                    ...values,
                    group,
                },
            }),
            {
                loading: 'Creating permission...',
                success: () => {
                    router.visit(route(`${ROUTES.PERMISSIONS}.index`));
                    return 'Permission created successfully';
                },
                error: 'An error occurred while creating permission',
            },
        );
    };

    return (
        <AuthenticatedLayout title='Create Permission'>
            <Card>
                <CardHeader>
                    <CardTitle>Create Permission</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
                            <FormField
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Permission Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder='e.g., users-create, roles-read'
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                        <p className='text-sm text-muted-foreground'>
                                            Valid actions: {PERMISSION_VALID_ACTIONS.join(', ')}
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
                                Create Permission
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </AuthenticatedLayout>
    );
}
