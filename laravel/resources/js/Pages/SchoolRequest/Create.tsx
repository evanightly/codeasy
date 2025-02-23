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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/UI/select';
import { Textarea } from '@/Components/UI/textarea';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { schoolRequestServiceHook } from '@/Services/schoolRequestServiceHook';
import { schoolServiceHook } from '@/Services/schoolServiceHook';
import { userServiceHook } from '@/Services/userServiceHook';
import { ROUTES } from '@/Support/Constants/routes';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const formSchema = z.object({
    user_id: z.coerce.number().min(1, 'User is required'),
    school_id: z.coerce.number().min(1, 'School is required'),
    message: z.string().min(1, 'Message is required'),
});

type FormData = z.infer<typeof formSchema>;

export default function Create() {
    const createMutation = schoolRequestServiceHook.useCreate();
    const { data: users } = userServiceHook.useGetAll();
    const { data: schools } = schoolServiceHook.useGetAll();

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            user_id: undefined,
            school_id: undefined,
            message: '',
        },
    });

    const handleSubmit = async (values: FormData) => {
        toast.promise(createMutation.mutateAsync({ data: values }), {
            loading: 'Creating request...',
            success: () => {
                router.visit(route(`${ROUTES.SCHOOL_REQUESTS}.index`));
                return 'Request created successfully';
            },
            error: 'An error occurred while creating request',
        });
    };

    return (
        <AuthenticatedLayout title='Create School Request'>
            <Card>
                <CardHeader>
                    <CardTitle>Create School Request</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
                            <FormField
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>User</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value?.toString()}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='Select a user' />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {users?.data?.map((user) => (
                                                    <SelectItem
                                                        value={user.id.toString()}
                                                        key={user.id}
                                                    >
                                                        {user.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                                name='user_id'
                                control={form.control}
                            />

                            <FormField
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>School</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value?.toString()}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='Select a school' />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {schools?.data?.map((school) => (
                                                    <SelectItem
                                                        value={school.id.toString()}
                                                        key={school.id}
                                                    >
                                                        {school.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                                name='school_id'
                                control={form.control}
                            />

                            <FormField
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Message</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder='Enter request message'
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                                name='message'
                                control={form.control}
                            />

                            <Button
                                variant='create'
                                type='submit'
                                loading={createMutation.isPending}
                                disabled={createMutation.isPending}
                            >
                                Create Request
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </AuthenticatedLayout>
    );
}
