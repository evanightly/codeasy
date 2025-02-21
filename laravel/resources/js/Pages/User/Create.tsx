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
import { userServiceHook } from '@/Services/userServiceHook';
import { ROUTES } from '@/Support/Constants/routes';
import { UserResource } from '@/Support/Interfaces/Resources';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const formSchema = z
    .object({
        name: z.string().min(1, 'Name is required'),
        username: z.string().min(1, 'Username is required'),
        email: z.string().email('Invalid email').min(1, 'Email is required'),
        password: z.string().min(6, 'Password must be at least 6 characters'),
        password_confirmation: z.string(),
    })
    .refine((data) => data.password === data.password_confirmation, {
        message: "Passwords don't match",
        path: ['password_confirmation'],
    });

type FormData = z.infer<typeof formSchema>;

export default function Create() {
    const createMutation = userServiceHook.useCreate();

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            username: '',
            email: '',
            password: '',
            password_confirmation: '',
        },
    });

    const handleSubmit = async (values: FormData) => {
        const data: Partial<UserResource> = {
            ...values,
            password: values.password,
            password_confirmation: values.password_confirmation,
        };

        toast.promise(
            createMutation.mutateAsync({
                data,
            }),
            {
                loading: 'Creating user...',
                success: () => {
                    router.visit(route(`${ROUTES.USERS}.index`));
                    return 'User created successfully';
                },
                error: 'An error occurred while creating user',
            },
        );
    };

    return (
        <AuthenticatedLayout title='Create User'>
            <Card>
                <CardHeader>
                    <CardTitle>Create User</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
                            <FormField
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder='Enter name' {...field} />
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
                                        <FormLabel>Username</FormLabel>
                                        <FormControl>
                                            <Input placeholder='Enter username' {...field} />
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
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                type='email'
                                                placeholder='Enter email'
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
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                type='password'
                                                placeholder='Enter password'
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
                                        <FormLabel>Confirm Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                type='password'
                                                placeholder='Confirm password'
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

                            <Button
                                variant='update'
                                type='submit'
                                loading={createMutation.isPending}
                                disabled={createMutation.isPending}
                            >
                                Create User
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </AuthenticatedLayout>
    );
}
